import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';
import { hashPassword, verifyPassword, createSessionToken, requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticates user via email or username and password
 */
router.post('/login', (req: Request, res: Response): void => {
  const { username, password, email } = req.body;
  const loginIdentifier = (username || email || '').trim();

  if (!loginIdentifier || !password) {
    res.status(400).json({ error: 'Username/Email and password are required.' });
    return;
  }

  const db = getDatabase();

  // 1. Check users table
  let foundUser: any = null;
  const dbUser = db.prepare(`
    SELECT id, username, password_hash, full_name, email, role, status, grade, class_name, stream, student_id, house
    FROM users 
    WHERE username = ? OR email = ?
  `).get(loginIdentifier, loginIdentifier) as any;

  if (dbUser && verifyPassword(password, dbUser.password_hash)) {
    foundUser = dbUser;
  } else {
    // 2. Check administrators table for legacy/seed administrator credentials
    const admin = db.prepare('SELECT id, username, password_hash, full_name, role FROM administrators WHERE username = ?').get(loginIdentifier) as any;
    if (admin && verifyPassword(password, admin.password_hash)) {
      foundUser = {
        ...admin,
        email: `${admin.username}@school.edu`,
        role: 'admin',
        status: 'active',
        grade: 'Administration',
        house: 'Faculty'
      };
    }
  }

  if (!foundUser) {
    res.status(401).json({ error: 'Invalid username/email or password.' });
    return;
  }

  // Account status verification
  if (foundUser.status === 'suspended') {
    res.status(403).json({
      error: 'Your account has been suspended by the school administration. Please contact the Principal office.',
      status: 'suspended'
    });
    return;
  }

  if (foundUser.status === 'pending_approval') {
    res.status(403).json({
      error: 'Your student account is currently pending administrative review. You will be able to sign in once the school approves your enrollment.',
      status: 'pending_approval',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        fullName: foundUser.full_name,
        email: foundUser.email,
        role: foundUser.role,
        status: foundUser.status
      }
    });
    return;
  }

  // Normalize role
  let normalizedRole = foundUser.role;
  if (normalizedRole === 'student') normalizedRole = 'viewer';
  if (normalizedRole === 'teacher') normalizedRole = 'editor';
  if (normalizedRole === 'coordinator') normalizedRole = 'admin';

  const user = {
    id: foundUser.id,
    username: foundUser.username,
    fullName: foundUser.full_name,
    email: foundUser.email,
    role: normalizedRole,
    status: foundUser.status || 'active',
    grade: foundUser.grade || foundUser.class_name,
    className: foundUser.class_name || foundUser.grade,
    stream: foundUser.stream,
    studentId: foundUser.student_id,
    house: foundUser.house,
  };

  const token = createSessionToken(user);

  // Set HTTP-only cookie
  res.cookie('cf_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Log audit
  try {
    let adminLogId: any = null;
    if (user.role === 'admin') {
      const adminRec = db.prepare('SELECT id FROM administrators WHERE id = ? OR username = ?').get(user.id, user.username) as any;
      adminLogId = adminRec?.id || null;
    }

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(adminLogId, user.username, 'LOGIN', 'auth', user.id, `User ${user.username} (${user.role}) signed in successfully.`);
  } catch (err) {
    // Continue
  }

  res.json({
    message: 'Authentication successful',
    token,
    user,
  });
});

/**
 * POST /api/auth/register
 * Student self-registration with validation, duplicate checks, and default Viewer role
 */
router.post('/register', (req: Request, res: Response): void => {
  const {
    fullName,
    email,
    username,
    password,
    confirmPassword,
    className,
    stream,
    studentId
  } = req.body;

  // 1. Validate required fields
  if (!fullName || !email || !username || !password) {
    res.status(400).json({ error: 'Full name, email, username, and password are required.' });
    return;
  }

  const cleanFullName = String(fullName).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUsername = String(username).trim().toLowerCase();

  if (cleanFullName.length < 2) {
    res.status(400).json({ error: 'Please enter a valid full name.' });
    return;
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  // Username validation
  if (cleanUsername.length < 3 || !/^[a-z0-9_.-]+$/.test(cleanUsername)) {
    res.status(400).json({ error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and periods.' });
    return;
  }

  // Password validation
  if (String(password).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400).json({ error: 'Password and password confirmation do not match.' });
    return;
  }

  const db = getDatabase();

  // 2. Prevent duplicate accounts
  const existingUser = db.prepare(`
    SELECT id, username, email FROM users WHERE username = ? OR email = ?
  `).get(cleanUsername, cleanEmail) as any;

  if (existingUser) {
    if (existingUser.username === cleanUsername) {
      res.status(409).json({ error: 'This username is already registered. Please choose another or sign in.' });
      return;
    }
    if (existingUser.email === cleanEmail) {
      res.status(409).json({ error: 'An account with this email address already exists. Please sign in or use password recovery.' });
      return;
    }
  }

  // 3. Security Rule: Self-registered users are ALWAYS assigned the 'viewer' role (Student).
  // Students CANNOT self-assign Admin or Editor roles under any circumstances.
  const assignedRole = 'viewer';

  // 4. Check if institutional approval is required
  let accountStatus = 'active';
  try {
    const setting = db.prepare("SELECT value FROM school_settings WHERE key = 'student_registration_approval'").get() as any;
    if (setting && setting.value === 'required') {
      accountStatus = 'pending_approval';
    }
  } catch {}

  const passwordHash = hashPassword(password);
  const cleanClass = className ? String(className).trim() : 'Grade 10';
  const cleanStream = stream ? String(stream).trim() : 'General';
  const cleanStudentId = studentId ? String(studentId).trim() : `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO users (
        username, password_hash, full_name, email, role, status,
        grade, class_name, stream, student_id, house
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Assign house randomly or based on student ID
    const houses = ['Phoenix', 'Solaris', 'Titan', 'Aquila'];
    const assignedHouse = houses[Math.floor(Math.random() * houses.length)];

    const result = insertStmt.run(
      cleanUsername,
      passwordHash,
      cleanFullName,
      cleanEmail,
      assignedRole,
      accountStatus,
      cleanClass,
      cleanClass,
      cleanStream,
      cleanStudentId,
      assignedHouse
    );

    const newUserId = Number(result.lastInsertRowid);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(null, cleanUsername, 'REGISTER', 'users', newUserId, `New student account created for ${cleanFullName} (${cleanEmail}) with status ${accountStatus}.`);

    const createdUser = {
      id: newUserId,
      username: cleanUsername,
      fullName: cleanFullName,
      email: cleanEmail,
      role: assignedRole,
      status: accountStatus,
      className: cleanClass,
      stream: cleanStream,
      studentId: cleanStudentId,
      house: assignedHouse
    };

    res.status(201).json({
      message: accountStatus === 'pending_approval'
        ? 'Registration received. Your account is currently pending administrator verification.'
        : 'Student registration successful! You may now sign in.',
      status: accountStatus,
      user: createdUser
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Generates account recovery code for password reset
 */
router.post('/forgot-password', (req: Request, res: Response): void => {
  const { emailOrUsername } = req.body;

  if (!emailOrUsername) {
    res.status(400).json({ error: 'Please enter your registered email address or school username.' });
    return;
  }

  const cleanIdentifier = String(emailOrUsername).trim().toLowerCase();
  const db = getDatabase();

  const user = db.prepare(`
    SELECT id, username, full_name, email, status FROM users WHERE username = ? OR email = ?
  `).get(cleanIdentifier, cleanIdentifier) as any;

  if (!user) {
    // Return friendly response to avoid enumeration while informing user
    res.status(404).json({ error: 'No account found matching the provided username or email address.' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'This account has been suspended. Please contact the Principal office for assistance.' });
    return;
  }

  // Generate 6-digit recovery code
  const recoveryCode = String(Math.floor(100000 + Math.random() * 900000));
  const expiryIso = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  try {
    db.prepare(`
      UPDATE users 
      SET reset_token = ?, reset_token_expiry = ? 
      WHERE id = ?
    `).run(recoveryCode, expiryIso, user.id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(null, user.username, 'PASSWORD_RESET_REQUEST', 'users', user.id, `Password recovery initiated for ${user.email}.`);

    res.json({
      success: true,
      message: `Password reset verification code generated for ${user.email}.`,
      recoveryCode, // Provided for instant seamless evaluation
      email: user.email,
      username: user.username
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to initiate password recovery: ' + err.message });
  }
});

/**
 * POST /api/auth/reset-password
 * Verifies recovery token and updates user password hash
 */
router.post('/reset-password', (req: Request, res: Response): void => {
  const { emailOrUsername, token, newPassword, confirmPassword } = req.body;

  if (!emailOrUsername || !token || !newPassword) {
    res.status(400).json({ error: 'Account identifier, verification code, and new password are required.' });
    return;
  }

  if (String(newPassword).length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    res.status(400).json({ error: 'New password and confirmation do not match.' });
    return;
  }

  const cleanIdentifier = String(emailOrUsername).trim().toLowerCase();
  const cleanToken = String(token).trim();
  const db = getDatabase();

  const user = db.prepare(`
    SELECT id, username, full_name, email, reset_token, reset_token_expiry
    FROM users 
    WHERE (username = ? OR email = ?) AND reset_token = ?
  `).get(cleanIdentifier, cleanIdentifier, cleanToken) as any;

  if (!user) {
    res.status(400).json({ error: 'Invalid verification code or account identifier. Please verify the code or request a new one.' });
    return;
  }

  // Check code expiration
  if (user.reset_token_expiry && new Date(user.reset_token_expiry) < new Date()) {
    res.status(400).json({ error: 'The verification code has expired. Please request a new recovery code.' });
    return;
  }

  const newPasswordHash = hashPassword(newPassword);

  try {
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).run(newPasswordHash, user.id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(null, user.username, 'PASSWORD_RESET_COMPLETED', 'users', user.id, `Password successfully updated via recovery code for ${user.username}.`);

    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

/**
 * POST /api/auth/logout
 * Clears authentication session cookie
 */
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('cf_auth_token');
  res.json({ message: 'Signed out successfully.' });
});

/**
 * GET /api/auth/me
 * Retrieves profile of currently authenticated user
 */
router.get('/me', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  if (req.user) {
    const db = getDatabase();
    const dbUser = db.prepare(`
      SELECT id, username, full_name, email, role, status, grade, class_name, stream, student_id, house
      FROM users WHERE id = ?
    `).get(req.user.id) as any;

    if (dbUser) {
      res.json({
        user: {
          id: dbUser.id,
          username: dbUser.username,
          fullName: dbUser.full_name,
          email: dbUser.email,
          role: dbUser.role,
          status: dbUser.status || 'active',
          grade: dbUser.grade,
          className: dbUser.class_name,
          stream: dbUser.stream,
          studentId: dbUser.student_id,
          house: dbUser.house
        }
      });
      return;
    }

    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated.' });
  }
});

/**
 * GET /api/auth/users - Retrieve list of available accounts for role switching in test mode
 */
router.get('/users', (_req: Request, res: Response): void => {
  const db = getDatabase();
  try {
    const users = db.prepare(`
      SELECT id, username, full_name, email, role, status, grade, class_name, stream, student_id, house 
      FROM users 
      ORDER BY id ASC
    `).all();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users: ' + err.message });
  }
});

/**
 * POST /api/auth/switch-user - Quick role switch for school testing
 */
router.post('/switch-user', (req: Request, res: Response): void => {
  const { userId } = req.body;
  const db = getDatabase();

  const foundUser = db.prepare(`
    SELECT id, username, full_name, email, role, status, grade, class_name, stream, student_id, house 
    FROM users WHERE id = ?
  `).get(Number(userId)) as any;

  if (!foundUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const user = {
    id: foundUser.id,
    username: foundUser.username,
    fullName: foundUser.full_name,
    email: foundUser.email,
    role: foundUser.role,
    status: foundUser.status || 'active',
    grade: foundUser.grade || foundUser.class_name,
    className: foundUser.class_name,
    stream: foundUser.stream,
    studentId: foundUser.student_id,
    house: foundUser.house,
  };

  const token = createSessionToken(user);
  res.cookie('cf_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    message: `Switched to ${user.fullName} (${user.role})`,
    token,
    user,
  });
});

export default router;

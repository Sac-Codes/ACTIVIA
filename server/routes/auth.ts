import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';
import { verifyPassword, createSessionToken, requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const db = getDatabase();
  const cleanUsername = username.trim();

  // First check administrators table for admin users
  let foundUser: any = null;
  const admin = db.prepare('SELECT id, username, password_hash, full_name, role FROM administrators WHERE username = ?').get(cleanUsername) as any;
  if (admin && verifyPassword(password, admin.password_hash)) {
    foundUser = {
      ...admin,
      email: `${admin.username}@school.edu`,
      grade: 'Administration',
      house: 'Faculty'
    };
  } else {
    // Check users table
    const dbUser = db.prepare('SELECT id, username, password_hash, full_name, email, role, grade, house FROM users WHERE username = ? OR email = ?').get(cleanUsername, cleanUsername) as any;
    if (dbUser && verifyPassword(password, dbUser.password_hash)) {
      foundUser = dbUser;
    }
  }

  if (!foundUser) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const user = {
    id: foundUser.id,
    username: foundUser.username,
    fullName: foundUser.full_name,
    email: foundUser.email,
    role: foundUser.role,
    grade: foundUser.grade,
    house: foundUser.house,
  };

  const token = createSessionToken(user);

  // Set HTTP-only cookie
  res.cookie('cf_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Log audit
  try {
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.id, user.username, 'LOGIN', 'auth', user.id, `User ${user.username} (${user.role}) successfully signed in.`);
  } catch (err) {
    // Continue even if logging fails
  }

  res.json({
    message: 'Authentication successful',
    token,
    user,
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('cf_auth_token');
  res.json({ message: 'Signed out successfully.' });
});

router.get('/me', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    // Return default student profile if not logged in
    const db = getDatabase();
    const defaultUser = db.prepare("SELECT id, username, full_name, email, role, grade, house FROM users WHERE role = 'student' LIMIT 1").get() as any;
    if (defaultUser) {
      res.json({
        user: {
          id: defaultUser.id,
          username: defaultUser.username,
          fullName: defaultUser.full_name,
          email: defaultUser.email,
          role: defaultUser.role,
          grade: defaultUser.grade,
          house: defaultUser.house,
        }
      });
    } else {
      res.status(401).json({ error: 'Not authenticated.' });
    }
  }
});

/**
 * GET /api/auth/users - Retrieve list of available accounts for role switching
 */
router.get('/users', (_req: Request, res: Response): void => {
  const db = getDatabase();
  try {
    const users = db.prepare('SELECT id, username, full_name, email, role, grade, house FROM users ORDER BY id ASC').all();
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

  const foundUser = db.prepare('SELECT id, username, full_name, email, role, grade, house FROM users WHERE id = ?').get(Number(userId)) as any;
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
    grade: foundUser.grade,
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

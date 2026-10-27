import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';
import { verifyPassword, createSessionToken, requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const db = getDatabase();
  const admin = db.prepare('SELECT id, username, password_hash, full_name, role FROM administrators WHERE username = ?').get(username.trim()) as any;

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const user = {
    id: admin.id,
    username: admin.username,
    fullName: admin.full_name,
    role: admin.role,
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
    `).run(user.id, user.username, 'LOGIN', 'auth', user.id, `Administrator ${user.username} successfully signed in.`);
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

router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});

export default router;

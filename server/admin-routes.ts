import type { Express, Request, Response, NextFunction } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPosts,
  deletePost,
  getMessages,
  getMatches,
  getBroadcasts,
  getStats,
} from './admin-store';

const COOKIE_NAME = 'wriggle_admin';

function makeToken(userId: string): string {
  const payload = `admin:${userId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

function parseToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts[0] !== 'admin' || !parts[1]) return null;
    return parts[1];
  } catch {
    return null;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const userId = parseToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const user = getUserById(userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Not an admin' });
  }
  (req as any).adminUserId = userId;
  next();
}

export function registerAdminRoutes(app: Express): void {
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'User is not an admin' });
    }
    const token = makeToken(userId);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ ok: true, user: { id: user.id, name: user.name } });
  });

  app.post('/api/admin/logout', (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
    const user = getUserById((req as any).adminUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name });
  });

  app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
    res.json(getStats());
  });

  app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    res.json(getUsers(search));
  });

  app.get('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
    const user = getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.patch('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
    const updated = updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
    const ok = deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  });

  app.get('/api/admin/posts', requireAdmin, (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    res.json(getPosts(type));
  });

  app.delete('/api/admin/posts/:id', requireAdmin, (req: Request, res: Response) => {
    const ok = deletePost(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Post not found' });
    res.json({ ok: true });
  });

  app.get('/api/admin/messages', requireAdmin, (req: Request, res: Response) => {
    const matchId = req.query.matchId as string | undefined;
    res.json(getMessages(matchId));
  });

  app.get('/api/admin/matches', requireAdmin, (_req: Request, res: Response) => {
    res.json(getMatches());
  });

  app.get('/api/admin/broadcasts', requireAdmin, (_req: Request, res: Response) => {
    res.json(getBroadcasts());
  });
}

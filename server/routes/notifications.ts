import { Router, Response } from 'express';
import { getDatabase, saveDatabase } from '../db';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const role = req.user!.role;

  const items = db.notifications
    .filter((n) => n.recipientId === userId || (role === 'ADMIN' && n.recipientId === 'admin'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  const unreadCount = items.filter((n) => !n.read).length;

  res.json({ items, unreadCount });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === req.params.id);

  if (notif) {
    notif.read = true;
    saveDatabase(db);
  }

  res.json({ message: 'Marked as read.' });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const role = req.user!.role;

  db.notifications.forEach((n) => {
    if (n.recipientId === userId || (role === 'ADMIN' && n.recipientId === 'admin')) {
      n.read = true;
    }
  });

  saveDatabase(db);
  res.json({ message: 'All notifications marked as read.' });
});

export default router;

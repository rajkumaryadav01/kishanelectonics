import { Router, Response } from 'express';
import { getDatabase, saveDatabase } from '../db';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/wishlist
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const productIds = db.wishlists[userId] || [];
  const products = db.products.filter((p) => productIds.includes(p.id) && p.active);

  res.json({
    productIds,
    products: products.map((p) => ({
      ...p,
      categoryName: db.categories.find((c) => c.id === p.categoryId)?.name || 'Components',
    })),
  });
});

// POST /api/wishlist/toggle
router.post('/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  const db = getDatabase();
  const userId = req.user!.userId;

  if (!db.wishlists[userId]) {
    db.wishlists[userId] = [];
  }

  const list = db.wishlists[userId];
  const idx = list.indexOf(productId);
  let wishlisted = false;

  if (idx > -1) {
    list.splice(idx, 1);
    wishlisted = false;
  } else {
    list.push(productId);
    wishlisted = true;
  }

  saveDatabase(db);
  res.json({ wishlisted, productIds: list });
});

export default router;

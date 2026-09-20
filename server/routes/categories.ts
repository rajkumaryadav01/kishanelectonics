import { Router, Request, Response } from 'express';
import { getDatabase } from '../db';

const router = Router();

// GET /api/categories
router.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const categoriesWithCounts = db.categories
    .filter((c) => c.active)
    .map((c) => {
      const count = db.products.filter((p) => p.categoryId === c.id && p.active).length;
      return {
        ...c,
        productCount: count,
      };
    });

  res.json(categoriesWithCounts);
});

// GET /api/categories/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const db = getDatabase();
  const cat = db.categories.find(
    (c) => c.id === req.params.idOrSlug || c.slug === req.params.idOrSlug
  );

  if (!cat) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }

  const products = db.products.filter((p) => p.categoryId === cat.id && p.active);
  res.json({
    ...cat,
    productCount: products.length,
    products,
  });
});

export default router;

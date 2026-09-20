import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, ProjectKit } from '../db';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// GET /api/project-kits
router.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const kits = db.projectKits.filter((k) => k.active);
  res.json(kits);
});

// GET /api/project-kits/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const db = getDatabase();
  const kit = db.projectKits.find(
    (k) => k.id === req.params.idOrSlug || k.slug === req.params.idOrSlug
  );

  if (!kit) {
    res.status(404).json({ error: 'Project kit not found.' });
    return;
  }

  res.json(kit);
});

// POST /api/admin/project-kits
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, price, originalPrice, description, imageUrl, components, difficulty, category, stockQuantity } = req.body;

  if (!name || !price || !description) {
    res.status(400).json({ error: 'Name, price, and description are required for a project kit.' });
    return;
  }

  const db = getDatabase();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newKit: ProjectKit = {
    id: `kit_${Date.now()}`,
    name: name.trim(),
    slug: `${slug}-${Date.now().toString(36)}`,
    sku: `KIT-${Date.now().toString(36).toUpperCase()}`,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    description: description.trim(),
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    components: Array.isArray(components) ? components : [],
    difficulty: difficulty || 'Beginner',
    category: category || 'General Electronics',
    stockQuantity: Number(stockQuantity) || 10,
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.projectKits.push(newKit);
  saveDatabase(db);

  res.status(201).json(newKit);
});

// PUT /api/admin/project-kits/:id
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const kit = db.projectKits.find((k) => k.id === req.params.id);

  if (!kit) {
    res.status(404).json({ error: 'Kit not found.' });
    return;
  }

  const { name, price, originalPrice, description, imageUrl, components, difficulty, category, stockQuantity, active } = req.body;

  if (name !== undefined) kit.name = name.trim();
  if (price !== undefined) kit.price = Number(price);
  if (originalPrice !== undefined) kit.originalPrice = Number(originalPrice);
  if (description !== undefined) kit.description = description.trim();
  if (imageUrl !== undefined) kit.imageUrl = imageUrl;
  if (components !== undefined) kit.components = components;
  if (difficulty !== undefined) kit.difficulty = difficulty;
  if (category !== undefined) kit.category = category;
  if (stockQuantity !== undefined) kit.stockQuantity = Number(stockQuantity);
  if (active !== undefined) kit.active = Boolean(active);

  saveDatabase(db);
  res.json(kit);
});

// DELETE /api/admin/project-kits/:id
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const kit = db.projectKits.find((k) => k.id === req.params.id);

  if (!kit) {
    res.status(404).json({ error: 'Kit not found.' });
    return;
  }

  kit.active = false; // Soft delete
  saveDatabase(db);
  res.json({ message: 'Project kit deactivated.' });
});

export default router;

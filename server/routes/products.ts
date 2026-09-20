import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, Review, ProductQuestion } from '../db';
import { requireAuth, AuthenticatedRequest, optionalAuth } from '../auth';

const router = Router();

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    featured,
    popular,
    sort,
    suggest,
    limit,
    page,
  } = req.query;

  let filtered = db.products.filter((p) => p.active);

  // If autocomplete suggestions requested
  if (suggest === 'true' && search) {
    const q = String(search).toLowerCase().trim();
    const suggestions = filtered
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.modelNumber && p.modelNumber.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        image: p.images[0] || '',
        category: db.categories.find((c) => c.id === p.categoryId)?.name || '',
      }));
    res.json(suggestions);
    return;
  }

  // Search by name, SKU, modelNumber, brand, category, description
  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter((p) => {
      const catName = db.categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.modelNumber && p.modelNumber.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        catName.includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }

  // Filter by category id or slug
  if (category && category !== 'all') {
    const matchedCategory = db.categories.find(
      (c) => c.id === category || c.slug === category || c.name.toLowerCase() === String(category).toLowerCase()
    );
    if (matchedCategory) {
      filtered = filtered.filter((p) => p.categoryId === matchedCategory.id);
    }
  }

  // Filter by brand
  if (brand && brand !== 'all') {
    filtered = filtered.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) {
      filtered = filtered.filter((p) => p.price >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) {
      filtered = filtered.filter((p) => p.price <= max);
    }
  }

  // Filter in-stock only
  if (inStock === 'true') {
    filtered = filtered.filter((p) => p.stockQuantity > 0);
  }

  // Filter featured / popular
  if (featured === 'true') {
    filtered = filtered.filter((p) => p.isFeatured);
  }
  if (popular === 'true') {
    filtered = filtered.filter((p) => p.isPopular);
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
    default:
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  // Attach category names
  const enrichedProducts = filtered.map((p) => ({
    ...p,
    categoryName: db.categories.find((c) => c.id === p.categoryId)?.name || 'Components',
  }));

  const total = enrichedProducts.length;
  const pageSize = limit ? parseInt(String(limit), 10) : 50;
  const currentPage = page ? parseInt(String(page), 10) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = enrichedProducts.slice(startIndex, startIndex + pageSize);

  res.json({
    total,
    page: currentPage,
    totalPages: Math.ceil(total / pageSize),
    products: paginated,
  });
});

// GET /api/products/compare
router.get('/compare', (req: Request, res: Response) => {
  const db = getDatabase();
  const idsQuery = String(req.query.ids || '');
  const ids = idsQuery.split(',').filter(Boolean);

  if (ids.length === 0) {
    res.status(400).json({ error: 'Please provide product IDs to compare.' });
    return;
  }

  const products = db.products.filter((p) => ids.includes(p.id));
  const allSpecKeys = new Set<string>();

  products.forEach((p) => {
    Object.keys(p.specifications || {}).forEach((k) => allSpecKeys.add(k));
  });

  res.json({
    products: products.map((p) => ({
      ...p,
      categoryName: db.categories.find((c) => c.id === p.categoryId)?.name,
    })),
    specificationKeys: Array.from(allSpecKeys),
  });
});

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const category = db.categories.find((c) => c.id === product.categoryId);
  const reviews = db.reviews.filter((r) => r.productId === product.id && r.approved);
  const questions = db.questions.filter((q) => q.productId === product.id);

  // Related products from same category
  const relatedProducts = db.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.active)
    .slice(0, 4)
    .map((p) => ({
      ...p,
      categoryName: category?.name || 'Components',
    }));

  res.json({
    ...product,
    categoryName: category?.name || 'Components',
    categorySlug: category?.slug,
    reviews,
    questions,
    relatedProducts,
  });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const { rating, comment } = req.body;
  const numRating = Number(rating);

  if (!numRating || numRating < 1 || numRating > 5) {
    res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    return;
  }

  if (!comment || comment.trim().length < 5) {
    res.status(400).json({ error: 'Comment must be at least 5 characters.' });
    return;
  }

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    productId: product.id,
    userId: req.user!.userId,
    userName: req.user!.name,
    rating: numRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
    approved: true, // Auto-approved by default, admin can moderate
  };

  db.reviews.push(newReview);

  // Recalculate product rating
  const productReviews = db.reviews.filter((r) => r.productId === product.id && r.approved);
  const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviewCount = productReviews.length;

  saveDatabase(db);
  res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
});

// POST /api/products/:id/questions
router.post('/:id/questions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const { question } = req.body;
  if (!question || question.trim().length < 5) {
    res.status(400).json({ error: 'Please enter a question of at least 5 characters.' });
    return;
  }

  const newQuestion: ProductQuestion = {
    id: `q_${Date.now()}`,
    productId: product.id,
    userId: req.user!.userId,
    userName: req.user!.name,
    question: question.trim(),
    createdAt: new Date().toISOString(),
  };

  db.questions.push(newQuestion);

  // Add notification for admin
  db.notifications.push({
    id: `notif_${Date.now()}`,
    recipientId: 'admin',
    title: 'New Product Question',
    message: `${req.user!.name} asked a question on ${product.name}`,
    type: 'enquiry',
    read: false,
    linkUrl: `/products/${product.id}`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  res.status(201).json({ message: 'Your question has been submitted to Kishan Electronics technicians.', question: newQuestion });
});

export default router;

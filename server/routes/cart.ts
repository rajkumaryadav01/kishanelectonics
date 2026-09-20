import { Router, Response } from 'express';
import { getDatabase, saveDatabase, CartItem } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

function getSessionCartKey(req: AuthenticatedRequest): string {
  if (req.user?.userId) {
    return req.user.userId;
  }
  // If guest, use custom guest-id header or cookie, fallback to 'guest_session'
  const guestHeader = req.headers['x-guest-id'] as string;
  return guestHeader ? `guest_${guestHeader}` : 'guest_default';
}

// GET /api/cart
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const cartKey = getSessionCartKey(req);
  const cart = db.carts[cartKey] || { userId: cartKey, items: [], updatedAt: new Date().toISOString() };

  // Re-verify items against current stock and prices
  let hasChanges = false;
  const verifiedItems: CartItem[] = [];

  for (const item of cart.items) {
    if (item.isKit) {
      const kit = db.projectKits.find((k) => k.id === item.productId && k.active);
      if (kit) {
        const adjustedQty = Math.min(item.quantity, kit.stockQuantity);
        verifiedItems.push({
          ...item,
          price: kit.price,
          stockQuantity: kit.stockQuantity,
          quantity: Math.max(1, adjustedQty),
        });
      }
    } else {
      const product = db.products.find((p) => p.id === item.productId && p.active);
      if (product) {
        const adjustedQty = Math.min(item.quantity, product.stockQuantity);
        verifiedItems.push({
          ...item,
          price: product.price,
          stockQuantity: product.stockQuantity,
          quantity: Math.max(1, adjustedQty),
        });
      }
    }
  }

  if (verifiedItems.length !== cart.items.length) {
    hasChanges = true;
    cart.items = verifiedItems;
    db.carts[cartKey] = cart;
    saveDatabase(db);
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold || subtotal === 0 ? 0 : db.settings.deliveryFee;
  const total = subtotal + deliveryFee;

  res.json({
    items: cart.items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold: db.settings.freeDeliveryThreshold,
    total,
    currency: db.settings.currency,
  });
});

// POST /api/cart/items
router.post('/items', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity = 1, isKit = false } = req.body;

  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  const db = getDatabase();
  const cartKey = getSessionCartKey(req);

  if (!db.carts[cartKey]) {
    db.carts[cartKey] = { userId: cartKey, items: [], updatedAt: new Date().toISOString() };
  }

  const cart = db.carts[cartKey];
  let targetProduct: any;
  let availableStock = 0;

  if (isKit) {
    targetProduct = db.projectKits.find((k) => k.id === productId && k.active);
    if (!targetProduct) {
      res.status(404).json({ error: 'Project kit not found or unavailable.' });
      return;
    }
    availableStock = targetProduct.stockQuantity;
  } else {
    targetProduct = db.products.find((p) => p.id === productId && p.active);
    if (!targetProduct) {
      res.status(404).json({ error: 'Component not found or unavailable.' });
      return;
    }
    availableStock = targetProduct.stockQuantity;
  }

  if (availableStock <= 0) {
    res.status(400).json({ error: 'Sorry, this item is currently out of stock.' });
    return;
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId && Boolean(item.isKit) === Boolean(isKit)
  );

  const reqQty = parseInt(String(quantity), 10) || 1;

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + reqQty;
    if (newQty > availableStock) {
      res.status(400).json({
        error: `Only ${availableStock} units available in stock. Cannot add ${reqQty} more.`,
      });
      return;
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    if (reqQty > availableStock) {
      res.status(400).json({
        error: `Only ${availableStock} units available in stock.`,
      });
      return;
    }

    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: targetProduct.id,
      name: targetProduct.name,
      sku: targetProduct.sku,
      price: targetProduct.price,
      quantity: reqQty,
      image: isKit ? targetProduct.imageUrl : targetProduct.images[0] || '',
      stockQuantity: availableStock,
      isKit: Boolean(isKit),
    };
    cart.items.push(newItem);
  }

  cart.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold || subtotal === 0 ? 0 : db.settings.deliveryFee;

  res.json({
    message: 'Added to cart successfully.',
    items: cart.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  });
});

// PUT /api/cart/items/:id
router.put('/items/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { quantity } = req.body;
  const newQty = parseInt(String(quantity), 10);

  if (isNaN(newQty) || newQty < 1) {
    res.status(400).json({ error: 'Quantity must be at least 1.' });
    return;
  }

  const db = getDatabase();
  const cartKey = getSessionCartKey(req);
  const cart = db.carts[cartKey];

  if (!cart) {
    res.status(404).json({ error: 'Cart not found.' });
    return;
  }

  const item = cart.items.find((i) => i.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Item not found in cart.' });
    return;
  }

  // Stock check
  let currentStock = 0;
  if (item.isKit) {
    const kit = db.projectKits.find((k) => k.id === item.productId);
    currentStock = kit ? kit.stockQuantity : 0;
  } else {
    const product = db.products.find((p) => p.id === item.productId);
    currentStock = product ? product.stockQuantity : 0;
  }

  if (newQty > currentStock) {
    res.status(400).json({
      error: `Cannot exceed available stock of ${currentStock} units.`,
    });
    return;
  }

  item.quantity = newQty;
  item.stockQuantity = currentStock;
  cart.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold || subtotal === 0 ? 0 : db.settings.deliveryFee;

  res.json({
    message: 'Cart updated.',
    items: cart.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  });
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const cartKey = getSessionCartKey(req);
  const cart = db.carts[cartKey];

  if (!cart) {
    res.status(404).json({ error: 'Cart not found.' });
    return;
  }

  cart.items = cart.items.filter((i) => i.id !== req.params.id);
  cart.updatedAt = new Date().toISOString();
  saveDatabase(db);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= db.settings.freeDeliveryThreshold || subtotal === 0 ? 0 : db.settings.deliveryFee;

  res.json({
    message: 'Item removed from cart.',
    items: cart.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  });
});

// DELETE /api/cart
router.delete('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const cartKey = getSessionCartKey(req);

  if (db.carts[cartKey]) {
    db.carts[cartKey].items = [];
    db.carts[cartKey].updatedAt = new Date().toISOString();
    saveDatabase(db);
  }

  res.json({ message: 'Cart cleared.', items: [], subtotal: 0, total: 0 });
});

export default router;

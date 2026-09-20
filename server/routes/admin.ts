import { Router, Response } from 'express';
import { getDatabase, saveDatabase, Product, Category, OrderStatus, OrderTimeline } from '../db';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();

  const totalProducts = db.products.filter((p) => p.active).length;
  const totalCategories = db.categories.filter((c) => c.active).length;
  const customers = db.users.filter((u) => u.role === 'CUSTOMER');
  const totalCustomers = customers.length;
  const totalOrders = db.orders.length;

  const pendingOrders = db.orders.filter(
    (o) => o.orderStatus === 'Order Placed' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing'
  ).length;

  const completedOrders = db.orders.filter(
    (o) => o.orderStatus === 'Delivered / Collected'
  ).length;

  const lowStockThreshold = db.settings.lowStockThreshold || 10;
  const lowStockProducts = db.products.filter(
    (p) => p.active && p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || lowStockThreshold)
  );

  const outOfStockProducts = db.products.filter((p) => p.active && p.stockQuantity === 0);

  const totalRevenue = db.orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Group orders by status
  const ordersByStatus: Record<string, number> = {};
  db.orders.forEach((o) => {
    ordersByStatus[o.orderStatus] = (ordersByStatus[o.orderStatus] || 0) + 1;
  });

  // Recent 5 orders
  const recentOrders = db.orders.slice(0, 5);

  res.json({
    totalProducts,
    totalCategories,
    totalCustomers,
    totalOrders,
    pendingOrders,
    completedOrders,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      threshold: p.lowStockThreshold,
    })),
    outOfStockCount: outOfStockProducts.length,
    outOfStockProducts: outOfStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
    })),
    totalRevenue,
    currency: db.settings.currency,
    ordersByStatus,
    recentOrders,
  });
});

// GET /api/admin/reports
router.get('/reports', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const { startDate, endDate } = req.query;

  let filteredOrders = db.orders;
  if (startDate) {
    const start = new Date(String(startDate)).getTime();
    filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() >= start);
  }
  if (endDate) {
    const end = new Date(String(endDate)).getTime();
    filteredOrders = filteredOrders.filter((o) => new Date(o.createdAt).getTime() <= end);
  }

  const validOrders = filteredOrders.filter((o) => o.orderStatus !== 'Cancelled');
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;

  // Best selling products calculation
  const productSalesMap: Record<string, { name: string; sku: string; unitsSold: number; revenue: number }> = {};

  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          sku: item.sku,
          unitsSold: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].unitsSold += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });

  const bestSelling = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);

  res.json({
    totalSales,
    totalOrdersCount,
    averageOrderValue: validOrders.length ? Math.round(totalSales / validOrders.length) : 0,
    bestSelling,
    currency: db.settings.currency,
  });
});

// GET /api/admin/products (includes inactive)
router.get('/products', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const productsWithCat = db.products.map((p) => ({
    ...p,
    categoryName: db.categories.find((c) => c.id === p.categoryId)?.name || 'Unknown',
  }));
  res.json(productsWithCat);
});

// POST /api/admin/products
router.post('/products', (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    sku,
    modelNumber,
    categoryId,
    brand,
    price,
    originalPrice,
    stockQuantity,
    lowStockThreshold,
    description,
    features,
    applications,
    specifications,
    images,
    datasheetUrl,
    isFeatured,
    isPopular,
    active,
  } = req.body;

  if (!name || !sku || !categoryId || !price) {
    res.status(400).json({ error: 'Name, SKU, Category, and Price are required.' });
    return;
  }

  const db = getDatabase();

  // Check SKU uniqueness
  if (db.products.some((p) => p.sku.toLowerCase() === sku.trim().toLowerCase())) {
    res.status(400).json({ error: `A product with SKU "${sku}" already exists.` });
    return;
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: name.trim(),
    sku: sku.trim().toUpperCase(),
    modelNumber: modelNumber ? modelNumber.trim() : undefined,
    categoryId,
    brand: brand ? brand.trim() : 'Generic',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discountPercent: originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : undefined,
    stockQuantity: Number(stockQuantity) || 0,
    lowStockThreshold: Number(lowStockThreshold) || db.settings.lowStockThreshold || 10,
    description: description ? description.trim() : '',
    features: Array.isArray(features) ? features : [],
    applications: Array.isArray(applications) ? applications : [],
    specifications: typeof specifications === 'object' && specifications !== null ? specifications : {},
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'],
    datasheetUrl: datasheetUrl || undefined,
    isFeatured: Boolean(isFeatured),
    isPopular: Boolean(isPopular),
    active: active !== undefined ? Boolean(active) : true,
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  saveDatabase(db);

  res.status(201).json(newProduct);
});

// PUT /api/admin/products/:id
router.put('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const {
    name,
    sku,
    modelNumber,
    categoryId,
    brand,
    price,
    originalPrice,
    stockQuantity,
    lowStockThreshold,
    description,
    features,
    applications,
    specifications,
    images,
    datasheetUrl,
    isFeatured,
    isPopular,
    active,
  } = req.body;

  if (sku && sku.trim().toUpperCase() !== product.sku) {
    if (db.products.some((p) => p.id !== product.id && p.sku.toLowerCase() === sku.trim().toLowerCase())) {
      res.status(400).json({ error: `Another product with SKU "${sku}" already exists.` });
      return;
    }
    product.sku = sku.trim().toUpperCase();
  }

  if (name !== undefined) product.name = name.trim();
  if (modelNumber !== undefined) product.modelNumber = modelNumber.trim();
  if (categoryId !== undefined) product.categoryId = categoryId;
  if (brand !== undefined) product.brand = brand.trim();
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (product.originalPrice && product.originalPrice > product.price) {
    product.discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  } else {
    product.discountPercent = 0;
  }
  if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
  if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
  if (description !== undefined) product.description = description.trim();
  if (features !== undefined) product.features = features;
  if (applications !== undefined) product.applications = applications;
  if (specifications !== undefined) product.specifications = specifications;
  if (images !== undefined) product.images = images;
  if (datasheetUrl !== undefined) product.datasheetUrl = datasheetUrl;
  if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
  if (isPopular !== undefined) product.isPopular = Boolean(isPopular);
  if (active !== undefined) product.active = Boolean(active);

  product.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json(product);
});

// PATCH /api/admin/products/:id/stock
router.patch('/products/:id/stock', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const { stockQuantity, delta, markOutOfStock } = req.body;

  if (markOutOfStock) {
    product.stockQuantity = 0;
  } else if (stockQuantity !== undefined) {
    product.stockQuantity = Math.max(0, Number(stockQuantity));
  } else if (delta !== undefined) {
    product.stockQuantity = Math.max(0, product.stockQuantity + Number(delta));
  }

  product.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({ message: 'Stock updated.', product });
});

// DELETE /api/admin/products/:id (Safe soft delete)
router.delete('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  product.active = false;
  product.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({ message: 'Product safely deactivated.' });
});

// Category Management
// POST /api/admin/categories
router.post('/categories', (req: AuthenticatedRequest, res: Response) => {
  const { name, description, imageUrl } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  const db = getDatabase();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    imageUrl: imageUrl || '',
    active: true,
  };

  db.categories.push(newCat);
  saveDatabase(db);

  res.status(201).json(newCat);
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const cat = db.categories.find((c) => c.id === req.params.id);

  if (!cat) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }

  const { name, description, imageUrl, active } = req.body;
  if (name !== undefined) {
    cat.name = name.trim();
    cat.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (description !== undefined) cat.description = description.trim();
  if (imageUrl !== undefined) cat.imageUrl = imageUrl;
  if (active !== undefined) cat.active = Boolean(active);

  saveDatabase(db);
  res.json(cat);
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const cat = db.categories.find((c) => c.id === req.params.id);

  if (!cat) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }

  cat.active = false;
  saveDatabase(db);
  res.json({ message: 'Category deactivated.' });
});

// Order Management
// GET /api/admin/orders
router.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const { status, search } = req.query;

  let orders = db.orders;

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === status);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }

  res.json(orders);
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  const validStatuses: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Preparing',
    'Ready for Pickup / Shipped',
    'Delivered / Collected',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status specified.' });
    return;
  }

  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'Delivered / Collected') {
    order.paymentStatus = 'Paid';
  }

  const timelineNote =
    note ||
    (status === 'Ready for Pickup / Shipped'
      ? order.orderType === 'Pickup'
        ? 'Components are packed and ready at the store pickup counter.'
        : 'Package has been dispatched for delivery.'
      : status === 'Delivered / Collected'
      ? order.orderType === 'Pickup'
        ? 'Customer collected order from the shop.'
        : 'Order delivered to recipient address.'
      : `Order marked as ${status}.`);

  order.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    note: timelineNote,
  });

  // Notify customer
  db.notifications.push({
    id: `notif_${Date.now()}_status`,
    recipientId: order.userId,
    title: `Order #${order.id} Updated: ${status}`,
    message: timelineNote,
    type: 'order',
    read: false,
    linkUrl: `/orders/${order.id}`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ message: 'Order status updated.', order });
});

// Customer Management
// GET /api/admin/customers
router.get('/customers', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const customers = db.users
    .filter((u) => u.role === 'CUSTOMER')
    .map((c) => {
      const orders = db.orders.filter((o) => o.userId === c.id);
      const totalSpent = orders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
        orderCount: orders.length,
        totalSpent,
        orders: orders.map((o) => ({ id: o.id, total: o.total, status: o.orderStatus, date: o.createdAt })),
      };
    });

  res.json(customers);
});

// Question Answering
// POST /api/admin/questions/:id/answer
router.post('/questions/:id/answer', (req: AuthenticatedRequest, res: Response) => {
  const { answer } = req.body;
  if (!answer || answer.trim().length === 0) {
    res.status(400).json({ error: 'Answer is required.' });
    return;
  }

  const db = getDatabase();
  const q = db.questions.find((item) => item.id === req.params.id);

  if (!q) {
    res.status(404).json({ error: 'Question not found.' });
    return;
  }

  q.answer = answer.trim();
  q.answeredAt = new Date().toISOString();

  // Notify customer
  db.notifications.push({
    id: `notif_${Date.now()}`,
    recipientId: q.userId,
    title: 'Your question was answered!',
    message: `Kishan Electronics answered: "${answer.trim()}"`,
    type: 'enquiry',
    read: false,
    linkUrl: `/products/${q.productId}`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ message: 'Answer published.', question: q });
});

// Delete review
router.delete('/reviews/:id', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const index = db.reviews.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  const review = db.reviews[index];
  db.reviews.splice(index, 1);

  // Recalculate product rating
  const prodReviews = db.reviews.filter((r) => r.productId === review.productId && r.approved);
  const prod = db.products.find((p) => p.id === review.productId);
  if (prod) {
    if (prodReviews.length === 0) {
      prod.rating = 5.0;
      prod.reviewCount = 0;
    } else {
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.rating = Math.round(avg * 10) / 10;
      prod.reviewCount = prodReviews.length;
    }
  }

  saveDatabase(db);
  res.json({ message: 'Review removed.' });
});

// Settings Management
// GET /api/admin/settings
router.get('/settings', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.settings);
});

// PUT /api/admin/settings
router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const {
    shopName,
    tagline,
    phone,
    whatsappNumber,
    email,
    address,
    openingHours,
    googleMapsUrl,
    googleMapsEmbedUrl,
    deliveryAvailable,
    pickupAvailable,
    pickupNotice,
    currency,
    currencyCode,
    taxPercent,
    lowStockThreshold,
    deliveryFee,
    freeDeliveryThreshold,
  } = req.body;

  if (shopName) db.settings.shopName = shopName.trim();
  if (tagline) db.settings.tagline = tagline.trim();
  if (phone) db.settings.phone = phone.trim();
  if (whatsappNumber) db.settings.whatsappNumber = whatsappNumber.trim();
  if (email) db.settings.email = email.trim();
  if (address) db.settings.address = address.trim();
  if (openingHours) db.settings.openingHours = openingHours.trim();
  if (googleMapsUrl) db.settings.googleMapsUrl = googleMapsUrl.trim();
  if (googleMapsEmbedUrl) db.settings.googleMapsEmbedUrl = googleMapsEmbedUrl.trim();
  if (deliveryAvailable !== undefined) db.settings.deliveryAvailable = Boolean(deliveryAvailable);
  if (pickupAvailable !== undefined) db.settings.pickupAvailable = Boolean(pickupAvailable);
  if (pickupNotice) db.settings.pickupNotice = pickupNotice.trim();
  if (currency) db.settings.currency = currency.trim();
  if (currencyCode) db.settings.currencyCode = currencyCode.trim();
  if (taxPercent !== undefined) db.settings.taxPercent = Number(taxPercent);
  if (lowStockThreshold !== undefined) db.settings.lowStockThreshold = Number(lowStockThreshold);
  if (deliveryFee !== undefined) db.settings.deliveryFee = Number(deliveryFee);
  if (freeDeliveryThreshold !== undefined) db.settings.freeDeliveryThreshold = Number(freeDeliveryThreshold);

  saveDatabase(db);
  res.json({ message: 'Shop configuration updated successfully.', settings: db.settings });
});

export default router;

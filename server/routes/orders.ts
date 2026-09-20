import { Router, Response } from 'express';
import { getDatabase, saveDatabase, Order, OrderItem, OrderTimeline, OrderStatus } from '../db';
import { requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

function generateOrderId(dbOrders: Order[]): string {
  const currentYear = new Date().getFullYear();
  const nextNum = dbOrders.length + 101;
  const padded = String(nextNum).padStart(6, '0');
  return `KE-${currentYear}-${padded}`;
}

// POST /api/orders (Checkout)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      items,
      orderType,
      deliveryAddress,
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    const db = getDatabase();
    const userId = req.user!.userId;

    // Validate order type
    if (orderType !== 'Pickup' && orderType !== 'Delivery') {
      res.status(400).json({ error: 'Please choose either Store Pickup or Home Delivery.' });
      return;
    }

    if (orderType === 'Delivery') {
      if (
        !deliveryAddress ||
        !deliveryAddress.houseShopNo ||
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.pinCode
      ) {
        res.status(400).json({ error: 'Complete delivery address with PIN code is required.' });
        return;
      }
    }

    // Items can come from request or user cart
    let orderItemsToProcess = items;
    if (!orderItemsToProcess || orderItemsToProcess.length === 0) {
      const cart = db.carts[userId];
      if (!cart || cart.items.length === 0) {
        res.status(400).json({ error: 'Your cart is empty. Please add components before placing an order.' });
        return;
      }
      orderItemsToProcess = cart.items;
    }

    // Verify stock and calculate totals
    const finalOrderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderItemsToProcess) {
      const isKit = Boolean(item.isKit);
      let targetProduct: any;

      if (isKit) {
        targetProduct = db.projectKits.find((k) => k.id === item.productId);
      } else {
        targetProduct = db.products.find((p) => p.id === item.productId);
      }

      if (!targetProduct) {
        res.status(404).json({ error: `Product not found: ${item.name || item.productId}` });
        return;
      }

      const qty = parseInt(String(item.quantity), 10) || 1;
      if (targetProduct.stockQuantity < qty) {
        res.status(400).json({
          error: `Insufficient stock for "${targetProduct.name}". Only ${targetProduct.stockQuantity} units available.`,
        });
        return;
      }

      // Deduct stock quantity
      targetProduct.stockQuantity -= qty;

      const itemTotal = targetProduct.price * qty;
      subtotal += itemTotal;

      finalOrderItems.push({
        productId: targetProduct.id,
        productName: targetProduct.name,
        sku: targetProduct.sku,
        price: targetProduct.price,
        quantity: qty,
        image: isKit ? targetProduct.imageUrl : targetProduct.images[0] || '',
        total: itemTotal,
      });
    }

    const deliveryFee =
      orderType === 'Pickup'
        ? 0
        : subtotal >= db.settings.freeDeliveryThreshold
        ? 0
        : db.settings.deliveryFee;

    const total = subtotal + deliveryFee;
    const orderId = generateOrderId(db.orders);

    const initialTimeline: OrderTimeline[] = [
      {
        status: 'Order Placed',
        timestamp: new Date().toISOString(),
        note:
          orderType === 'Pickup'
            ? 'Order reserved for in-store pickup at Kishan Electronics.'
            : 'Order received for doorstep dispatch.',
      },
    ];

    const newOrder: Order = {
      id: orderId,
      userId,
      customerName: customerName || req.user!.name,
      customerEmail: customerEmail || req.user!.email,
      customerPhone: customerPhone || '+91 98765 00000',
      items: finalOrderItems,
      subtotal,
      discount: 0,
      tax: 0,
      deliveryFee,
      total,
      orderType,
      pickupLocation:
        orderType === 'Pickup'
          ? `${db.settings.shopName}, ${db.settings.address}`
          : undefined,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
      paymentMethod: paymentMethod || (orderType === 'Pickup' ? 'Cash on Pickup' : 'Pay on Delivery'),
      paymentStatus: 'Pending',
      orderStatus: 'Order Placed',
      timeline: initialTimeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Clear user cart
    if (db.carts[userId]) {
      db.carts[userId].items = [];
      db.carts[userId].updatedAt = new Date().toISOString();
    }

    // Add notifications
    db.notifications.push({
      id: `notif_${Date.now()}_admin`,
      recipientId: 'admin',
      title: `New ${orderType} Order #${newOrder.id}`,
      message: `${newOrder.customerName} placed order worth ${db.settings.currency}${newOrder.total} (${newOrder.items.length} items).`,
      type: 'order',
      read: false,
      linkUrl: `/admin/orders/${newOrder.id}`,
      createdAt: new Date().toISOString(),
    });

    db.notifications.push({
      id: `notif_${Date.now()}_user`,
      recipientId: userId,
      title: `Order Placed Successfully (#${newOrder.id})`,
      message:
        orderType === 'Pickup'
          ? 'Your order has been placed. You will be notified when it is packed and ready for collection at Kishan Electronics counter.'
          : 'Your order has been placed. We are preparing it for delivery dispatch.',
      type: 'order',
      read: false,
      linkUrl: `/orders/${newOrder.id}`,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
});

// GET /api/orders/my
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userOrders = db.orders.filter((o) => o.userId === req.user!.userId);
  res.json(userOrders);
});

// GET /api/orders/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  // Ensure customer can only view their own order, unless admin
  if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied to this order.' });
    return;
  }

  res.json(order);
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (order.orderStatus === 'Delivered / Collected' || order.orderStatus === 'Cancelled') {
    res.status(400).json({ error: `Cannot cancel an order that is already ${order.orderStatus}.` });
    return;
  }

  // Restore inventory
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product) {
      product.stockQuantity += item.quantity;
    } else {
      const kit = db.projectKits.find((k) => k.id === item.productId);
      if (kit) {
        kit.stockQuantity += item.quantity;
      }
    }
  }

  order.orderStatus = 'Cancelled';
  order.cancellationReason = req.body.reason || 'Cancelled by customer';
  order.updatedAt = new Date().toISOString();
  order.timeline.push({
    status: 'Cancelled',
    timestamp: new Date().toISOString(),
    note: order.cancellationReason,
  });

  saveDatabase(db);
  res.json({ message: 'Order cancelled and stock restored.', order });
});

export default router;

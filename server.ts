import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDatabase } from './server/db';

// Route imports
import authRoutes from './server/routes/auth';
import productRoutes from './server/routes/products';
import categoryRoutes from './server/routes/categories';
import cartRoutes from './server/routes/cart';
import orderRoutes from './server/routes/orders';
import projectKitRoutes from './server/routes/projectKits';
import buildProjectRoutes from './server/routes/buildProject';
import wishlistRoutes from './server/routes/wishlist';
import adminRoutes from './server/routes/admin';
import uploadRoutes from './server/routes/upload';
import notificationRoutes from './server/routes/notifications';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  getDatabase();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Ensure uploads directory exists and serve statically
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Serve sample datasheet PDF generator endpoint so any datasheet download link works cleanly
  app.get('/datasheets/:filename', (req, res) => {
    const filename = req.params.filename;
    // Deliver a friendly PDF or text response for sample component datasheets
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    // Minimal standard valid 1-page PDF binary stream
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 130 >> stream
BT
/F1 18 Tf
50 720 Td
(Kishan Electronics - Technical Component Datasheet) Tj
/F1 12 Tf
0 -30 Td
(Document: ${filename}) Tj
0 -20 Td
(Official ECE Specifications & Pin Configuration) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
487
%%EOF`;
    res.send(Buffer.from(minimalPdf));
  });

  // Public Shop Settings Route
  app.get('/api/settings', (req, res) => {
    const db = getDatabase();
    res.json(db.settings);
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      shop: 'Kishan Electronics',
      time: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/project-kits', projectKitRoutes);
  app.use('/api/build-my-project', buildProjectRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Global API 404 handler for unmatched /api routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kishan Electronics] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

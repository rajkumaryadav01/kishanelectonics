import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAdmin, AuthenticatedRequest } from '../auth';

const router = Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const DATASHEETS_DIR = path.join(UPLOADS_DIR, 'datasheets');

// Ensure directories exist
[UPLOADS_DIR, IMAGES_DIR, DATASHEETS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `img_${uniqueSuffix}_${cleanName}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF, SVG) under 5MB are allowed.'));
  },
});

// Multer storage for datasheets (PDF)
const datasheetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DATASHEETS_DIR);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `datasheet_${uniqueSuffix}_${cleanName}`);
  },
});

const datasheetUpload = multer({
  storage: datasheetStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    cb(new Error('Only PDF documents under 15MB are allowed for datasheets.'));
  },
});

// POST /api/upload/image (Admin only)
router.post('/image', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  imageUpload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Image upload failed.' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;
    res.status(201).json({
      message: 'Product image uploaded successfully.',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
});

// POST /api/upload/datasheet (Admin only)
router.post('/datasheet', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  datasheetUpload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Datasheet PDF upload failed.' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No datasheet PDF provided.' });
      return;
    }

    const fileUrl = `/uploads/datasheets/${req.file.filename}`;
    res.status(201).json({
      message: 'Technical datasheet uploaded successfully.',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
});

export default router;

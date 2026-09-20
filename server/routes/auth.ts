import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, User, Address } from '../db';
import {
  hashPassword,
  comparePassword,
  generateToken,
  requireAuth,
  AuthenticatedRequest,
} from '../auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'All fields (Name, Email, Phone, Password) are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const db = getDatabase();
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone
    );

    if (existing) {
      res.status(409).json({ error: 'An account with this email or phone number already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.carts[newUser.id] = { userId: newUser.id, items: [], updatedAt: new Date().toISOString() };
    db.wishlists[newUser.id] = [];
    saveDatabase(db);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      message: 'Registration successful! Welcome to Kishan Electronics.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ error: 'Please provide email/phone and password.' });
      return;
    }

    const db = getDatabase();
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === cleanIdentifier || u.phone === emailOrPhone.trim()
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email/phone or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email/phone or password.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user!.userId);

  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  const addresses = db.addresses.filter((a) => a.userId === user.id);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    addresses,
    defaultAddress,
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: 'Name and phone are required.' });
    return;
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  user.name = name.trim();
  user.phone = phone.trim();
  user.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({
    message: 'Profile updated successfully.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// PUT /api/auth/password
router.put('/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({ message: 'Password changed successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  // Generic message to prevent email enumeration
  res.json({
    message:
      'If an account exists with this email address, password reset instructions will be sent shortly. For immediate assistance, contact Kishan Electronics store directly.',
  });
});

// Customer Addresses API
router.get('/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const addresses = db.addresses.filter((a) => a.userId === req.user!.userId);
  res.json(addresses);
});

router.post('/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, houseShopNo, street, city, state, pinCode, isDefault } = req.body;
  if (!fullName || !phone || !houseShopNo || !street || !city || !state || !pinCode) {
    res.status(400).json({ error: 'All address fields are required.' });
    return;
  }

  const db = getDatabase();
  const userAddresses = db.addresses.filter((a) => a.userId === req.user!.userId);

  if (isDefault || userAddresses.length === 0) {
    userAddresses.forEach((a) => (a.isDefault = false));
  }

  const newAddress: Address = {
    id: `addr_${Date.now()}`,
    userId: req.user!.userId,
    fullName: fullName.trim(),
    phone: phone.trim(),
    houseShopNo: houseShopNo.trim(),
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    pinCode: pinCode.trim(),
    isDefault: isDefault || userAddresses.length === 0,
  };

  db.addresses.push(newAddress);
  saveDatabase(db);
  res.status(201).json(newAddress);
});

router.put('/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const address = db.addresses.find(
    (a) => a.id === req.params.id && a.userId === req.user!.userId
  );

  if (!address) {
    res.status(404).json({ error: 'Address not found.' });
    return;
  }

  const { fullName, phone, houseShopNo, street, city, state, pinCode, isDefault } = req.body;
  if (fullName) address.fullName = fullName.trim();
  if (phone) address.phone = phone.trim();
  if (houseShopNo) address.houseShopNo = houseShopNo.trim();
  if (street) address.street = street.trim();
  if (city) address.city = city.trim();
  if (state) address.state = state.trim();
  if (pinCode) address.pinCode = pinCode.trim();

  if (isDefault) {
    db.addresses
      .filter((a) => a.userId === req.user!.userId)
      .forEach((a) => (a.isDefault = a.id === address.id));
  }

  saveDatabase(db);
  res.json(address);
});

router.delete('/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const index = db.addresses.findIndex(
    (a) => a.id === req.params.id && a.userId === req.user!.userId
  );

  if (index === -1) {
    res.status(404).json({ error: 'Address not found.' });
    return;
  }

  const wasDefault = db.addresses[index].isDefault;
  db.addresses.splice(index, 1);

  if (wasDefault) {
    const remaining = db.addresses.filter((a) => a.userId === req.user!.userId);
    if (remaining.length > 0) {
      remaining[0].isDefault = true;
    }
  }

  saveDatabase(db);
  res.json({ message: 'Address deleted successfully.' });
});

export default router;

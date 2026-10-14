import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { proDb } from './server/db';

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // REST API: AUTHENTICATION (STRICT ONLY-REGISTERED ENFORCEMENT)
  // -------------------------------------------------------------

  // Login endpoint: ONLY registered users can login
  app.post('/api/auth/login', (req, res) => {
    const { phone, password, isOtpLogin } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi.' });
    }

    const user = proDb.findUserByPhone(phone);

    // Reject unregistered user immediately!
    if (!user) {
      return res.status(401).json({
        success: false,
        isNotRegistered: true,
        message: `Nomor WhatsApp ${phone} BELUM terdaftar di Arjawinangun Delivery. Silakan lakukan pendaftaran terlebih dahulu.`,
      });
    }

    // If password login, verify password
    if (!isOtpLogin && password) {
      if (user.password && user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Password salah. Silakan periksa kembali atau gunakan login via WhatsApp OTP.',
        });
      }
    }

    // Success login
    const { password: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      user: userSafe,
    });
  });

  // Registration endpoint
  app.post('/api/auth/register', (req, res) => {
    const { name, phone, password, role, address, district, storeName, storeCategory, vehicleModel, plateNumber } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi Nama, Nomor WhatsApp, Password, dan Peran Akun.',
      });
    }

    const result = proDb.registerUser({
      name,
      phone,
      password,
      role,
      address: address || 'Arjawinangun, Cirebon',
      district: district || 'Arjawinangun Kota (Alun-Alun)',
      storeName,
      storeCategory,
      vehicleModel,
      plateNumber,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const { password: _, ...userSafe } = result.user!;
    return res.json({
      success: true,
      message: result.message,
      user: userSafe,
    });
  });

  // Pre-registered accounts list for easy testing
  app.get('/api/auth/registered-users', (req, res) => {
    const users = proDb['data'].users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      address: u.address,
      district: u.district,
      storeId: u.storeId,
      courierId: u.courierId,
    }));
    return res.json({ success: true, users });
  });

  // -------------------------------------------------------------
  // REST API: CATALOG & REVIEWS (PROFESSIONAL SHOWCASE)
  // -------------------------------------------------------------
  app.get('/api/catalog/stores', (req, res) => {
    const category = req.query.category as string;
    let stores = proDb.getMerchants();
    if (category && category !== 'all') {
      stores = stores.filter(s => s.category === category);
    }
    return res.json({ success: true, stores });
  });

  app.get('/api/catalog/products', (req, res) => {
    const storeId = req.query.storeId as string;
    let products = proDb.getProducts();
    if (storeId) {
      products = products.filter(p => p.storeId === storeId);
    }
    return res.json({ success: true, products });
  });

  app.get('/api/catalog/products/:id/reviews', (req, res) => {
    const reviews = proDb.getProductReviews(req.params.id);
    return res.json({ success: true, reviews });
  });

  app.post('/api/catalog/products/:id/reviews', (req, res) => {
    const { storeId, orderId, userName, userPhone, userAvatar, rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating dan komentar wajib diisi.' });
    }

    const newReview = proDb.addReview({
      productId: req.params.id,
      storeId: storeId || 'store-1',
      orderId,
      userName: userName || 'Pelanggan Arjawinangun',
      userPhone: userPhone || '-',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: Number(rating),
      comment,
      verifiedOrder: true,
    });

    return res.json({ success: true, review: newReview });
  });

  // -------------------------------------------------------------
  // REST API: ORDERS & LIVE SYNCHRONIZATION
  // -------------------------------------------------------------
  app.get('/api/orders', (req, res) => {
    return res.json({ success: true, orders: proDb.getAllOrders() });
  });

  app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, message: 'Data pesanan tidak valid.' });
    }
    const saved = proDb.saveOrder(order);
    return res.json({ success: true, order: saved });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, courierId, courierName, courierPhone, courierVehicle, courierRating } = req.body;
    const orders = proDb.getAllOrders();
    const target = orders.find(o => o.id === req.params.id);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    if (status) target.status = status;
    if (courierId) target.courierId = courierId;
    if (courierName) target.courierName = courierName;
    if (courierPhone) target.courierPhone = courierPhone;
    if (courierVehicle) target.courierVehicle = courierVehicle;
    if (courierRating) target.courierRating = courierRating;

    const saved = proDb.saveOrder(target);
    return res.json({ success: true, order: saved });
  });

  // Reset to initial demo data
  app.post('/api/reset-demo', (req, res) => {
    proDb.resetToInitial();
    return res.json({ success: true, message: 'Database reset to initial demo data.' });
  });

  // -------------------------------------------------------------
  // FRONTEND MOUNTING: VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // -------------------------------------------------------------
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Arjawinangun Delivery] Pro Database & Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Arjawinangun Delivery] Failed to start server:', err);
});

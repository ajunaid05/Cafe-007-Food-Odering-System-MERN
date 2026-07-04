const dns = require('dns');

// Optional: avoid weird DNS resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

/* =========================
   IMPORTANT (FOR VERCEL + COOKIES)
========================= */
app.set('trust proxy', 1);

/* =========================
   STRIPE WEBHOOK (RAW BODY)
========================= */
app.use('/api/payment/webhook', require('./routes/stripeWebhook'));

/* =========================
   CORS FIX (LOCAL + VERCEL)
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://cafe-007-food-odering-system-mern.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked for origin: " + origin));
    }
  },
  credentials: true,
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   DEBUG LOGS
========================= */
console.log("DNS Servers:", dns.getServers());
console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);

/* =========================
   MONGODB CONNECTION
========================= */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
  });

/* =========================
   ROUTES
========================= */
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.json({
    message: 'Food Ordering API is running 🚀'
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
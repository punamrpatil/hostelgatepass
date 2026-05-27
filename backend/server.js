const dotenv = require('dotenv');
dotenv.config(); // ✅ MUST be first — before any other imports that use process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tgRoutes = require('./routes/tgRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const securityRoutes = require('./routes/securityRoutes');
const hodRoutes = require('./routes/hodRoutes');

const app = express();

// ✅ CORS — allow your Vercel frontend + any localhost dev port
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tg', tgRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/hod', hodRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Hostel Gate Pass System API is running ✅' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Startup Error:', error.message);
    process.exit(1);
  }
};

startServer();
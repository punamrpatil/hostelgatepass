const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tgRoutes = require('./routes/tgRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const securityRoutes = require('./routes/securityRoutes');
const hodRoutes = require('./routes/hodRoutes');

// Load env
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tg', tgRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/hod', hodRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Smart Hostel Gate Pass System API is running...');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup Error:", error.message);
  }
};

startServer();
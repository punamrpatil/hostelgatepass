const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// Import modular routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tgRoutes = require('./routes/tgRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const securityRoutes = require('./routes/securityRoutes');
const hodRoutes = require('./routes/hodRoutes');
// Load environment variables
dotenv.config();
// Connect to MongoDB
connectDB();
const app = express();
// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve raw uploads if static media assets are required
app.use('/uploads', express.static('uploads'));
// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tg', tgRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/hod', hodRoutes);
// Base standard route
app.get('/', (req, res) => {
  res.send('Smart Hostel Gate Pass System API is running...');
});
// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});
// Global error boundary middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

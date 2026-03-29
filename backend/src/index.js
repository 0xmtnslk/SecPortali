require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const seedDatabase = require('./scripts/seed-db');

// Import modular routes
const authRoutes = require('./modules/core/routes/auth');
const userRoutes = require('./modules/core/routes/users');
const roleRoutes = require('./modules/core/routes/roles');
const coreFacilityRoutes = require('./modules/core/routes/facilities');

const facilityRoutes = require('./modules/eams/routes/facilities');
const floorRoutes = require('./modules/eams/routes/floors');
const assetRoutes = require('./modules/eams/routes/assets');
const maintenanceRoutes = require('./modules/eams/routes/maintenance');
const faultRequestRoutes = require('./modules/eams/routes/faultRequests');
const areaRoutes = require('./modules/eams/routes/areas');
const calendarRoutes = require('./modules/eams/routes/calendar');
const notificationRoutes = require('./modules/eams/routes/notifications');
const settingsRoutes = require('./modules/eams/routes/settings');
const mapRoutes = require('./modules/eams/routes/map');

const contractorRoutes = require('./modules/cms/routes/contractors');
const checklistRoutes = require('./modules/cms/routes/checklists');

const app = express();

// Connect to database and seed
connectDB().then(() => {
  seedDatabase().catch(err => console.error('Initial seeding failed:', err));
});

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Security middleware
app.use(helmet());

// CORS - Must be before rate limiting and routes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting - After CORS
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20 
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000 
});

// Genel API rate limiting
app.use('/api/', limiter);
app.use('/api/eams/floors/:id/dxf', uploadLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Modular API Routes
// Core Module
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/facilities', coreFacilityRoutes);

// EAMS Module
app.use('/api/eams/facilities', facilityRoutes);
app.use('/api/eams/floors', floorRoutes);
app.use('/api/eams/assets', assetRoutes);
app.use('/api/eams/maintenance', maintenanceRoutes);
app.use('/api/eams/fault-requests', faultRequestRoutes);
app.use('/api/eams/areas', areaRoutes);
app.use('/api/eams/calendar', calendarRoutes);
app.use('/api/eams/notifications', notificationRoutes);
app.use('/api/eams/settings', settingsRoutes);
app.use('/api/eams/map', mapRoutes);

// CMS Module
app.use('/api/cms/contractors', contractorRoutes);
app.use('/api/cms/checklists', checklistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Asset Management API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;

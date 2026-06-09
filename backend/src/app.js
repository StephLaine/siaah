const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SIAAH Backend is running' });
});

// Routes
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/requests',     require('./routes/request.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));
app.use('/api/superadmin',   require('./routes/superadmin.routes'));   // Super Admin uniquement (role 1)
app.use('/api/entity-admin', require('./routes/entityAdmin.routes')); // Admins entité (role 2, 3)
app.use('/api/vehicles',     require('./routes/vehicle.routes'));
app.use('/api/licenses',     require('./routes/license.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/payments',     require('./routes/payment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Fallback to React frontend for non-API routes
const fs = require('fs');
app.get(/.*/, (req, res, next) => {
    if (req.url.startsWith('/api/')) {
        return next();
    }
    const htmlPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(200).json({ status: 'OK', message: 'SIAAH Backend is running (Frontend files not found)' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;

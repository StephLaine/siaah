const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (photos, documents, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SIAAH Backend is running' });
});

// ── API Routes (must come BEFORE static/SPA fallback) ─────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/requests',      require('./routes/request.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/superadmin',    require('./routes/superadmin.routes'));
app.use('/api/entity-admin',  require('./routes/entityAdmin.routes'));
app.use('/api/vehicles',      require('./routes/vehicle.routes'));
app.use('/api/licenses',      require('./routes/license.routes'));
app.use('/api/appointments',  require('./routes/appointment.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));
app.use('/api/notifications',  require('./routes/notification.routes'));

// Unknown /api/* → proper 404 JSON (not swallowed by SPA fallback)
app.use('/api/*', (req, res) => {
    res.status(404).json({ status: 'error', message: `API route not found: ${req.originalUrl}` });
});

// ── Serve React SPA (all non-API routes → index.html) ─────────────────────────
const frontendDist = path.join(__dirname, '../../frontend/dist');
const indexHtml    = path.join(frontendDist, 'index.html');

// Serve static assets (JS, CSS, images) from the built frontend
app.use(express.static(frontendDist));

// SPA catch-all: any GET that isn't a static file or API → send index.html
// This enables client-side routing (React Router) to handle the URL
app.get('*', (req, res) => {
    if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
    } else {
        // Frontend not built yet — helpful message instead of cryptic 404
        res.status(503).json({
            status: 'error',
            message: 'Frontend not built. Run: cd frontend && npm run build',
        });
    }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;

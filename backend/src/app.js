const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const incidentRoutes = require('./routes/incidents');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const knowledgeRoutes = require('./routes/knowledge');
const forumRoutes = require('./routes/forum');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const statsRoutes = require('./routes/stats');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Necesario para fotos de perfil en base64

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SolveIT API funcionando' });
});

module.exports = app;
// Force redeploy Mon May  4 17:18:08     2026

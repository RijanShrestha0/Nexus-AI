require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Main Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Nexus AI API is running natively.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke safely on the backend!' });
});

// Boot Database/Server Link
app.listen(PORT, () => {
  console.log(`Nexus API Server listening centrally on http://localhost:${PORT}`);
});

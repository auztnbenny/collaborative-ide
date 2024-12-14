const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Debug MongoDB URI
console.log('MongoDB URI:', process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Connected to database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// MongoDB Event Listeners
mongoose.connection.on('connected', () => {
  console.log('✓ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('✗ Mongoose disconnected');
});

// Basic route for testing
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const PORT = process.env.PORTM || 3000; // Use port 3001 to avoid conflicts
const server = app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('✗ Server error:', error.message);
});

process.on('unhandledRejection', (error) => {
  console.error('✗ Unhandled Rejection:', error);
});

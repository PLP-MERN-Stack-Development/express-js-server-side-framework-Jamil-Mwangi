// server.js - Complete Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE SETUP ==========

// Body parser middleware
app.use(bodyParser.json());

// Custom middleware for request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // For demo purposes, we'll use a simple API key check
  if (!apiKey || apiKey !== 'secret-api-key-123') {
    return res.status(401).json({
      error: 'Unauthorized. Valid API key required in x-api-key header.'
    });
  }
  
  next();
};

// Validation middleware for product creation/updates
const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, price, category'
      });
    }
    
    if (typeof price !== 'number' && isNaN(Number(price))) {
      return res.status(400).json({
        error: 'Price must be a valid number'
      });
    }
  }
  
  next();
};

// ========== SAMPLE DATA ==========

let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 75,
    category: 'kitchen',
    inStock: true
  }
];

// ========== ROUTES ==========

// Root route (public)
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products (public)
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product (public)
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ 
      error: 'Product not found' 
    });
  }
  
  res.json(product);
});

// POST /api/products - Create a new product (protected)
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price: Number(price),
    category,
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product (protected)
app.put('/api/products/:id', authenticate, validateProduct, (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category, inStock } = req.body;
  
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Product not found'
    });
  }
  
  // Update product with new data
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    description: description || products[productIndex].description,
    price: price !== undefined ? Number(price) : products[productIndex].price,
    category: category || products[productIndex].category,
    inStock: inStock !== undefined ? Boolean(inStock) : products[productIndex].inStock
  };
  
  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete a product (protected)
app.delete('/api/products/:id', authenticate, (req, res) => {
  const productId = req.params.id;
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Product not found'
    });
  }
  
  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);
  
  res.json({
    message: 'Product deleted successfully',
    deletedProduct
  });
});

// ========== ERROR HANDLING MIDDLEWARE ==========

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// ========== SERVER STARTUP ==========

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
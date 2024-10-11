const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');  // Import profile routes
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');  // Import item routes
const rentalRoutes= require('./routes/rentalRoutes');  // Import item routes 
const fs = require('fs');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');




// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());



// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server);  // Initialize socket.io

// Log current directory and its files for debugging
//console.log('Current Directory:', __dirname);
//console.log('Files in Current Directory:', fs.readdirSync(__dirname)); // Log current directory contents

const path = require('path');

// Serve the public directory with HTML files
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.use('/api', profileRoutes);

// Sync with the database
sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync failed:', err));
app.use('/api', authRoutes);  // Authentication routes
app.use('/api', categoryRoutes);  // Category routes
app.use('/api', profileRoutes);  // Profile-related routes
app.use('/api', deliveryRoutes);  // Delivery routes
app.use('/api/items', itemRoutes);  // Item routes
app.use('/api/Rentals', rentalRoutes);  // Item routes
app.use('/api/deliveries', deliveryRoutes);  // Item routes

// WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to deliveryController
app.set('socketio', io);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully');
    
    // Start the server after the DB sync
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
    // Optionally exit the process if database sync fails
    process.exit(1);  // Exit the process with failure
  });

// Optional: Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware for catching other errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

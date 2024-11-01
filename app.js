const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const cron = require('node-cron'); 
const cors = require('cors');
//const reviewRoutes = require('./services/reviewService');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
//const ratingRoutes = require('./routes/ratingRoutes'); 
const messageRouter = require('./routes/messageRoute'); 
const ratingRoutes = require('./services/ratingService');
const reviewRoutes = require('./routes/reviewRoutes'); 
const favoriteRoutes = require('./routes/favoriteRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes'); 


const { cleanExpiredTokens } = require('./services/tokenCleanUp');
// Initialize express app
const app = express();


// Middleware to parse JSON
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());



const fs = require('fs');



/*const ratingService = require('./services/ratingService');
app.use('/rate', ratingService);*/



// Logging middleware for incoming requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Registering routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', profileRoutes);
app.use('/api', deliveryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/rentals', rentalRoutes);
//app.use('/api', ratingRoutes);
app.use('/api/messages', messageRouter);
app.use('/rate', ratingRoutes); 
//app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/wishlists', wishlistRoutes);


// Sync with the database
sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully');
    
    // Start the server after the DB sync
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Schedule a cleanup of expired tokens every 24 hours
    cron.schedule('0 0 * * *', () => { // Runs daily at midnight
      console.log('Cleaning expired tokens...');
      cleanExpiredTokens();
    });

    // Schedule tasks, e.g., updating delivery locations every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      try {
        console.log('Updating delivery locations...');
        await require('./services/locationUpdater').updateDeliveryLocations();
      } catch (error) {
        console.error('Error updating delivery locations:', error);
      }
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
    process.exit(1);
  });

// Catch-all route for handling 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware for catching other errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Log registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${middleware.route.path} [${middleware.route.methods}]`);
  }
});

console.log('Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${middleware.route.path} [${Object.keys(middleware.route.methods).join(', ').toUpperCase()}]`);
  }
});

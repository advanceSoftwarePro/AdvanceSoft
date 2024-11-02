const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const reportRoute = require('./routes/reportRoutes');

const messageRouter = require('./routes/messageRoute'); 
const { cleanExpiredTokens } = require('./services/tokenCleanUp');
const cron = require('node-cron'); // Single import

const userRoutes = require('./routes/userRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('./controllers/rewardController'); // Import the cron job setup
const fs = require('fs');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Logging middleware for incoming requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

const chartRoutes = require('./routes/chartRoutes');
// Registering routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', profileRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', reportRoute);
app.use('/api/items', itemRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/messages', messageRouter);
app.use('/admin/promotions', promotionRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/users', userRoutes);






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

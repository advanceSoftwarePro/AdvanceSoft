const express = require('express');

const authRoutes = require('./routes/authRoutes'); 
const sequelize = require('./config/database');
const profileRoutes = require('./routes/profileRoutes'); 
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');  
const { cleanExpiredTokens } = require('./services/tokenCleanUp'); 
const rentalRoutes=require('./routes/rentalRoutes');

const fs = require('fs');
require('dotenv').config();




// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Log current directory and its files for debugging
//console.log('Current Directory:', __dirname);
//console.log('Files in Current Directory:', fs.readdirSync(__dirname)); // Log current directory contents

// Routes
app.use('/api', authRoutes);  // Authentication routes
app.use('/api', categoryRoutes);  // Category routes
app.use('/api', profileRoutes);  // Profile-related routes
app.use('/api', deliveryRoutes);  // Delivery routes
app.use('/api/items', itemRoutes);  // Item routes


/*app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.use('/api', profileRoutes);*/

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Sync with the database
sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync failed:', err));
app.use('/api', authRoutes);  // Authentication routes
app.use('/api', categoryRoutes);  // Category routes
app.use('/api', profileRoutes);  // Profile-related routes
app.use('/api', deliveryRoutes);  // Delivery routes
app.use('/api/items', itemRoutes);  // Item routes
app.use('/api/rentals', rentalRoutes);



console.log('Registered routes:');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route);
    }
});



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

// Error handling middleware for catching other errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});



setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000); // Clean up once every 24 hours










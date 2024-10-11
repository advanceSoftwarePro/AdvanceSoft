const express = require('express');
<<<<<<< HEAD
const sequelize = require('./config/database');  // Import sequelize instance
const authRoutes = require('./routes/authRoutes');  // Import authentication routes
=======
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473
const profileRoutes = require('./routes/profileRoutes');  // Import profile routes
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');  // Import item routes
<<<<<<< HEAD
const { cleanExpiredTokens } = require('./services/tokenCleanUp'); // Import the cleanup function
=======
const rentalRoutes=require('./routes/rentalRoutes');
>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473

const fs = require('fs');
require('dotenv').config();

<<<<<<< HEAD
=======



>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473
// Initialize express app
const app = express();

// Middleware to parse JSON
app.use(express.json());
<<<<<<< HEAD
=======

>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473
// Log current directory and its files for debugging
//console.log('Current Directory:', __dirname);
//console.log('Files in Current Directory:', fs.readdirSync(__dirname)); // Log current directory contents

// Routes
<<<<<<< HEAD
app.use('/api', authRoutes);  // Authentication routes
app.use('/api', categoryRoutes);  // Category routes
app.use('/api', profileRoutes);  // Profile-related routes
app.use('/api', deliveryRoutes);  // Delivery routes
app.use('/api/items', itemRoutes);  // Item routes


=======
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


>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473
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
<<<<<<< HEAD
=======
});

// Error handling middleware for catching other errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
>>>>>>> 03c4569d169e4f1d44a59da2ff8fab11ada30473
});

// Error handling middleware for catching other errors
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});



setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000); // Clean up once every 24 hours


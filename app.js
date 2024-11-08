const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const cron = require('node-cron');
const cors = require('cors');
const  User  = require('./models/user');
const { Op } = require('sequelize');
require('dotenv').config();


const reportRoute = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const Promotion = require('./routes/promotionRoutes');
const messageRouter = require('./routes/messageRoute');
const userRoutes = require('./routes/userRoutes');
const Admin = require('./routes/adminRoutes');
const ratingRouter = require('./routes/ratingRoute');
const reviewRouter = require('./routes/reviewRoute');
const favoriteRoutes = require('./routes/favoriteRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { cleanExpiredTokens } = require('./services/tokenCleanUp');

const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());


app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);

  next();
});


app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', profileRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', reportRoute);
app.use('/api/items', itemRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/messages', messageRouter);

app.use('/api/ratings', ratingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/', accountRoutes);
app.use('/admin', Admin);
app.use('/admin/users', userRoutes);


sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully');
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);


      cron.schedule('0 0 * * *', () => {
        console.log('Cleaning expired tokens...');
        cleanExpiredTokens();
      });

      cron.schedule('* * * * *', async () => { 
        try {
          console.log("hi deactive");
          const now = new Date();
          const cutoffTime = new Date(now.getTime() - 2 * 60 * 1000);

          const usersToDelete = await User.findAll({
            where: {
              DeactivationDate: {
                [Op.lte]: cutoffTime
              }
            }
          });

          console.log('Users to be deleted:', usersToDelete.length);

          const deletedUsers = await User.destroy({
            where: {
              DeactivationDate: {
                [Op.lte]: cutoffTime
              }
            }
          });

          console.log(`${deletedUsers} user(s) deleted from the database.`);

        } catch (error) {
          console.error('Error deleting old deactivated accounts:', error);
        }
      });
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
    process.exit(1);
  });


app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});


app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

console.log('Registered routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${middleware.route.path} [${middleware.route.methods}]`);

  }
});
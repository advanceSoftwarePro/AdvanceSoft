
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const app = express();

app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
// Sync with the database
sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync failed:', err));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

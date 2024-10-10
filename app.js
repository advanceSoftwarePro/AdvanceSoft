
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const fs = require('fs');



const profileRoutes = require('./routes/profileRoutes');
const app = express();

app.use(express.json());
console.log('Current Directory:', __dirname);
console.log('Files in Current Directory:', fs.readdirSync(__dirname)); // Make sure to require fs at the top with `const fs = require('fs');`

// Routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.use('/api', profileRoutes);

// Sync with the database
sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync failed:', err));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

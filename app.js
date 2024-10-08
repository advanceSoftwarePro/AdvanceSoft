
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
<<<<<<< HEAD
const categoryRoutes = require('./routes/categoryRoutes');
const fs = require('fs');


=======
const profileRoutes = require('./routes/profileRoutes');
>>>>>>> 453d1b4a7b037f842ca8747d5240e1c8e4da0950
const app = express();

app.use(express.json());
console.log('Current Directory:', __dirname);
console.log('Files in Current Directory:', fs.readdirSync(__dirname)); // Make sure to require fs at the top with `const fs = require('fs');`

// Routes
app.use('/api', authRoutes);
<<<<<<< HEAD
app.use('/api', categoryRoutes);

=======
app.use('/api', profileRoutes);
>>>>>>> 453d1b4a7b037f842ca8747d5240e1c8e4da0950
// Sync with the database
sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync failed:', err));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

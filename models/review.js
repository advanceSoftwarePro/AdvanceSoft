// models/review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path as necessary

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Items', // Adjust if your table name is different
            key: 'ItemID', // Foreign key reference
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Adjust if your table name is different
            key: 'UserID', // Foreign key reference
        },
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
    schema: 'advance', // Add this line to specify the schema
});

module.exports = Review;

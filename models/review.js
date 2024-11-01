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
            model: 'Items', // Reference the Items table
            key: 'ItemID', // Foreign key to ItemID in Items table
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Reference the Users table
            key: 'UserID', // Foreign key to UserID in Users table
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
    schema: 'advance', // Specifies the schema to be used
    tableName: 'Reviews',
    indexes: [
        {
            unique: true, // Ensures user can only review each item once
            fields: ['item_id', 'user_id'],
        },
    ],
});

module.exports = Review;

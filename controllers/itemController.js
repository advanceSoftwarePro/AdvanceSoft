const Item = require('../models/items');
const authService = require('../services/authService');
const { Op } = require('sequelize');
const path = require('path');

exports.createItem = async (req, res) => {
    if (req.user.role === 'Renter') {
      return res.status(403).json({ message: 'Renters cannot create items' });
    }
  
    const { Title, Description, DailyPrice, Condition, AvailabilityStatus, DeliveryOptions, CategoryID } = req.body;
  
    try {
      const newItem = await Item.create({
        Title,
        Description,
        DailyPrice,
        Condition,
        AvailabilityStatus,
        DeliveryOptions,
        CategoryID,
        UserID: req.user.id 
      });
  
      return res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };
  
exports.getAllItems = async (req, res) => {
    try {
      
      const items = await Item.findAll({
        where: {
          UserID: req.user.id, 
        },
      });
  
      
      return res.status(200).json({ items });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };
  
exports.updateItem = async (req, res) => {
    if (req.user.role === 'Renter') {
        return res.status(403).json({ message: 'Renters cannot update items' });
      }
    
    const { id } = req.params;
    const { Title, Description, DailyPrice, Condition, AvailabilityStatus, DeliveryOptions } = req.body;
  
    try {
      const item = await Item.findOne({ where: { ItemID: id, UserID: req.user.id } }); 
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found or not owned by you' });
      }
  
      await item.update({
        Title,
        Description,
        DailyPrice,
        Condition,
        AvailabilityStatus,
        DeliveryOptions,
      });
  
      return res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };

  exports.deleteItem = async (req, res) => {
    if (req.user.role === 'Renter') {
        return res.status(403).json({ message: 'Renters cannot doesnt has items' });
      }
    
    const { id } = req.params;
  
    try {
      const item = await Item.findOne({ where: { ItemID: id, UserID: req.user.id } }); 
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found or not owned by you' });
      }
  
      await item.destroy();
      return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };

  exports.getFilteredItems = async (req, res) => {
    try {
      const { category, condition, maxPrice ,maxSecurityDeposit} = req.query;
      const filter = { AvailabilityStatus: 'Available' }; 
  
      if (category) {
        const categoryRecord = await Category.findOne({ where: { categoryName: category } }); 
  
        if (categoryRecord) {
          filter.CategoryID = categoryRecord.CategoryID; 
        } else {
          return res.status(404).json({ message: 'Category not found' });
        }
      }

 
      if (maxSecurityDeposit){
    filter.SecurityDeposit={ [Op.lte]: maxSecurityDeposit };
  }
      if (condition) {
        filter.Condition = condition; 
      }
  
     
      if (maxPrice) {
        filter.DailyPrice = { [Op.lte]: maxPrice }; 
      }
  
      const items = await Item.findAll({
        where: filter,
        attributes: ['ImageURL', 'Title', 'AvailabilityStatus', 'Condition', 'DailyPrice'] 
      });
  
      return res.status(200).json({ items });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };
  

exports.getItemDetails = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findOne({
      where: { ItemID: itemId }
     
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
      
    const ratingData = await Review.findOne({
      where: { item_id: itemId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });

    const averageRating = ratingData ? parseFloat(ratingData.get('averageRating')).toFixed(1) : null;

    return res.status(200).json({
      Title: item.Title,
      Description: item.Description,
      DailyPrice: item.DailyPrice,
      SecurityDeposit: item.SecurityDeposit,
      Condition: item.Condition,
      DeliveryOptions: item.DeliveryOptions,
      AvailabilityStatus: item.AvailabilityStatus,
      Images: item.ImageURL, 
    AverageRating: averageRating ? averageRating : 'No ratings yet'

    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

exports.searchItems = async (req, res) => {
  const { Name } = req.query;  

  if (!Name) {
      return res.status(400).json({ message: 'Query parameter is required.' });
  }

  try {
      const items = await Item.findAll({
          where: {
              Title: {
                  [Op.iLike]: `%${Name}%`,  
              },
          },
          attributes: ['Title', 'Description', 'DailyPrice', 'Condition', 'AvailabilityStatus'],  
      });

      if (items.length === 0) {
          return res.status(404).json({ message: 'No items found' });
      }

      return res.status(200).json({ items });
  } catch (error) {
      console.error('Error while searching items:', error);
      return res.status(500).json({ message: 'Server error', error });
  }
};

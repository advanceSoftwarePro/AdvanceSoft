const Item = require('../models/items');
const authService = require('../services/authService');
const { Op } = require('sequelize');
const path = require('path');

exports.createItem = async (req, res) => {
    // Check if the user is a Renter
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
        UserID: req.user.id  // Use 'id', which is set in the middleware
      });
  
      return res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };
  
 


// Get all items added by the current user
exports.getAllItems = async (req, res) => {
    try {
      // Filter items by the currently authenticated user's ID
      const items = await Item.findAll({
        where: {
          UserID: req.user.id,  // Use the UserID from the JWT token
        },
      });
  
      // Return the filtered items
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
      const item = await Item.findOne({ where: { ItemID: id, UserID: req.user.id } });  // Use 'id'
  
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
      const item = await Item.findOne({ where: { ItemID: id, UserID: req.user.id } });  // Use 'id'
  
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
  
      // Initialize the filter object
      const filter = { AvailabilityStatus: 'Available' }; 
  
      if (category) {
        const categoryRecord = await Category.findOne({ where: { categoryName: category } }); 
  
        if (categoryRecord) {
          filter.CategoryID = categoryRecord.CategoryID; // Use the found CategoryID
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
        filter.DailyPrice = { [Op.lte]: maxPrice }; // Op.lte for "less than or equal to"
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

    // Find the item by ItemID
    const item = await Item.findOne({
      where: { ItemID: itemId }
     
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Respond with item details
    return res.status(200).json({
      Title: item.Title,
      Description: item.Description,
      DailyPrice: item.DailyPrice,
      SecurityDeposit: item.SecurityDeposit,
      Condition: item.Condition,
      DeliveryOptions: item.DeliveryOptions,
      AvailabilityStatus: item.AvailabilityStatus,
      Images: item.ImageURL, 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

exports.searchItems = async (req, res) => {
  const { Name } = req.query;  // Extract the query parameter from the request

  if (!Name) {
      return res.status(400).json({ message: 'Query parameter is required.' });
  }

  try {
      const items = await Item.findAll({
          where: {
              Title: {
                  [Op.iLike]: `%${Name}%`,  // Use iLIKE for case-insensitive matching
              },
          },
          attributes: ['Title', 'Description', 'DailyPrice', 'Condition', 'AvailabilityStatus'],  // Customize the attributes you want to return
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
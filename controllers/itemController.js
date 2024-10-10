const Item = require('../models/items');
const authService = require('../services/authService');
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
    
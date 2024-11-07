const Category = require('../models/category');
const Item = require('../models/items'); 
const sequelize = require('../config/database'); 

exports.listParentCategories = async (req, res) => {
  try {
   
    const parentCategories = await Category.findAll({
      where: {
        ParentCategoryID: null}
    });

    if (parentCategories.length === 0) {
      return res.status(404).json({ message: 'No parent categories found' });
    }

    return res.status(200).json(parentCategories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const subcategories = await Category.findAll({
      where: { ParentCategoryID: parentId }
    });

    if (subcategories.length === 0) {
      const [results, metadata] = await sequelize.query(
        `SELECT "ImageURL", "Title", "AvailabilityStatus", "Condition", "DailyPrice" 
         FROM "advance"."Items" 
         WHERE "CategoryID" = ${parentId};`
      );
     
    if (results.length === 0) {
        return res.status(404).json({ message: 'No subcategories or items found for the given parent category' });
      }

      return res.status(200).json({ message: 'No subcategories found, but here are the items:', items: results });
    }

    return res.status(200).json(subcategories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.createCategory = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { CategoryName, ParentCategoryID } = req.body;
        const category = await Category.create({
            CategoryName,
            ParentCategoryID
        });

        res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


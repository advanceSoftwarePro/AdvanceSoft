const Rental = require('../models/Rental');
const Item = require('../models/items');
const User = require('../models/User');

// Create a rental
exports.createRental = async (req, res) => {
  const { ItemID, StartDate, EndDate } = req.body;

  // Only Renters can create rentals
  if (req.user.role !== 'Renter') {
    return res.status(403).json({ message: 'Only Renters can rent items' });
  }

  try {
    // Find the item to ensure it exists
    const item = await Item.findOne({ where: { ItemID } });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Calculate total price based on rental period
    const rentalDays = Math.ceil((new Date(EndDate) - new Date(StartDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = rentalDays * item.DailyPrice;

    // Create the rental record
    const rental = await Rental.create({
      ItemID,
      RenterID: req.user.id,
      StartDate,
      EndDate,
      TotalPrice: totalPrice,
    });

    return res.status(201).json({ message: 'Rental created successfully', rental });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Get all rentals by the logged-in user
exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      where: {
        RenterID: req.user.id,
      },
      include: [{ model: Item, as: 'Item' }], // Include item details in the rental info
    });

    return res.status(200).json({ rentals });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Update rental status (Owner/Admin action)
exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only Owners or Admins can update rental status
  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Owners or Admins can update rental statuses' });
  }

  try {
    const rental = await Rental.findOne({ where: { RentalID: id } });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    await rental.update({ Status: status });

    return res.status(200).json({ message: 'Rental status updated successfully', rental });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

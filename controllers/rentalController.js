

// Create a rental (Only Renters can do this)
const Rental = require('../models/Rentals');
//const Item = require('../models/item');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService'); // Import email service

// Create a rental (Only Renters can do this)
exports.createRental = async (req, res) => {
  const { ItemID, StartDate, EndDate } = req.body;

  // Only Renters can create rentals
  if (req.user.role !== 'Renter') {
    return res.status(403).json({ message: 'Only Renters can rent items' });
  }

  try {
    // Find the item to rent
    const item = await Item.findOne({ where: { ItemID } });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find the owner of the item
    const owner = await User.findOne({ where: { UserID: item.UserID } });

    // Calculate the number of rental days
    const rentalDays = Math.ceil((new Date(EndDate) - new Date(StartDate)) / (1000 * 60 * 60 * 24));
    
    // Calculate total price
    const totalPrice = rentalDays * item.DailyPrice;

    // Create the rental
    const rental = await Rental.create({
      ItemID,
      RenterID: req.user.id,
      StartDate,
      EndDate,
      TotalPrice: totalPrice,
      Status: 'Pending',  // Default to Pending
    });

    // Send an email notification to the item owner
    const subject = `New Rental Request for Your Item: ${item.Title}`;
    const text = `Hello ${owner.FullName},

You have received a new rental request for your item "${item.Title}".
Here are the details:

- Renter: ${req.user.fullName} (Email: ${req.user.email})
- Rental Period: From ${StartDate} to ${EndDate}
- Total Price: $${totalPrice}

Please review and approve or reject this request in the system.

Best regards,
Rental Platform Team`;

    const html = `<p>Hello ${owner.FullName},</p>
                  <p>You have received a new rental request for your item <strong>${item.Title}</strong>.</p>
                  <h4>Rental Details:</h4>
                  <ul>
                    <li><strong>Renter:</strong> ${req.user.fullName} (Email: ${req.user.email})</li>
                    <li><strong>Rental Period:</strong> From ${StartDate} to ${EndDate}</li>
                    <li><strong>Total Price:</strong> $${totalPrice}</li>
                  </ul>
                  <p>Please review and approve or reject this request in the system.</p>
                  <p>Best regards,</p>
                  <p>Rental Platform Team</p>`;

    // Send the email
    await sendEmail(owner.Email, subject, text, html);

    return res.status(201).json({ message: 'Rental created successfully, owner has been notified', rental });
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
// Get all rentals for the current user (filtered by status)
exports.getAllRentals = async (req, res) => {
  const { status } = req.query; // Get status from query parameter

  try {
    let rentals;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a rental status.' });
    }

    if (req.user.role === 'Renter') {
      // Fetch rentals for the current renter filtered by status
      rentals = await Rental.findAll({
        where: { RenterID: req.user.id, Status: status },
        include: [{ model: Item, as: 'Item' }],
      });
    } else if (req.user.role === 'Owner') {
      // Fetch rentals for the current owner's items filtered by status
      rentals = await Rental.findAll({
        where: { Status: status },
        include: [{ model: Item, as: 'Item', where: { UserID: req.user.id } }],
      });
    }

    if (rentals.length === 0) {
      return res.status(404).json({ message: `No rentals found with status: ${status}` });
    }

    return res.status(200).json({ rentals });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};


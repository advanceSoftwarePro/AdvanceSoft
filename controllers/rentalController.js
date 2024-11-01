const Item = require('../models/items');
const Rental = require('../models/Rental');
const Delivery = require('../models/Delivery');
const DeliveryDriver =require('../models/DeliveryDriver');
const User = require('../models/User');
const Distance =require('../services/getDeliveryFeeByArea');
const { sendEmail } = require('../utils/emailService'); 

exports.createRental = async (req, res) => {
  const { ItemID, StartDate, EndDate, DeliveryOption, DeliveryAddress } = req.body;

  // Validate required fields
  if (!ItemID || !StartDate || !EndDate) {
    return res.status(400).json({ message: 'Please provide ItemID, StartDate, and EndDate' });
  }

  // Check if dates are valid and EndDate is after StartDate
  const startDateObj = new Date(StartDate);
  const endDateObj = new Date(EndDate);
  if (isNaN(startDateObj) || isNaN(endDateObj) || startDateObj >= endDateObj) {
    return res.status(400).json({ message: 'Please provide valid StartDate and EndDate, with EndDate after StartDate' });
  }

  if (!DeliveryOption || !['Pickup', 'Delivery'].includes(DeliveryOption)) {
    return res.status(400).json({ message: 'Please specify a valid DeliveryOption: Pickup or Delivery' });
  }

  // Only Renters can create rentals
  if (req.user.role !== 'Renter') {
    return res.status(403).json({ message: 'Only Renters can rent items' });
  }

  try {
    const item = await Item.findOne({ where: { ItemID } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check item availability
    if (item.AvailabilityStatus !== 'Available') {
      return res.status(400).json({ message: 'Item is not available for rental' });
    }

    const owner = await User.findOne({ where: { UserID: item.UserID } });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    // Calculate the number of rental days
    const rentalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    const rentalPrice = rentalDays * item.DailyPrice;

    // Calculate delivery fee if DeliveryOption is 'Delivery'
    let deliveryFee = 0;
    if (DeliveryOption === 'Delivery') {
      const pickupLocation = owner.Address;  // Owner's address (string)
      const deliveryLocation = DeliveryAddress; // Renter's delivery address (string)

      // Geocode pickup and delivery addresses to get coordinates
      const pickupCoordinates = await Distance.geocodeAddress(pickupLocation);
      const deliveryCoordinates = await Distance.geocodeAddress(deliveryLocation);

      if (!pickupCoordinates || !deliveryCoordinates) {
        return res.status(400).json({ message: 'Could not geocode pickup or delivery address' });
      }

      // Call the HERE Routing API to get the route information
      const route = await Distance.getRoute(pickupCoordinates, deliveryCoordinates);
      if (!route || route.error) return res.status(400).json({ message: 'Delivery not available for this area' });

      // Use the distance from the route response to calculate the delivery fee
      const distanceInKilometers = route.length / 1000; // Assuming route.length is in meters
      console.log(distanceInKilometers);
      deliveryFee = Math.ceil(distanceInKilometers); // Charge $1 per kilometer
    }

    // Calculate total price
    const totalPrice = rentalPrice + deliveryFee;

    // Create the rental
    const rental = await Rental.create({
      ItemID,
      RenterID: req.user.id,
      StartDate,
      EndDate,
      TotalPrice: totalPrice,
      DeliveryOption,
      DeliveryAddress: DeliveryOption === 'Delivery' ? DeliveryAddress : null,
      Status: 'Pending',  // Default to Pending
    });
    console.log(DeliveryOption);

    // Send an email notification to the item owner
    const subject = `New Rental Request for Your Item: ${item.Title}`;
    const text = `Hello ${owner.FullName},\n\nYou have received a new rental request for your item "${item.Title}". Here are the details:\n\n- Renter: ${req.user.fullName} (Email: ${req.user.email})\n- Rental Period: From ${StartDate} to ${EndDate}\n- Total Price: $${totalPrice}\n- Delivery Option: ${DeliveryOption}\n- Delivery Address: ${DeliveryAddress || 'N/A'}\n\nPlease review and approve or reject this request in the system.\n\nBest regards,\nRental Platform Team`;

    const html = `<p>Hello ${owner.FullName},</p>
                  <p>You have received a new rental request for your item <strong>${item.Title}</strong>.</p>
                  <h4>Rental Details:</h4>
                  <ul>
                    <li><strong>Renter:</strong> ${req.user.fullName} (Email: ${req.user.email})</li>
                    <li><strong>Rental Period:</strong> From ${StartDate} to ${EndDate}</li>
                    <li><strong>Rental Price:</strong> $${rentalPrice}</li>
                    <li><strong>Delivery Price:</strong> $${deliveryFee}</li>
                    <li><strong>Total Price:</strong> $${totalPrice}</li>
                    <li><strong>Delivery Option:</strong> ${DeliveryOption}</li>
                    <li><strong>Delivery Address:</strong> ${DeliveryAddress || 'N/A'}</li>
                  </ul>
                  <p>Please review and approve or reject this request in the system.</p>
                  <p>Best regards,</p>
                  <p>Rental Platform Team</p>`;

    await sendEmail(owner.Email, subject, text, html);
    console.log("d" + DeliveryOption);
    return res.status(201).json({ message: 'Rental created successfully, owner has been notified', rental });
  } catch (error) {
    console.error('Error creating rental:', error);
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};





exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only Owners or Admins can update rental status
  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Owners or Admins can update rental statuses' });
  }

  // Validate the status input
  const allowedStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Allowed values are Pending, Approved, Rejected, and Completed.' });
  }

  try {
    // Fetch the rental by ID
    const rental = await Rental.findOne({ where: { RentalID: id } });
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    
    // Fetch renter's details
    const renter = await User.findOne({ where: { UserID: rental.RenterID } });
    if (!renter) {
      return res.status(404).json({ message: 'Renter not found' });
    }

    // Fetch item details for email content
    const item = await Item.findOne({ where: { ItemID: rental.ItemID } });
    const itemTitle = item ? item.Title : 'the item';

    // Prepare email subject, plain text, and HTML content
    const emailSubject = `Rental Request ${status === 'Rejected' ? 'Rejected' : 'Accepted'}`;
    const emailText = `Hello ${renter.FullName},

Your rental request for ${itemTitle} has been ${status} by the owner.

${status === 'Accepted' ? 'Thank you for renting with us. We will process your rental shortly.' : 'We apologize that your rental request has been rejected.'}

If you have any questions, please feel free to contact us.

Best Regards,
Your Company Team`;

    const emailHtml = `
      <h3>Hello ${renter.FullName},</h3>
      <p>Your rental request for <strong>${itemTitle}</strong> has been <strong>${status}</strong> by the owner.</p>
      ${status === 'Accepted' ? `<p>Thank you for renting with us. We will process your rental shortly.</p>` : `<p>We apologize that your rental request has been rejected.</p>`}
      <p>If you have any questions, please feel free to contact us.</p>
      <p>Best Regards,<br>Your Company Team</p>
    `;

    // Check if the delivery option is 'Delivery'
    if (rental.DeliveryOption === 'Delivery') {
      if (status === 'Rejected') {
        await rental.update({ Status: status });
        await sendEmail(renter.Email, emailSubject, emailText, emailHtml); // Send email
        return res.status(200).json({ message: 'Rental status updated successfully and email sent to renter.', rental });
      }

      // Continue with driver assignment for non-rejected statuses
      const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
      if (!deliveryCoords) {
        return res.status(400).json({ message: 'Invalid delivery address' });
      }

      const drivers = await DeliveryDriver.findAll({ where: { Status: 'Active' } });
      const availableDrivers = drivers.filter(driver => driver.Deliveries.length < 10);
      if (availableDrivers.length === 0) {
        return res.status(404).json({ message: 'No active drivers available for delivery with less than 10 rentals.' });
      }

      let closestDriver = null;
      let closestDistance = Infinity;
      for (const driver of drivers) {
        const driverCoords = await Distance.geocodeAddress(driver.Area);
        if (!driverCoords) {
          console.error(`Could not geocode address for driver: ${driver.Area}`);
          continue;
        }

        const routeSummary = await Distance.getRoute(driverCoords, deliveryCoords);
        if (routeSummary && routeSummary.length > 0) {
          const distance = routeSummary.length;
          if (distance < closestDistance) {
            closestDistance = distance;
            closestDriver = driver;
          }
        }
      }

      if (!closestDriver) {
        return res.status(404).json({ message: 'No active drivers available for delivery.' });
      }

      const newDelivery = await Delivery.create({
        RentalID: rental.RentalID,
        DriverID: closestDriver.DriverID,
        PickupLocation: rental.DeliveryAddress,
        DeliveryLocation: rental.DeliveryAddress,
        DeliveryDate: rental.StartDate,
        DeliveryStatus: 'Pending',
        CurrentLatitude: deliveryCoords.latitude,
        CurrentLongitude: deliveryCoords.longitude
      });

      await rental.update({ Status: status, DriverID: closestDriver.DriverID });
      await sendEmail(renter.Email, emailSubject, emailText, emailHtml); // Send email

      return res.status(200).json({ message: 'Rental status updated successfully, delivery assigned, and email sent to renter.', rental, delivery: newDelivery });
    } else {
      await rental.update({ Status: status });
      await sendEmail(renter.Email, emailSubject, emailText, emailHtml); // Send email
      return res.status(200).json({ message: 'Rental status updated successfully and email sent to renter.', rental });
    }
  } catch (error) {
    console.error('Error updating rental status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};




/*
exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only Owners or Admins can update rental status
  if (req.user.role !== 'Owner' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Owners or Admins can update rental statuses' });
  }

  try {
    // Fetch the rental by ID
    const rental = await Rental.findOne({ where: { RentalID: id } });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the delivery option is 'Delivery'
    if (rental.DeliveryOption === 'Delivery') {
      // If the status is 'Rejected', do not store delivery info
      if (status === 'Rejected') {
        await rental.update({ Status: status });
        return res.status(200).json({ message: 'Rental status updated successfully', rental });
      }

      // Proceed with storing delivery information for other statuses
      const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
      
      if (!deliveryCoords) {
        return res.status(400).json({ message: 'Invalid delivery address' });
      }

      // Fetch all active drivers
      const drivers = await DeliveryDriver.findAll({
        where: { Status: 'Active' }
      });


const availableDrivers = drivers.filter(driver => driver.Deliveries.length < 10);

if (availableDrivers.length === 0) {
  return res.status(404).json({ message: 'No active drivers available for delivery with less than 10 rentals.' });
}      
      let closestDriver = null;
      let closestDistance = Infinity;

      // Loop through drivers to find the closest one
      for (const driver of drivers) {
        const driverCoords = await Distance.geocodeAddress(driver.Area);

        if (!driverCoords) {
          console.error(`Could not geocode address for driver: ${driver.Area}`);
          continue; // Skip if geocoding fails
        }

        const routeSummary = await Distance.getRoute(driverCoords, deliveryCoords);

        if (routeSummary && routeSummary.length > 0) {
          const distance = routeSummary.length; // Assume length is in meters
          if (distance < closestDistance) {
            closestDistance = distance;
            closestDriver = driver;
          }
        }
      }

      if (!closestDriver) {
        return res.status(404).json({ message: 'No active drivers available for delivery.' });
      }

      // Create a new delivery record
      const newDelivery = await Delivery.create({
        RentalID: rental.RentalID,
        DriverID: closestDriver.DriverID,
        PickupLocation: rental.DeliveryAddress, // Assuming the pickup location is the delivery address
        DeliveryLocation: rental.DeliveryAddress,
        DeliveryDate: rental.StartDate, // Set current date as delivery date, or adjust as necessary
        DeliveryStatus: 'Pending', // Set initial delivery status
        CurrentLatitude: deliveryCoords.latitude, // Assuming geocodeAddress returns latitude
        CurrentLongitude: deliveryCoords.longitude // Assuming geocodeAddress returns longitude
      });

      // Update the rental status and assign the driver
      await rental.update({ Status: status, DriverID: closestDriver.DriverID });

      return res.status(200).json({ message: 'Rental status updated successfully', rental, delivery: newDelivery });
    } else {
      // Update status without driver assignment for non-delivery options
      await rental.update({ Status: status });
    }

    return res.status(200).json({ message: 'Rental status updated successfully', rental });
  } catch (error) {
    console.error('Error updating rental status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }

  //To_DO html_email
};
*/

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
    console.error('Error fetching rentals:', error); // Log the actual error
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};


exports.getCompletedRentals = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      where: { Status: 'Completed' }, // Ensure the case matches your model's schema
      include: [{ model: Item, as: 'Item' }], // Include related Item details
    });

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({ message: 'No completed rentals found.' });
    }

    res.status(200).json({ rentals });
  } catch (error) {
    console.error('Error fetching completed rentals:', error);
    res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};

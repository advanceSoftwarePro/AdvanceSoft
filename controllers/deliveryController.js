const Delivery = require('../models/Delivery');
const { Op } = require('sequelize');
const path = require('path');

const { sequelize } = require('../utils/database');
const cron = require('node-cron');

async function sendReminderEmails() {
  try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      // SQL query to fetch deliveries scheduled for tomorrow
      const query = `
          SELECT 
              d."DriverID",
              dd."Email" AS "DriverEmail",
              r."RentalID",
             
              r."StartDate",
              r."EndDate",
              r."DeliveryAddress",
              r."TotalPrice",
              d."PickupLocation",
              d."DeliveryLocation"
          FROM 
              advance."Deliveries" d
          JOIN 
              advance."DeliveryDrivers" dd ON d."DriverID" = dd."DriverID"
          JOIN 
              advance."Rentals" r ON d."RentalID" = r."RentalID"
          WHERE 
              d."DeliveryDate" >= :tomorrow AND d."DeliveryDate" <= :endOfTomorrow
              AND r."Status" = 'Approved'
              AND r."DeliveryOption" = 'Delivery';
      `;

      // Execute the SQL query
      const [results] = await sequelize.query(query, {
          replacements: { tomorrow, endOfTomorrow }
      });

      // Loop through the fetched results and send emails
      for (const row of results) {
          const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(row.PickupLocation)}&destination=${encodeURIComponent(row.DeliveryLocation)}`;
          
          const subject = `Upcoming Delivery for Rental #${row.RentalID}`;
          const emailText = `Reminder: Your delivery for rental ${row.RentalName} starts tomorrow. 
              Pickup Location: ${row.PickupLocation}
              Delivery Location: ${row.DeliveryLocation}
              Total Price: ${row.TotalPrice}
              View Route: ${mapUrl}`;
          
          const emailHtml = `<p>Your delivery for rental <strong>${row.RentalName}</strong> starts tomorrow.</p>
              <p><strong>Pickup Location:</strong> ${row.PickupLocation}</p>
              <p><strong>Delivery Location:</strong> ${row.DeliveryLocation}</p>
              <p><strong>Total Price:</strong> ${row.TotalPrice}</p>
              <p><strong>Map Route:</strong> <a href="${mapUrl}">View Route</a></p>`;

          await sendEmail(row.DriverEmail, subject, emailText, emailHtml);
          console.log(`Sending email to: ${row.DriverEmail} for Rental ID: ${row.RentalID}`);
      }
  } catch (error) {
      console.error('Error sending reminder emails:', error);
  }
}

// Schedule the cron job
cron.schedule('0 0 * * *', async () => {
    console.log('Checking for deliveries starting tomorrow...');
    await sendReminderEmails();
});

// Function to create a new delivery
const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    //Delivery.save();
    return res.status(201).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Function to get delivery details
const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Function to update delivery location

// Function to update the current location of a delivery
/*const updateDeliveryLocation = async (req, res) => {
  const { DeliveryID, CurrentLatitude, CurrentLongitude } = req.body;

  try {
    const delivery = await Delivery.findByPk(DeliveryID);
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    // Update the location fields
    delivery.CurrentLatitude = CurrentLatitude;
    delivery.CurrentLongitude = CurrentLongitude;

    await delivery.save();
    return res.status(200).json({
      message: "Location updated successfully",
      delivery,
    });
  } catch (error) {
    console.error("Error updating delivery location:", error);
    return res.status(500).json({ error: error.message });
  }
};*/


// Function to delete a delivery
const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    await delivery.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getDeliveryLocationForCustomer = async (req, res) => {
  try {
    // Check if the user is a customer
    if (req.user.role !== 'Renter') {
      return res.status(403).json({ message: 'Access denied. Only customers can view delivery locations.' });
    }

    const deliveryID = req.params.id;

    // Find the delivery by ID
    const delivery = await Delivery.findByPk(deliveryID);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Generate the Google Maps link
    const googleMapsLink = `https://www.google.com/maps/dir//${delivery.CurrentLatitude},${delivery.CurrentLongitude}/`;

    // Respond with the delivery location details
    return res.status(200).json({
      PickupLocation: delivery.PickupLocation,
      DeliveryLocation: delivery.DeliveryLocation,
      CurrentLatitude: delivery.CurrentLatitude,
      CurrentLongitude: delivery.CurrentLongitude,
      GoogleMapsLink: googleMapsLink,  // Include the Google Maps link
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDelivery,
  getDelivery,
  getDeliveryLocationForCustomer,
  deleteDelivery,
};

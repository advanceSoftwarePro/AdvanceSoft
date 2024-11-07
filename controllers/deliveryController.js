const Delivery = require('../models/Delivery');
const { Op } = require('sequelize');
const path = require('path');
const sendEmail = require('../utils/emailService'); 

const { sequelize } = require('../utils/database');
const cron = require('node-cron');
const Rentals = require('../models/Rental');

async function sendReminderEmails() {
  try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

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

      const [results] = await sequelize.query(query, {
          replacements: { tomorrow, endOfTomorrow }
      });
      for (const row of results) {

        const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(row.PickupLocation)}&destination=${encodeURIComponent(row.DeliveryLocation)}`;

        const completeDeliveryUrl = `http://localhost:3000/api/complete-delivery?driverId=${row.DriverID}&rentalId=${row.RentalID}`;

        const subject = `Upcoming Delivery for Rental #${row.RentalID}`;
        const emailText = `
            Reminder: Your delivery for rental ${row.RentalName} starts tomorrow.
            Pickup Location: ${row.PickupLocation}
            Delivery Location: ${row.DeliveryLocation}
            Total Price: ${row.TotalPrice}
            View Route: ${mapUrl}
            Complete Delivery: ${completeDeliveryUrl}
        `;

        const emailHtml = `
            <p>Your delivery for rental <strong>${row.RentalName}</strong> starts tomorrow.</p>
            <p><strong>Pickup Location:</strong> ${row.PickupLocation}</p>
            <p><strong>Delivery Location:</strong> ${row.DeliveryLocation}</p>
            <p><strong>Total Price:</strong> ${row.TotalPrice}</p>
            <p><strong>Map Route:</strong> <a href="${mapUrl}">View Route</a></p>
            <p><strong>Complete Delivery:</strong> <a href="${completeDeliveryUrl}">Mark as Complete</a></p>
        `;

        await sendEmail.sendEmail(row.DriverEmail, subject, emailText, emailHtml);
        console.log(`Sending email to: ${row.DriverEmail} for Rental ID: ${row.RentalID}`);
    }
} catch (error) {
    console.error('Error sending reminder emails:', error);
}

}

cron.schedule('* * * * *', async () => {
    console.log('Checking for deliveries starting tomorrow...');
    await sendReminderEmails();
});

const completeDelivery = async (req, res) => {
  const { driverId, rentalId } = req.query;

  const transaction = await sequelize.transaction();

  try {
      const delivery = await Delivery.findOne({
          where: { DriverID: driverId, RentalID: rentalId },
          transaction,
      });

      const Rent = await Rentals.findOne({
        where: {  RentalID: rentalId },
        transaction,
    });
      if (!delivery) {
          return res.status(404).json({ error: 'Delivery not found' });
      }

      await delivery.update({ DeliveryStatus: 'Completed' }, { transaction });

      await Rent.update(
          { paymentStatus: 'Paid' },
          {
              where: { RentalID: rentalId },
              transaction,
          }
      );

      await transaction.commit();

      res.json({ message: 'Delivery and payment status updated successfully!' });
  } catch (error) {
      await transaction.rollback();
      console.error('Error completing delivery and updating payment status:', error);
      res.status(500).json({ error: 'An error occurred while completing the delivery.' });
  }
};

const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    return res.status(201).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

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
    if (req.user.role !== 'Renter') {
      return res.status(403).json({ message: 'Access denied. Only customers can view delivery locations.' });
    }

    const deliveryID = req.params.id;

    const delivery = await Delivery.findByPk(deliveryID);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const googleMapsLink = `https://www.google.com/maps/dir//${delivery.CurrentLatitude},${delivery.CurrentLongitude}/`;

    return res.status(200).json({
      PickupLocation: delivery.PickupLocation,
      DeliveryLocation: delivery.DeliveryLocation,
      CurrentLatitude: delivery.CurrentLatitude,
      CurrentLongitude: delivery.CurrentLongitude,
      GoogleMapsLink: googleMapsLink,  
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
  completeDelivery
  
};

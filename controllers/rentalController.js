const Item = require('../models/items');
const Rental = require('../models/Rental');
const Delivery = require('../models/Delivery');
const DeliveryDriver =require('../models/DeliveryDriver');
const Distance =require('../services/getDeliveryFeeByArea');
const { sendEmail } = require('../utils/emailService'); 
const User =require('../models/user');

const endpointSecret = 'whsec_KPIBlGQlE48XnpSdkPHKRIdu2p2GVMO7'; 
const stripe = require('stripe')('sk_test_51Q67wNP2XFAQ7ru8gaqYklalVKL8ZlDYVpZYc0C2RVMESwBOxrP1RE1Z8NNvp5OYV4UnKmgouaQfASf5gDWfuX2c009N4rwRHI');

const validateRequestData = (reqBody) => {
  const { ItemID, StartDate, EndDate, DeliveryOption, paymentMethod, amount } = reqBody;

  if (!ItemID || !StartDate || !EndDate || !paymentMethod) {
    throw new Error('Please provide ItemID, StartDate, EndDate, and paymentMethod');
  }

  if (paymentMethod.toLowerCase() !== 'cash' && amount == null) {
    throw new Error('Please provide an amount for non-cash payments');
  }

  if (!DeliveryOption || !['Pickup', 'Delivery'].includes(DeliveryOption)) {
    throw new Error('Please specify a valid DeliveryOption: Pickup or Delivery');
  }
};

const validateDatesAndGetRentalPeriod = (StartDate, EndDate) => {
  const startDateObj = new Date(StartDate);
  const endDateObj = new Date(EndDate);
  if (isNaN(startDateObj) || isNaN(endDateObj) || startDateObj >= endDateObj) {
    throw new Error('Please provide valid StartDate and EndDate, with EndDate after StartDate');
  }
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((endDateObj - startDateObj) / oneDay));
};


const fetchItemAndOwner = async (ItemID) => {
  const item = await Item.findOne({ where: { ItemID } });
  if (!item) throw new Error('Item not found');
  if (item.AvailabilityStatus !== 'Available') throw new Error('Item is not available for rental');

  const owner = await User.findOne({ where: { UserID: item.UserID } });
  if (!owner) throw new Error('Owner not found');

  return { item, owner };
};

const calculateDeliveryFee = async (DeliveryOption, ownerAddress, DeliveryAddress) => {
  if (DeliveryOption !== 'Delivery') return 0;

  const pickupCoordinates = await Distance.geocodeAddress(ownerAddress);
  const deliveryCoordinates = await Distance.geocodeAddress(DeliveryAddress);

  if (!pickupCoordinates || !deliveryCoordinates) {
    throw new Error('Could not geocode pickup or delivery address');
  }

  const route = await Distance.getRoute(pickupCoordinates, deliveryCoordinates);
  if (!route || route.error) throw new Error('Delivery not available for this area');

  const distanceInKilometers = route.length / 1000;
  return Math.ceil(distanceInKilometers * 0.1); 
};

const processPayment = async (paymentMethod, totalPrice) => {
  if (paymentMethod.toLowerCase() === 'cash') {
    return { paymentIntentId: null, paymentStatus: 'PaymentPending' };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPrice * 100, 
    currency: 'usd',
    payment_method: 'pm_card_visa',          
    payment_method_types: ['card'], 
  });

  const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
  if (confirmedPaymentIntent.status === 'succeeded') {
    return { paymentIntentId: paymentIntent.id, paymentStatus: 'Completed' };
  }

  throw new Error('Payment not successful');
};


const createRentalAndNotifyOwner = async (req,renter, item, owner, totalPrice, discountPrice, deliveryFee, rentalPeriod, paymentDetails) => {
  const { StartDate, EndDate, DeliveryOption, DeliveryAddress, paymentMethod } = req.body;
  const rental = await Rental.create({
    ItemID: item.ItemID,
    RenterID: req.user.id,
    StartDate,
    EndDate,
    TotalPrice: totalPrice,
    DeliveryOption,
    DeliveryAddress: DeliveryOption === 'Delivery' ? DeliveryAddress : null,
    Status: 'Pending',
    paymentStatus: paymentDetails.paymentStatus,
    paymentIntentId: paymentDetails.paymentIntentId,
    paymentMethod
  });

 await sendEmail(
    owner.Email,
    `📬 New Rental Request for Your Item: ${item.Title}`,
    `Hello ${owner.FullName},\n\n` +
    `You have received a new rental request for your item "${item.Title}".\n\n` +
    `Rental Details:\n` +
    `Renter: ${renter.FullName || 'undefined'} (Email: ${renter.Email || 'undefined'})\n` +
    `Rental Period: From ${rental.StartDate} to ${rental.EndDate}\n` +
    `Total Price: $${rental.TotalPrice}\n\n` +
    `Total Price After Discount: $${discountPrice}\n\n` +
    `• Delivery Option: ${rental.DeliveryOption}\n` +
    `• Delivery Address: ${rental.DeliveryAddress}\n\n` +
    `Please review and approve or reject this request in the system.\n\n` +
    `Best regards,\n` +
    `Rental Platform Team`,
  
    `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #007bff; text-align: center;">
        📬 New Rental Request for Your Item
      </h2>
      <p>Hello <strong>${owner.FullName}</strong>,</p>
      <p>You have received a new rental request for your item "<strong>${item.Title}</strong>".</p>
      <h3 style="color: #007bff; margin-top: 20px;">Rental Details</h3>
      <ul style="list-style: none; padding: 0;">
        <li>👤 <strong>Renter:</strong> ${renter.FullName || 'undefined'} (<a href="mailto:${renter.Email}" style="color: #007bff; text-decoration: none;">${renter.Email || 'undefined'}</a>)</li>
        <li>📅 <strong>Rental Period:</strong> From ${rental.StartDate} to ${rental.EndDate}</li>
        <li>💰 <strong>Total Price:</strong> $${rental.TotalPrice}</li>
        <li>💸 <strong>Price After Discount:</strong> $${discountPrice}</li>
        <li>🚚 <strong>Delivery Option:</strong> ${rental.DeliveryOption}</li>
        <li>🏠 <strong>Delivery Address:</strong> ${rental.DeliveryAddress}</li>
      </ul>
      <p>Please review and approve or reject this request in the system.</p>
      <p style="font-weight: bold;">Best regards,</p>
      <p>Rental Platform Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 14px; color: #888; text-align: center;">
        📧 This is an automated message from the Rental Platform. Please do not reply directly to this email.
      </p>
    </div>
    `
);

  return rental;
};


const Promotion = require('../models/Promotion');
const { Op } = require('sequelize');

async function getApplicablePromotion(rentalStartDate, basePrice) {
  try {
      
      const promotion = await Promotion.findOne({
          where: {
              isActive: true,
              startDate: { [Op.lte]: rentalStartDate },
              endDate: { [Op.gte]: rentalStartDate }, 
          },
      });

      if (!promotion) {
        console.log("jjj");
          return basePrice; 
      }

      
      const discountAmount = (promotion.discountPercentage / 100) * basePrice;
      const discountedPrice = basePrice - discountAmount; 
      
      console.log(`Promotion found: ${promotion.discountPercentage}% off`);
      console.log(`Original Price: ${basePrice}`);
      console.log(`Discount Amount: ${discountAmount}`);
      console.log(`Discounted Price: ${discountedPrice}`);
      
      return discountedPrice; 
  } catch (error) {
      console.error('Error fetching applicable promotion:', error);
      throw error;
  }
}




exports.createRental = async (req, res) => {
  try {
    validateRequestData(req.body);
    if (req.user.role !== 'Renter') {
      return res.status(403).json({ message: 'Only Renters can rent items' });
    }

    const rentalPeriod = validateDatesAndGetRentalPeriod(req.body.StartDate, req.body.EndDate);
    const { item, owner } = await fetchItemAndOwner(req.body.ItemID);
    const deliveryFee = await calculateDeliveryFee(req.body.DeliveryOption, owner.Address, req.body.DeliveryAddress);
    let totalPrice = item.DailyPrice * rentalPeriod + deliveryFee;

    console.log("before discount: " + totalPrice);
    
    console.log("Request Body:", req.body); 
    console.log("Fetching applicable promotion for rental start date:", req.body.StartDate);

     let discountPrice = await getApplicablePromotion(req.body.StartDate, totalPrice);
     console.log("Total Price after promotion function:", totalPrice);
    console.log("after discount: " + discountPrice);

    const parsedAmount = req.body.amount != null ? parseFloat(req.body.amount) : totalPrice;
    if (parsedAmount !== discountPrice && req.body.paymentMethod.toLowerCase() !== 'cash') {
      return res.status(400).json({ 
        message: 'The provided amount does not match the total price.', 
        totalPrice, 
        providedAmount: req.body.amount 
      });
    }
    const paymentDetails = await processPayment(req.body.paymentMethod, totalPrice);
    
    const renter = await User.findOne({
      where: { UserID: req.user.id }, 
      attributes: ['FullName', 'Email'] 
    });
    res.status(201).json({ 
      message: 'Rental created successfully, owner has been notified', 
      rental 
    });
    
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};



const authorizeUser = (user) => {
  if (user.role !== 'Owner' && user.role !== 'Admin') {
    throw new Error('Only Owners or Admins can update rental statuses');
  }
};

const fetchRentalById = async (id) => {
  const rental = await Rental.findOne({ where: { RentalID: id } });
  if (!rental) throw new Error('Rental not found');
  return rental;
};

const createPaymentLinkAndNotifyRenter = async (rental) => {
  if (rental.paymentMethod === 'cash' && rental.paymentStatus !== 'Complete') {
    try {
      const securityDepositItem = await getSecurityDepositItem(rental.ItemID);
      const depositAmount = securityDepositItem ? securityDepositItem.SecurityDeposit : 0;
      const depositAmountInteger = Math.floor(Number(depositAmount));
      const paymentLink = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Security Deposit',
                description: 'Refundable security deposit for rental',
              },
              unit_amount: depositAmountInteger,
            },
            quantity: 1,
          },
        ],
        metadata: {
          rentalID: rental.RentalID,
        },
        mode: 'payment',
        success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://yourdomain.com/cancel',
      });

      console.log('Payment Link Created:', paymentLink);

      const sessionId = paymentLink.id; 
console.log(sessionId);
      await Rental.update(
        { paymentIntentId: sessionId }, 
        { where: { RentalID: rental.RentalID } } 
      );
      console.log('Full Payment Link Response:', JSON.stringify(paymentLink, null, 2));
      const renter = await getRenterById(rental.RenterID);
      const renterEmail = renter ? renter.Email : null;
  
      if (!renterEmail) {
        throw new Error('No renter email found.');
      }

      console.log('Renter Email:', renterEmail);
      
       await sendEmail(
        renterEmail,
        '💰 Deposit Payment Required for Your Rental Request',
        'Your Rental Request Has been accepted! Please complete the security deposit payment to proceed with your rental.', // Plain text version
        `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #007bff; text-align: center;">🎉 Your Rental Request is Accepted! 🎉</h2>
          <p>Hello ${rental.renterName || 'Valued Customer'},</p>
          <p>We’re excited to help you with your rental! To secure your booking, please complete the security deposit payment by clicking the button below:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${paymentLink.url}" style="
              display: inline-block;
              background-color: #007bff;
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              border-radius: 6px;
              box-shadow: 0 4px 6px rgba(0, 123, 255, 0.3);
            ">💳 Pay Deposit</a>
          </p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team — we’re here to help!</p>
          <p>Thank you for choosing us, and we look forward to a smooth and seamless rental experience.</p>
          <p style="font-weight: bold;">Best regards,</p>
          <p>Your Rental Team 🏠</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; color: #888; text-align: center;">
            This email has been scanned for viruses by Avast antivirus software. 🛡️<br>
            <a href="https://www.avast.com" style="color: #007bff; text-decoration: none;">www.avast.com</a>
          </p>
        </div>
        `
    );
      
      
      

      return { message: 'Renter notified to pay the security deposit successfully' };
    } catch (error) {
      console.error('Failed to create payment link or notify renter:', error.message);
      return { message: 'Failed to create payment link or notify renter.', error: error.message };
    }
  }
  return null;
};

const getSecurityDepositItem = async (itemId) => {
  return await Item.findOne({ where: { ItemID: itemId } });
};

const getRenterById = async (renterId) => {
  console.log(renterId);
  return await User.findOne({ where: { UserID: renterId } }); 
};


const findAvailableDriver = async (deliveryCoords) => {
  const drivers = await DeliveryDriver.findAll({
    where: { Status: 'Active' }
  });



   
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
  
  return closestDriver;
  
};

const handleDeliveryAssignment = async (rental, deliveryCoords, status) => {
  if (status === 'Rejected') {
    await rental.update({ Status: status });
    return null;
  }

  const closestDriver = await findAvailableDriver(deliveryCoords);
  const newDelivery = await Delivery.create({
    RentalID: rental.RentalID,
    DriverID: closestDriver.DriverID,
    PickupLocation: rental.DeliveryAddress,
    DeliveryLocation: rental.DeliveryAddress,
    DeliveryDate: rental.StartDate,
    DeliveryStatus: 'Pending',
    CurrentLatitude: deliveryCoords.latitude,
    CurrentLongitude: deliveryCoords.longitude,
  });

  await rental.update({ Status: status, DriverID: closestDriver.DriverID });
  return newDelivery;
};

const updateRentalStatus = async (rental, status) => {
  await rental.update({ Status: status });
  return rental;
};


exports.updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {

    authorizeUser(req.user);
    const rental = await fetchRentalById(id);
    if (status==='Approved' && rental.paymentMethod === 'cash'){
    const paymentLinkResponse = await createPaymentLinkAndNotifyRenter(rental);
    if (paymentLinkResponse) return res.status(200).json(paymentLinkResponse);
    }

    const renter = await User.findOne({
      where: { UserID: req.user.id }, 
      attributes: ['FullName', 'Email'] 
    });

  
  
    let deliveryResponse = null;
    if (rental.DeliveryOption === 'Delivery') {
      const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
      if (!deliveryCoords) {
        return res.status(400).json({ message: 'Invalid delivery address' });
      }

      deliveryResponse = await handleDeliveryAssignment(rental, deliveryCoords, status);
    } 
    else {
      await updateRentalStatus(rental, status);
    }

    const item = await Item.findOne({
      where: { ItemID: rental.ItemID }, 
      attributes: ['Title'] 
    });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
  await sendEmail(
      renter.Email,
      `📢 Your Rental Application Status for ${item.Title}`,
      `Hello ${renter.FullName},\n\n` +
      `We would like to inform you about the status of your rental application for the item "${item.Title}".\n\n` +
      `Status: ${status}\n\n` +
      (status === 'Approved' ? 
          `🎉 Congratulations! Your application has been approved. You can now proceed with the next steps.\n\n` : 
          `⚠️ We regret to inform you that your application has been rejected. Thank you for your interest, and we encourage you to apply again in the future.\n\n`) +
      `If you have any questions or need assistance, please feel free to reach out to us.\n\n` +
      `Best regards,\n` +
      `Rental Platform Team`,
      // HTML version
      `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: ${status === 'Approved' ? '#28a745' : '#dc3545'}; text-align: center;">
          ${status === 'Approved' ? '🎉 Approved!' : '⚠️ Rejected'}
        </h2>
        <p>Hello <strong>${renter.FullName}</strong>,</p>
        <p>We would like to inform you about the status of your rental application for the item "<strong>${item.Title}</strong>".</p>
        <p><strong>Status:</strong> <span style="color: ${status === 'Approved' ? '#28a745' : '#dc3545'};">${status}</span></p>
        ${
          status === 'Approved' 
          ? `<p>🎉 Congratulations! Your application has been approved. You can now proceed with the next steps to secure your rental.</p>`
          : `<p>⚠️ We regret to inform you that your application has been rejected. Thank you for your interest, and we encourage you to apply again in the future.</p>`
        }
        <p>If you have any questions or need assistance, please feel free to reach out to us.</p>
        <p style="font-weight: bold;">Best regards,</p>
        <p>Rental Platform Team</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #888; text-align: center;">
          📧 This is an automated message from the Rental Platform. Please do not reply directly to this email.
        </p>
      </div>
      `
  );
  
  console.log(`Email sent to: ${renter.Email} regarding rental status for: ${item.Title}`);
  


    res.status(200).json({
      message: 'Rental status updated successfully',
      rental,
      delivery: deliveryResponse || null
    });

  } catch (error) {
    console.error('Error updating rental status:', error);
    res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};


exports.getAllRentals = async (req, res) => {
  const { status } = req.query; 

  try {
    let rentals;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a rental status.' });
    }

    if (req.user.role === 'Renter') {
      
      rentals = await Rental.findAll({
        where: { RenterID: req.user.id, Status: status },
        include: [{ model: Item, as: 'Item' }],
      });
    } else if (req.user.role === 'Owner') {
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
    console.error('Error fetching rentals:', error); 
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};



exports.refundDeposit = async (req, res) => {
  const { rentalId } = req.params;

  try {
    const rental = await Rental.findOne({ where: { RentalID: rentalId } });
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const item = await Item.findOne({ where: { ItemID: rental.ItemID } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (req.user.id !== item.UserID) {
      return res.status(403).json({ message: 'Only the owner can refund the deposit' });
    }

    if (!rental.paymentIntentId) {
      return res.status(400).json({ message: 'No deposit payment found for this rental' });
    }

    const depositAmountCents = parseInt(item.SecurityDeposit);

    let refund=null;
    if (rental.paymentMethod==='cash')
    {
      const session = await stripe.checkout.sessions.retrieve(rental.paymentIntentId);

     refund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
    });
  }
  else{
    refund = await stripe.refunds.create({
      payment_intent: rental.paymentIntentId,
      amount: depositAmountCents , 
    });
  }

    await Rental.update(
      { depositRefunded: true },
      { where: { RentalID: rentalId } } 
    );

    return res.status(200).json({ message: 'Deposit refunded successfully', refund });
  } catch (error) {
    console.error('Error refunding deposit:', error);
    return res.status(500).json({ message: 'Server error', error: error.message || 'An unknown error occurred' });
  }
};



exports.assignDeliveryAfterPayment = async (rentalId) => {
  const rental = await Rental.findOne({ where: { RentalID: rentalId } });

  if (!rental) throw new Error(`Rental with ID ${rentalId} not found`);
  if (rental.DeliveryOption !== 'Delivery') return null; 

  const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
  if (!deliveryCoords) throw new Error('Invalid delivery address for assignment');


  return await handleDeliveryAssignment(rental, deliveryCoords, 'Pending'); 
};

exports.checkPaymentStatusAndUpdateRental = async (req, res) => {
  const { rentalId } = req.params;
  console.log(`Checking payment status for rental ID: ${rentalId}`);

  try {
      const rental = await Rental.findOne({ where: { RentalID: rentalId } });
      if (!rental) {
          console.error(`Rental with ID ${rentalId} not found`);
          return res.status(404).json({ error: `Rental with ID ${rentalId} not found` });
      }

      console.log('Rental object:', rental); 

      if (!rental.paymentIntentId) {
          console.error('No payment intent found for this rental');
          return res.status(400).json({ error: 'No payment intent found for this rental' });
      }

      const paymentIntent = await stripe.checkout.sessions.retrieve(rental.paymentIntentId);
    
      if (!paymentIntent) {
          console.error(`No payment intent found for ID: ${rental.paymentIntentId}`);
          return res.status(404).json({ error: 'Payment intent not found' });
      }

      const paymentStatus = paymentIntent.status;
      console.log(`Payment status for rental ID ${rentalId}: ${paymentStatus}`);

      if (paymentStatus === 'complete') {
          await updateRentalStatus(rental, 'Approved');

          if (rental.DeliveryOption === 'Delivery') {
              const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
              if (!deliveryCoords) {
                  console.error('Invalid delivery address for assignment');
                  return res.status(400).json({ error: 'Invalid delivery address for assignment' });
              }
              
              await handleDeliveryAssignment(rental, deliveryCoords, 'Pending');
              console.log(`Delivery assigned for rental ID ${rentalId}`);
          }

          return res.json({
              message: 'Payment status for Security Deposit complete successfully',
              rental,
          });
      } else {
          return res.json({
              message: 'Payment is still pending or failed',
              rental,
              paymentStatus,
          });
      }
  } catch (error) {
      console.error("Error checking payment status:", error.message);
      return res.status(500).json({ error: 'Failed to check payment status' });
  }
};


exports.getCompletedRentals = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
    const rentals = await Rental.findAll({
      where: { Status: 'Completed' }, 
      include: [{ model: Item, as: 'Item' }], 
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

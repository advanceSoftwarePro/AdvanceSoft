const Item = require('../models/items');
const Rental = require('../models/Rental');
const Delivery = require('../models/Delivery');
const DeliveryDriver =require('../models/DeliveryDriver');
const Distance =require('../services/getDeliveryFeeByArea');
const { sendEmail } = require('../utils/emailService'); 

const endpointSecret = 'whsec_KPIBlGQlE48XnpSdkPHKRIdu2p2GVMO7'; 
const stripe = require('stripe')('sk_test_51Q67wNP2XFAQ7ru8gaqYklalVKL8ZlDYVpZYc0C2RVMESwBOxrP1RE1Z8NNvp5OYV4UnKmgouaQfASf5gDWfuX2c009N4rwRHI'); // Replace with your Stripe secret key

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

// Utility to validate dates and calculate rental period
const validateDatesAndGetRentalPeriod = (StartDate, EndDate) => {
  const startDateObj = new Date(StartDate);
  const endDateObj = new Date(EndDate);
  if (isNaN(startDateObj) || isNaN(endDateObj) || startDateObj >= endDateObj) {
    throw new Error('Please provide valid StartDate and EndDate, with EndDate after StartDate');
  }
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((endDateObj - startDateObj) / oneDay));
};

// Function to fetch item and owner information
const fetchItemAndOwner = async (ItemID) => {
  const item = await Item.findOne({ where: { ItemID } });
  if (!item) throw new Error('Item not found');
  if (item.AvailabilityStatus !== 'Available') throw new Error('Item is not available for rental');

  const owner = await User.findOne({ where: { UserID: item.UserID } });
  if (!owner) throw new Error('Owner not found');

  return { item, owner };
};

// Calculate delivery fee based on location and distance
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
  return Math.ceil(distanceInKilometers * 0.1); // $0.10 per kilometer
};

// Process payment using Stripe
const processPayment = async (paymentMethod, totalPrice) => {
  if (paymentMethod.toLowerCase() === 'cash') {
    return { paymentIntentId: null, paymentStatus: 'PaymentPending' };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPrice * 100, // Amount in cents
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

// Create rental and notify the owner by email
const createRentalAndNotifyOwner = async (req, item, owner, totalPrice, deliveryFee, rentalPeriod, paymentDetails) => {
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

  await sendEmail(owner.Email, `New Rental Request for Your Item: ${item.Title}`, 
    `Hello ${owner.FullName},\n\nYou have received a new rental request for your item "${item.Title}".`);

  return rental;
};

//////////
////////////
const Promotion = require('../models/Promotion');
const { Op } = require('sequelize');

async function getApplicablePromotion(rentalStartDate, basePrice) {
    try {
        // Find active promotions where rentalStartDate is within the promotion date range
        const promotion = await Promotion.findOne({
            where: {
                isActive: true,
                startDate: { [Op.lte]: rentalStartDate }, // Promotion start date is before or on the rental start date
                endDate: { [Op.gte]: rentalStartDate }, // Promotion end date is after or on the rental start date
            },
        });

        if (!promotion) {
            return basePrice; // No promotion found, return 0
        }

        // Calculate the discount amount
        const discountAmount = (promotion.discountPercentage / 100) * basePrice;
        return discountAmount; // Return the discount amount
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
    const totalPrice = item.DailyPrice * rentalPeriod + deliveryFee;
    ///////////////
    /////////////
    console.Console("before discount" +totalPrice);
    totalPrice=getApplicablePromotion(req.body.StartDate,totalPrice);
    console.Console("after discount" +totalPrice);

    const parsedAmount = req.body.amount != null ? parseFloat(req.body.amount) : totalPrice;
    if (parsedAmount !== totalPrice && req.body.paymentMethod.toLowerCase() !== 'cash') {
      return res.status(400).json({ message: 'The provided amount does not match the total price.', totalPrice, providedAmount: req.body.amount });
    }

    const paymentDetails = await processPayment(req.body.paymentMethod, totalPrice);
    const rental = await createRentalAndNotifyOwner(req, item, owner, totalPrice, deliveryFee, rentalPeriod, paymentDetails);

    res.status(201).json({ message: 'Rental created successfully, owner has been notified', rental });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      // Fetch the Security Deposit item details
      const securityDepositItem = await getSecurityDepositItem(rental.ItemID);
      const depositAmount = securityDepositItem ? securityDepositItem.SecurityDeposit : 0;
      const depositAmountInteger = Math.floor(Number(depositAmount));

      // Create the payment link
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

      const sessionId = paymentLink.id; // This is the session ID created by Stripe
console.log(sessionId);
      await Rental.update(
        { paymentIntentId: sessionId }, 
        { where: { RentalID: rental.RentalID } } // Update the correct rental record
      );
      console.log('Full Payment Link Response:', JSON.stringify(paymentLink, null, 2));

   
      // Notify renter
      const renter = await getRenterById(rental.RenterID);
      const renterEmail = renter ? renter.Email : null;
  
      if (!renterEmail) {
        throw new Error('No renter email found.');
      }

      console.log('Renter Email:', renterEmail);
      
      await sendEmail(
        renterEmail,
        'Deposit Payment Required',
        'Please complete the security deposit payment to proceed with your rental.', // Plain text version
        `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <p>Hello ${rental.renterName || 'Valued Customer'},</p>
          <p>We’re excited to help you with your rental! To proceed, please complete the security deposit payment by clicking the link below:</p>
          <p style="text-align: center;">
            <a href="${paymentLink.url}" style="
              display: inline-block;
              background-color: #007bff;
              color: #ffffff;
              padding: 10px 20px;
              text-decoration: none;
              font-weight: bold;
              border-radius: 5px;
            ">Pay Deposit</a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Thank you for choosing us, and we look forward to assisting you further.</p>
          <p>Best regards,</p>
          <p>Your Rental Team</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <small style="color: #888;">This email has been checked for viruses by Avast antivirus software.</small><br>
          <small style="color: #888;">
            <a href="https://www.avast.com" style="color: #888; text-decoration: none;">www.avast.com</a>
          </small>
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
    // Authorization Check
    authorizeUser(req.user);

    // Fetch and Validate Rental
    const rental = await fetchRentalById(id);

    // Handle Payment Link Creation for Cash Payments
    const paymentLinkResponse = await createPaymentLinkAndNotifyRenter(rental);
    if (paymentLinkResponse) return res.status(200).json(paymentLinkResponse);

    // Handle Delivery Assignment if needed
    let deliveryResponse = null;
    if (rental.DeliveryOption === 'Delivery') {
      const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
      if (!deliveryCoords) {
        return res.status(400).json({ message: 'Invalid delivery address' });
      }

      deliveryResponse = await handleDeliveryAssignment(rental, deliveryCoords, status);
    } else {
      // Update Status for non-delivery rentals
      await updateRentalStatus(rental, status);
    }

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


// Refund Deposit Endpoint
exports.refundDeposit = async (req, res) => {
  const { rentalId } = req.params;

  try {
    // Retrieve the rental record
    const rental = await Rental.findOne({ where: { RentalID: rentalId } });
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Retrieve the associated item to verify ownership
    const item = await Item.findOne({ where: { ItemID: rental.ItemID } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure the logged-in user is the owner
    if (req.user.id !== item.UserID) {
      return res.status(403).json({ message: 'Only the owner can refund the deposit' });
    }

    // Ensure there is a deposit payment to refund
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
    // Update the rental status or mark deposit as refunded
    await Rental.update(
      { depositRefunded: true },
      { where: { RentalID: rentalId } } // Assuming RentalID is the primary key
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
  if (rental.DeliveryOption !== 'Delivery') return null; // Skip if delivery not needed

  const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
  if (!deliveryCoords) throw new Error('Invalid delivery address for assignment');

  // Call the delivery assignment function you already have
  return await handleDeliveryAssignment(rental, deliveryCoords, 'Pending'); // Set status as needed
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

      console.log('Rental object:', rental); // Log the rental object

      if (!rental.paymentIntentId) {
          console.error('No payment intent found for this rental');
          return res.status(400).json({ error: 'No payment intent found for this rental' });
      }

      const paymentIntent = await stripe.checkout.sessions.retrieve(rental.paymentIntentId);
      
      // Check if paymentIntent is defined
      if (!paymentIntent) {
          console.error(`No payment intent found for ID: ${rental.paymentIntentId}`);
          return res.status(404).json({ error: 'Payment intent not found' });
      }

      const paymentStatus = paymentIntent.status;
      console.log(`Payment status for rental ID ${rentalId}: ${paymentStatus}`);

      if (paymentStatus === 'complete') {
          // Update the rental status to a valid value
          await updateRentalStatus(rental, 'Approved'); // Set a valid status

          if (rental.DeliveryOption === 'Delivery') {
              const deliveryCoords = await Distance.geocodeAddress(rental.DeliveryAddress);
              
              // Check if deliveryCoords is defined
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

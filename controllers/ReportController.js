// controllers/ReportController.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const { getStatistics } = require('../services/StatisticsService');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path if necessary


const Category = require('../models/category');
const Rental = require('../models/Rental');









async function generateChartUrl(userCount, rentalCount, completedRentals) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
}

  const chartData = {
    type: 'pie',
    data: {
      labels: ['Total Users', 'Total Rentals', 'Completed Rentals'],
      datasets: [{
        data: [userCount, rentalCount, completedRentals],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    },
  };
  
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}

exports.createPDFReport = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

    // Step 1: Fetch statistics data
    const { userCount, rentalCount, completedRentals } = await getStatistics();

    // Step 2: Generate chart image URL
    const chartUrl = await generateChartUrl(userCount, rentalCount, completedRentals);

    // Step 3: Download the chart image
    const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(response.data, 'binary');

    // Step 4: Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');

    // Step 5: Create the PDF and pipe it to the response
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add report title and statistics
    pdfDoc.fontSize(20).text('Detailed Report', { align: 'center' }).moveDown(2);
    pdfDoc.fontSize(14).text('Statistics Summary:', { underline: true });
    pdfDoc.fontSize(12)
      .text(`Total Users: ${userCount}`)
      .text(`Total Rentals: ${rentalCount}`)
      .text(`Completed Rentals: ${completedRentals}`)
      .moveDown(2);

    // Add the chart image
    pdfDoc.image(chartImage, {
      fit: [400, 300],
      align: 'center'
    });

    // Finalize the PDF
    pdfDoc.end();

  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ error: 'Error generating PDF report' });
  }
};


exports.createMonthlyActivityReport = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Raw SQL queries for monthly report data
    const newUsersCount = await sequelize.query(
      'SELECT COUNT(*) AS newUsersCount FROM "Users" WHERE "createdAt" BETWEEN :startOfMonth AND :endOfMonth',
      { replacements: { startOfMonth, endOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    const newRentalsCount = await sequelize.query(
      'SELECT COUNT(*) AS newRentalsCount FROM "Rentals" WHERE "startDate" BETWEEN :startOfMonth AND :endOfMonth',
      { replacements: { startOfMonth, endOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    const completedRentalsCount = await sequelize.query(
      'SELECT COUNT(*) AS completedRentalsCount FROM "Rentals" WHERE "endDate" BETWEEN :startOfMonth AND :endOfMonth AND "Status" = \'Completed\'',
      { replacements: { startOfMonth, endOfMonth }, type: sequelize.QueryTypes.SELECT }
    );

    const popularCategories = await sequelize.query(
      'SELECT "CategoryName" FROM "Categories" JOIN "Items" ON "Categories"."CategoryID" = "Items"."CategoryID" JOIN "Rentals" ON "Items"."ItemID" = "Rentals"."ItemID" GROUP BY "CategoryName" ORDER BY COUNT("Rentals"."RentalID") DESC LIMIT 3',
      { type: sequelize.QueryTypes.SELECT }
    );

    // Generate PDF
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="MonthlyActivityReport.pdf"');
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text('Monthly Activity Report', { align: 'center' }).moveDown(2);
    pdfDoc.fontSize(12).text(`New Users This Month: ${newUsersCount[0].newUsersCount}`);
    pdfDoc.text(`Total Rentals This Month: ${newRentalsCount[0].newRentalsCount}`);
    pdfDoc.text(`Completed Rentals This Month: ${completedRentalsCount[0].completedRentalsCount}`);
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text('Most Popular Categories:', { underline: true });
    popularCategories.forEach((category, index) => {
      pdfDoc.fontSize(12).text(`${index + 1}. ${category.CategoryName}`);
    });
    pdfDoc.end();
  } catch (error) {
    console.error('Error generating Monthly Activity Report:', error);
    res.status(500).json({ error: 'Error generating Monthly Activity Report' });
  }
};



// Revenue Report
// controllers/ReportController.js

// controllers/ReportController.js

// controllers/ReportController.js



// Helper function to generate chart URL
async function generateChartUrl(totalRevenue, totalRentals, avgRevenuePerRental) {


  const chartData = {
    type: 'pie',
    data: {
      labels: ['Total Revenue', 'Total Rentals', 'Avg Revenue per Rental'],
      datasets: [{
        data: [totalRevenue, totalRentals, avgRevenuePerRental],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }],
    },
  };
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}

exports.createRevenueReport = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

    console.log("Starting Revenue Report generation...");

    // Fetch total revenue and total rentals
    const totalRevenueResult = await Rental.sum('TotalPrice');
    const totalRentalsResult = await Rental.count();

    // Validate and log results
    const totalRevenue = totalRevenueResult ? totalRevenueResult : 0; 
    const totalRentals = totalRentalsResult ? totalRentalsResult : 0;

    console.log('Total revenue retrieved:', totalRevenue);
    console.log('Total rentals retrieved:', totalRentals);

    // Calculate average revenue per rental safely
    const avgRevenuePerRental = totalRentals > 0 ? (totalRevenue / totalRentals).toFixed(2) : '0.00';
    console.log('Average revenue per rental:', avgRevenuePerRental);

    // Step 1: Generate chart URL and fetch chart image
    const chartUrl = await generateChartUrl(totalRevenue, totalRentals, avgRevenuePerRental);
    const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(response.data, 'binary');

    // Set up PDF document headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="RevenueReport.pdf"');

    // Initialize PDF document and add report content
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add report title and statistics
    pdfDoc.fontSize(20).text('Revenue Report', { align: 'center' }).moveDown(2);
    pdfDoc.fontSize(12).text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    pdfDoc.text(`Total Rentals: ${totalRentals}`);
    pdfDoc.text(`Average Revenue per Rental: $${avgRevenuePerRental}`).moveDown(1);

    // Add the chart image to the PDF
    pdfDoc.image(chartImage, {
      fit: [400, 300],
      align: 'center',
    });

    // Finalize and send the PDF
    pdfDoc.end();

  } catch (error) {
    console.error('Error generating Revenue Report:', error);
    res.status(500).json({ error: 'Error generating Revenue Report' });
  }
};


// Helper function to generate a chart URL for each user
async function generateUserChartUrl(totalRevenue, totalRentals, avgRevenuePerRental) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
}

  const chartData = {
    type: 'pie',
    data: {
      labels: ['Total Revenue', 'Total Rentals', 'Avg Revenue per Rental'],
      datasets: [{
        data: [totalRevenue, totalRentals, avgRevenuePerRental],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }],
    },
  };
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}

// controllers/ReportController.js


// controllers/ReportController.js
// controllers/ReportController.js
// controllers/ReportController.js
// controllers/ReportController.js



exports.createUserReport = async (req, res) => {
  try {
    const userID = req.params.userID;
    console.log('User ID:', userID);

    // Fetch User Details
    const userResult = await sequelize.query(
      `SELECT "UserID", "FullName", "Email" FROM "advance"."Users" WHERE "UserID" = :userID`, 
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('User Result:', userResult);

    if (!userResult.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Fetch Rentals related to the User
    const rentalsResult = await sequelize.query(
      `SELECT * FROM "advance"."Rentals" WHERE "RenterID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Rentals Result:', rentalsResult);

    const rentalCount = rentalsResult.length;

    // Fetch total revenue
    const totalRevenueResult = await sequelize.query(
      `SELECT SUM("TotalPrice") AS totalRevenue FROM "advance"."Rentals" WHERE "RenterID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    console.log('Total Revenue:', totalRevenue);

    // Fetch item details related to the user
    const itemsResult = await sequelize.query(
      `SELECT * FROM "advance"."Items" WHERE "UserID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Items Result:', itemsResult);

    // Fetch reviews related to the user's items
    const reviewsResult = await sequelize.query(
      `SELECT * FROM "advance"."Reviews" WHERE "user_id" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Reviews Result:', reviewsResult);

    // Prepare data for rental status pie chart
    const rentalStatusCounts = await sequelize.query(
      `SELECT "Status", COUNT(*) AS count FROM "advance"."Rentals" WHERE "RenterID" = :userID GROUP BY "Status"`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    const statusLabels = rentalStatusCounts.map(status => status.Status);
    const statusCounts = rentalStatusCounts.map(status => status.count);

    // Prepare data for rental status chart with beautiful colors
    const statusChartData = {
      type: 'pie',
      data: {
        labels: statusLabels,
        datasets: [{
          label: 'Rental Status Count',
          data: statusCounts,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'], // Beautiful colors
        }]
      }
    };

    // Generate Status Chart URL
    const statusChartUrl = await generateChart(statusChartData);

    // Prepare data for user activity chart with beautiful colors
    const chartData = {
      type: 'pie',
      data: {
        labels: ['Total Rentals', 'Total Reviews'],
        datasets: [{
          label: 'User Activity Distribution',
          data: [rentalCount, reviewsResult.length],
          backgroundColor: ['#4BC0C0', '#ffcc66'], // Beautiful colors
        }]
      }
    };

    // Generate Activity Chart URL
    const chartUrl = await generateChart(chartData);

    // Generate PDF
    const pdfPath = path.join(__dirname, `../output/UserReport_${userID}.pdf`);
    const pdfDoc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);

    // PDF content
    pdfDoc.fontSize(20).text('User Activity Report', { align: 'center' }).moveDown();
    pdfDoc.fontSize(12).text(`User ID: ${user.UserID}`);
    pdfDoc.text(`User Name: ${user.FullName}`);
    pdfDoc.text(`Email: ${user.Email}`).moveDown();
    pdfDoc.fontSize(14).text('Rental Summary:', { underline: true });
    pdfDoc.fontSize(12).text(`Total Rentals: ${rentalCount}`);
    pdfDoc.text(`Total Revenue from Rentals: $${totalRevenue.toFixed(2)}`).moveDown();
    
    // Items Section
    pdfDoc.fontSize(14).text('Items Owned:', { underline: true });
    if (itemsResult.length > 0) {
      itemsResult.forEach(item => {
        pdfDoc.fontSize(12).text(`- ${item.Title} (ID: ${item.ItemID})`);
      });
    } else {
      pdfDoc.fontSize(12).text('No items found for this user.');
    }
    pdfDoc.moveDown();

    // Reviews Section
    pdfDoc.fontSize(14).text('Reviews Given:', { underline: true });
    if (reviewsResult.length > 0) {
      reviewsResult.forEach(review => {
        pdfDoc.fontSize(12).text(`- Item ID: ${review.item_id}, Rating: ${review.rating}, Review: "${review.review}"`);
      });
    } else {
      pdfDoc.fontSize(12).text('No reviews found for this user.');
    }
    pdfDoc.moveDown();

    // Add the activity chart image
    const responseChart = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(responseChart.data, 'binary');
    pdfDoc.image(chartImage, { fit: [400, 300], align: 'center' }).moveDown(18); // Adjust space if needed

    // Add the status chart image
    const responseStatusChart = await axios.get(statusChartUrl, { responseType: 'arraybuffer' });
    const statusChartImage = Buffer.from(responseStatusChart.data, 'binary');
    pdfDoc.image(statusChartImage, { fit: [400, 300], align: 'center' }).moveDown(50); // Ensure this is properly positioned

    // Finalize the PDF
    pdfDoc.end();

    // Handle the 'finish' event to send the response
    writeStream.on('finish', () => {
      console.log('PDF generated successfully, sending response...');
      res.download(pdfPath, `UserReport_${userID}.pdf`, (err) => {
        if (err) {
          console.error('Error sending the file:', err);
          return res.status(500).json({ error: 'Error downloading the PDF' });
        }
      });
    });

    // Handle errors during the PDF writing process
    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      res.status(500).json({ error: 'Error generating User Report' });
    });

  } catch (error) {
    console.error('Error generating User Report:', error);
    res.status(500).json({ error: 'Error generating User Report' });
  }
};

// Function to generate chart
async function generateChart(chartData) {
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}

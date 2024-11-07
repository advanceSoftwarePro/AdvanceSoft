
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const { getStatistics } = require('../services/StatisticsService');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database'); 
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

    const { userCount, rentalCount, completedRentals } = await getStatistics();
    const chartUrl = await generateChartUrl(userCount, rentalCount, completedRentals);
    const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(response.data, 'binary');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="report.pdf"');
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);
    pdfDoc.fontSize(20).text('Detailed Report', { align: 'center' }).moveDown(2);
    pdfDoc.fontSize(14).text('Statistics Summary:', { underline: true });
    pdfDoc.fontSize(12)
      .text(`Total Users: ${userCount}`)
      .text(`Total Rentals: ${rentalCount}`)
      .text(`Completed Rentals: ${completedRentals}`)
      .moveDown(2);

    pdfDoc.image(chartImage, {
      fit: [400, 300],
      align: 'center'
    });
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
    const totalRevenueResult = await Rental.sum('TotalPrice');
    const totalRentalsResult = await Rental.count();
    const totalRevenue = totalRevenueResult ? totalRevenueResult : 0; 
    const totalRentals = totalRentalsResult ? totalRentalsResult : 0;

    console.log('Total revenue retrieved:', totalRevenue);
    console.log('Total rentals retrieved:', totalRentals);
    const avgRevenuePerRental = totalRentals > 0 ? (totalRevenue / totalRentals).toFixed(2) : '0.00';
    console.log('Average revenue per rental:', avgRevenuePerRental);
    const chartUrl = await generateChartUrl(totalRevenue, totalRentals, avgRevenuePerRental);
    const response = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(response.data, 'binary');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="RevenueReport.pdf"');
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);
    pdfDoc.fontSize(20).text('Revenue Report', { align: 'center' }).moveDown(2);
    pdfDoc.fontSize(12).text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    pdfDoc.text(`Total Rentals: ${totalRentals}`);
    pdfDoc.text(`Average Revenue per Rental: $${avgRevenuePerRental}`).moveDown(1);
    pdfDoc.image(chartImage, {
      fit: [400, 300],
      align: 'center',
    });
    pdfDoc.end();

  } catch (error) {
    console.error('Error generating Revenue Report:', error);
    res.status(500).json({ error: 'Error generating Revenue Report' });
  }
};


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



exports.createUserReport = async (req, res) => {
  try {
    const userID = req.params.userID;
    console.log('User ID:', userID);
    const userResult = await sequelize.query(
      `SELECT "UserID", "FullName", "Email" FROM "advance"."Users" WHERE "UserID" = :userID`, 
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('User Result:', userResult);

    if (!userResult.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];
    const rentalsResult = await sequelize.query(
      `SELECT * FROM "advance"."Rentals" WHERE "RenterID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Rentals Result:', rentalsResult);

    const rentalCount = rentalsResult.length;
    const totalRevenueResult = await sequelize.query(
      `SELECT SUM("TotalPrice") AS totalRevenue FROM "advance"."Rentals" WHERE "RenterID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    console.log('Total Revenue:', totalRevenue);
    const itemsResult = await sequelize.query(
      `SELECT * FROM "advance"."Items" WHERE "UserID" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Items Result:', itemsResult);
    const reviewsResult = await sequelize.query(
      `SELECT * FROM "advance"."Reviews" WHERE "user_id" = :userID`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    console.log('Reviews Result:', reviewsResult);
    const rentalStatusCounts = await sequelize.query(
      `SELECT "Status", COUNT(*) AS count FROM "advance"."Rentals" WHERE "RenterID" = :userID GROUP BY "Status"`,
      { replacements: { userID }, type: sequelize.QueryTypes.SELECT }
    );

    const statusLabels = rentalStatusCounts.map(status => status.Status);
    const statusCounts = rentalStatusCounts.map(status => status.count);
    const statusChartData = {
      type: 'pie',
      data: {
        labels: statusLabels,
        datasets: [{
          label: 'Rental Status Count',
          data: statusCounts,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'], 
        }]
      }
    };
    const statusChartUrl = await generateChart(statusChartData);
    const chartData = {
      type: 'pie',
      data: {
        labels: ['Total Rentals', 'Total Reviews'],
        datasets: [{
          label: 'User Activity Distribution',
          data: [rentalCount, reviewsResult.length],
          backgroundColor: ['#4BC0C0', '#ffcc66'], 
        }]
      }
    };
    const chartUrl = await generateChart(chartData);
    const pdfPath = path.join(__dirname, `../output/UserReport_${userID}.pdf`);
    const pdfDoc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);

    pdfDoc.fontSize(20).text('User Activity Report', { align: 'center' }).moveDown();
    pdfDoc.fontSize(12).text(`User ID: ${user.UserID}`);
    pdfDoc.text(`User Name: ${user.FullName}`);
    pdfDoc.text(`Email: ${user.Email}`).moveDown();
    pdfDoc.fontSize(14).text('Rental Summary:', { underline: true });
    pdfDoc.fontSize(12).text(`Total Rentals: ${rentalCount}`);
    pdfDoc.text(`Total Revenue from Rentals: $${totalRevenue.toFixed(2)}`).moveDown();
    pdfDoc.fontSize(14).text('Items Owned:', { underline: true });
    if (itemsResult.length > 0) {
      itemsResult.forEach(item => {
        pdfDoc.fontSize(12).text(`- ${item.Title} (ID: ${item.ItemID})`);
      });
    } else {
      pdfDoc.fontSize(12).text('No items found for this user.');
    }
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text('Reviews Given:', { underline: true });
    if (reviewsResult.length > 0) {
      reviewsResult.forEach(review => {
        pdfDoc.fontSize(12).text(`- Item ID: ${review.item_id}, Rating: ${review.rating}, Review: "${review.review}"`);
      });
    } else {
      pdfDoc.fontSize(12).text('No reviews found for this user.');
    }
    pdfDoc.moveDown();
    const responseChart = await axios.get(chartUrl, { responseType: 'arraybuffer' });
    const chartImage = Buffer.from(responseChart.data, 'binary');
    pdfDoc.image(chartImage, { fit: [400, 300], align: 'center' }).moveDown(18); 
    const responseStatusChart = await axios.get(statusChartUrl, { responseType: 'arraybuffer' });
    const statusChartImage = Buffer.from(responseStatusChart.data, 'binary');
    pdfDoc.image(statusChartImage, { fit: [400, 300], align: 'center' }).moveDown(50); 
    pdfDoc.end();
    writeStream.on('finish', () => {
      console.log('PDF generated successfully, sending response...');
      res.download(pdfPath, `UserReport_${userID}.pdf`, (err) => {
        if (err) {
          console.error('Error sending the file:', err);
          return res.status(500).json({ error: 'Error downloading the PDF' });
        }
      });
    });

    writeStream.on('error', (err) => {
      console.error('Error writing PDF:', err);
      res.status(500).json({ error: 'Error generating User Report' });
    });

  } catch (error) {
    console.error('Error generating User Report:', error);
    res.status(500).json({ error: 'Error generating User Report' });
  }
};

async function generateChart(chartData) {
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartData))}`;
  return chartUrl;
}

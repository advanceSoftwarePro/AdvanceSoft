const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const { sendEmail } = require('../utils/emailService');

exports.identifyAndRewardBestUsers = async () => {
  try {
    console.log('Identifying best owner and renter...');


    console.log('Running query for best owner...');
    const [bestOwner] = await sequelize.query(
      `
      SELECT u."UserID", u."FullName", u."Email", COUNT(r."RentalID") AS "CompletedRentals"
FROM "advance"."Users" u
JOIN "advance"."Rentals" r ON u."UserID" = r."RenterID"
WHERE u."Role" = 'Owner' AND r."Status" = 'Completed'
GROUP BY u."UserID", u."FullName", u."Email"
ORDER BY "CompletedRentals" DESC
LIMIT 1;

      `,
      { type: QueryTypes.SELECT }
    );

    console.log('Best owner result:', bestOwner);
    console.log('Running query for best renter...');

    const [bestRenter] = await sequelize.query(
      `
      SELECT u."UserID", u."FullName", u."Email", COUNT(r."RentalID") AS "CompletedRentals"
      FROM "advance"."Users" u
      JOIN "advance"."Rentals" r ON u."UserID" = r."RenterID"
      WHERE u."Role" = 'Renter' AND r."Status" = 'Completed'
      GROUP BY u."UserID", u."FullName", u."Email"
      ORDER BY "CompletedRentals" DESC
      LIMIT 1;
      `,
      { type: QueryTypes.SELECT }
    );

    console.log('Best renter result:', bestRenter);

    if (bestOwner) {
      await sendRewardNotification(bestOwner, 'Top Owner');
    }
    if (bestRenter) {
      await sendRewardNotification(bestRenter, 'Top Renter');
    }

  } catch (error) {
    console.error('Error identifying best owner and renter:', error);
  }
};

async function sendRewardNotification(user, title) {
  const subject = `Congratulations! You are our ${title}!`;
  const textContent = `Hello ${user.FullName},\n\nCongratulations! You've been selected as the ${title} on our platform. Enjoy your exclusive reward!`;
  const htmlContent = `
    <h3>Hello ${user.FullName},</h3>
    <p>Congratulations! You've been selected as the <strong>${title}</strong> on our platform.</p>
    <p>Enjoy your exclusive reward and thank you for your continued engagement!</p>
    <p>Best Regards,<br>Your App Team</p>
  `;

  await sendEmail(user.Email, subject, textContent, htmlContent);
}

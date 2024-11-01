const rewardService = require('../services/rewardService');
const cron = require('node-cron');

// Schedule to run on the 1st day of every two months
cron.schedule('0 0 * * *', async () => {
    try {
    await rewardService.identifyAndRewardBestUsers();
    console.log('Best owner and renter notified and rewarded.');
  } catch (error) {
    console.error('Error in reward cron job:', error);
  }
});

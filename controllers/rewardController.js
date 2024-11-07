const rewardService = require('../services/rewardService');
const cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
    try {
    await rewardService.identifyAndRewardBestUsers();
    console.log('Best owner and renter notified and rewarded.');
  } catch (error) {
    console.error('Error in reward cron job:', error);
  }
});

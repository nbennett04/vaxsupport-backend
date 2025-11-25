const cron = require("node-cron");
const User = require("../models/User");

const resetDailyLimit = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Resetting daily message counts...");
        await User.updateMany({}, { dailyMessageCount: 0, lastMessageDate: new Date() });
        console.log("Daily message counts reset.");
    });
};

module.exports = resetDailyLimit;

const cron = require("node-cron");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const deleteOldConversations = () => {
    cron.schedule("0 0 * * *", async () => {  // Runs every day at midnight
        try {
            // Find all conversations older than 30 days with no messages
            const oldConversations = await Conversation.find({
                createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            });

            for (let conversation of oldConversations) {
                const messages = await Message.find({ conversationId: conversation._id });

                // If there are no messages, delete the conversation
                if (messages.length === 0) {
                    await conversation.delete();
                    console.log(`Deleted empty conversation with ID: ${conversation._id}`);
                }
            }
            console.log("Old conversations cleaned up.");
        } catch (error) {
            console.error("Error deleting old conversations:", error);
        }
    });
};

module.exports = deleteOldConversations;

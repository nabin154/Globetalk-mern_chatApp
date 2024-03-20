const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    User.populate(messages, {
      path: "chat.users",
      select: "name pic email",
    });
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = async (req, res) => {
  const { content, chatId, translatedContent, flag, sentiment } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    sentiment: sentiment,
    translatedContent: translatedContent,
    imageUrl: (flag) ? true : false,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name",
    });
    res.json(message);
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const getSenderMessage =  async (req, res) => {
  try {
    const senderId = req.params.id;

    // Get the current time
    const currentTime = new Date();

    // Calculate the time 30 minutes ago
    const thirtyMinutesAgo = new Date(currentTime - 30 * 60 * 1000);

    // Query messages sent by the sender within the last 30 minutes
    const messages = await Message.find({
      sender: senderId,
      createdAt: { $gte: thirtyMinutesAgo, $lte: currentTime }
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { allMessages, sendMessage, getSenderMessage };

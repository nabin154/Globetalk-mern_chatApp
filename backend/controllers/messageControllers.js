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
  const { content, chatId, translatedContent, flag } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
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

module.exports = { allMessages, sendMessage };

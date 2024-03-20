const express = require("express");
const {
  allMessages,
  sendMessage,
  getSenderMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/sender/:id").get( getSenderMessage);

module.exports = router;

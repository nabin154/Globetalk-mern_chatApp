const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  authUser,
  allUsers,
  getLanguages,
  regLanguages,
  updateLocation,
  getNearByUsers,
  changePassword,
  changeImage,
} = require("../controllers/userControllers");
const router = express.Router();
router.use(express.json());


router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.route("/languages").get(getLanguages);
router.route("/languages").post(protect, regLanguages);
router.route("/location").post(protect,updateLocation);
router.route("/nearbyusers").get(protect, getNearByUsers);
router.post("/change-password", protect, changePassword);
router.post("/change-image", protect, changeImage);




module.exports = router;
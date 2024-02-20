const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const languages = require("../data/languages");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, Language } = req.body;

  if (!name || !password) {
    res.status(400);
    throw new Error("Please enter a name and password.");
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
    Language,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      Language: user.Language,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      Language: user.Language,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const getLanguages = asyncHandler(async (req, res) => {
  // res.send(languages);
  try {
    res.json(languages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const regLanguages = asyncHandler(async (req, res) => {
  const { userId, languageCode } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { Language: languageCode });
    res.json({ message: "Language preference updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "location.coordinates": [longitude, latitude],
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("Error storing location:", error);
    res.status(500).send("Error storing location");
  }
});

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
const getNearByUsers = asyncHandler(async (req, res) => {
  const user = req.user;

  const userLatitude = parseFloat(req.user.location.coordinates[1]);
  const userLongitude = parseFloat(req.user.location.coordinates[0]);
  const maxDistanceInKm = parseFloat(req.query.maxDistance);

  try {
    const users = await User.find().select("name location pic email");
    const nearbyUsersWithDistance = users
      .filter((user) => {
        const distance = calculateHaversine(
          userLatitude,
          userLongitude,
          user.location.coordinates[1],
          user.location.coordinates[0]
        );
        return distance <= maxDistanceInKm;
      })
      .map((nearbyUser) => ({
        _id: nearbyUser._id,
        name: nearbyUser.name,
        email: nearbyUser.email,
        pic: nearbyUser.pic,

        distance: calculateHaversine(
          userLatitude,
          userLongitude,
          nearbyUser.location.coordinates[1],
          nearbyUser.location.coordinates[0]
        ).toFixed(2),
      }));

    res.json(nearbyUsersWithDistance);
  } catch (error) {
    console.error("Error finding nearby users:", error);
    res.status(500).json({ error: "Error finding nearby users" });
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    res.status(400).json({ error: "Invalid request parameters" });
    return;
  }

  try {
    const user = await User.findById(userId).select("+password");

    if (!user || !(await user.matchPassword(oldPassword))) {
      res.status(401).json({ error: "Incorrect old password" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const changeImage = asyncHandler(async (req, res) => {
  const { userId, image } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(401).json({ error: "error" });
      return;
    }
    user.pic = image;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      Language: user.Language,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error changing image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  getLanguages,
  getNearByUsers,
  regLanguages,
  updateLocation,
  changePassword,
  changeImage,
};

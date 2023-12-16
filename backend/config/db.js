const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const url = "mongodb://localhost:27017/globetalk";
    const conn = await mongoose.connect(url, {});

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;

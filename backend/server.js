const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");

connectDB();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("api is runningg successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const server = app.listen(
  PORT,
  console.log("server started at port 8080".yellow.bold)
);
const onlineUsers = new Map();
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    onlineUsers.set(socket.id, userData);
    io.emit("online users", Array.from(onlineUsers));
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing", {
      room: room,
    });
  });
  ///////////////////videochat

  socket.on("callFriend", (data) => {
    io.to(data.userToCall).emit("incommingCall", {
      signal: data.signalData,
      from: data.from,
      type: data.type,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", {
      signal: data.signal,
      from: data.from,
    });
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("endCall");
  });
  /////////////
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", {
      room: room,
    });
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.on("logout", (userData) => {
    const socketIdToRemove = Array.from(onlineUsers.entries()).find(
      ([_, user]) => user._id === userData._id
    )?.[0];

    if (socketIdToRemove) {
      onlineUsers.delete(socketIdToRemove);
      io.emit("online users", Array.from(onlineUsers));

      socket.leave(userData._id);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("online users", Array.from(onlineUsers));
  });
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

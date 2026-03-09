const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");

// 1. Import app and server from your fixed socket file
const { server, app } = require("./lib/socket");

// 2. Import your router (ensure this file exists!)
const userRouter = require("./routers/user.router.js"); 
const messageRouter = require("./routers/message.router.js");
dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL; 
const CLIENT_URL = process.env.CLIENT_URL;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to MERN CHAT SERVER");
});

// 3. Changed DATABASE_URL to DB_URL to match your const definition
if (!DB_URL) {
  console.log("Database url is missing in .env");
} else {
  mongoose
    .connect(DB_URL)
    .then(() => {
      console.log("Database connected successfully!");
    })
    .catch((error) => {
      console.log("Database connection failed:", error.message);
    });
}

// 4. Router is now properly imported at the top
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
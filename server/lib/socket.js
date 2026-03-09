require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});
const userSocketMap = []; //{userId: socketId1, userId2: socketId2},...
function getRecipientSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("UserSocketMap", userSocketMap);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //   socket.on("event", (data) => {
  //     /* … */
  //   });

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
    delete userSocketMap[userId];
    console.log("UserSocketMap", userSocketMap);
  });
});

module.exports = { io, app, server, getRecipientSocketId };
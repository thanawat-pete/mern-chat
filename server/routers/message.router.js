const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

//localhost:5000/api/v1/message/get-users-for-sidebar
router.get("/users", authMiddleware.protectRoute, messageController.getUsersForSidebar);
router.get("/:id", authMiddleware.protectRoute, messageController.getMessages);
router.post("/send/:id", authMiddleware.protectRoute, messageController.sendMessage);

module.exports = router;

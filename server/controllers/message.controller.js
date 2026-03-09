const message = require("../models/message.model.js");
const User = require("../models/user.model");
const cloudinary = require("../configs/cloudinary");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while getting users for sidebar",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id: recipientId } = req.params;
    if (!recipientId) {
      return res.status(400).json({
        message: "Recipient ID is required",
      });
    }
    const senderId = req.user._id;
    const { text, file } = req.body;
    if (text === "" && file === "") {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }
    const fileUrl = "";
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file);
      fileUrl = uploadResponse.secure_url;
    }
    const newMessage = await message.create({
      sender: senderId,
      recipient: recipientId,
      text,
      file: fileUrl,
    });
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while sending message",
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const {id: userToChat} = req.params;
    const messages = await message.find({
      $or: [
        { sender: myId, recipient: userToChat },
        { sender: userToChat, recipient: myId },
      ],
    });
    return res.status(200).json({
      messages
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while getting messages",
      error: error.message,
    });
  }
};

const messageController = {
  getUsersForSidebar,
  sendMessage,
  getMessages,
};

module.exports = messageController;

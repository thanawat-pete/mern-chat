const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

//localhost:5000/api/user/signup
router.post("/signup", UserController.signUp);
//localhost:5000/api/user/signin
router.post("/signin", UserController.signIn);
//localhost:5000/api/user/logout
router.post("/logout", UserController.logout);

module.exports = router;
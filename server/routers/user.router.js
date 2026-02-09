const express = require("express");
const router = express.Router();
const {
    userController
} = require("../controllers/user.controller");

//localhost:5000/api/user/signup
router.post("/signup", userController.signUp);
//localhost:5000/api/user/signin
router.post("/signin", userController.signIn);
//localhost:5000/api/user/logout
router.post("/logout", userController.logout);

module.exports = router;
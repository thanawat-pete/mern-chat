const express = require("express");
const router = express.Router();
const {
    signUp,
    signIn
} = require("../controllers/user.controller");

//localhost:5000/api/user/signup
router.post("/signup", signUp);
//localhost:5000/api/user/signin
router.post("/signin", signIn);

module.exports = router;
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

//localhost:5000/api/v1/user/signup
router.post("/signup", UserController.signUp);
//localhost:5000/api/v1/user/signin
router.post("/signin", UserController.signIn);
//localhost:5000/api/v1/user/logout
router.post("/logout", UserController.logout);
//localhost:5000/api/v1/user/update-profile
router.put("/update-profile", authMiddleware.protectRoute, UserController.updateProfile);
//localhost:5000/api/v1/user/check-auth
router.get("/check-auth", authMiddleware.protectRoute, UserController.checkAuth);

module.exports = router;
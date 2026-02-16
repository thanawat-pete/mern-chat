const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user.model");
dotenv.config();
const secret = process.env.JWT_SECRET;

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({
                message : "Unauthorized - No token Provided"
            });
        };
        const decoded = jwt.vertify(token, secret);
        if(!decoded) {
            return res.status(401).json({
                message : "Unauthorized - Invalid token"
            });
        };
        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return res.status(401).json({
                message : "Unauthorized - User not found"
            });
        };
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error while checking authentication",
            error: error.message,
        });
    }
}

const authMiddleware = {
    protectRoute
};

module.exports = authMiddleware;
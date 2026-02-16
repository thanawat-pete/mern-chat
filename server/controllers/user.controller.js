const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secret = process.env.JWT_SECRET;
const node_mode = process.env.NODE_MODE;

const signUp = async (req, res) => {
    const {
        fullname,
        email,
        password
    } = req.body;

    try {
        // 1) Check required fields
        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // 2) Check email already exists
        const emailExists = await User.findOne({
            email
        });
        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        // 3) Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4) Create new user in MongoDB
        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
        });

        // 5) Generate JWT token
        const token = jwt.sign({
                userId: newUser._id
            },
            secret, {
                expiresIn: "1h"
            }
        );

        // 6) Set cookie
        res.cookie("jwt", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: node_mode === "production",
        });

        // 7) Send response back
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
            },
            token,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const signIn = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    try {
        // 1) Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // 2) Find user by email
        const userDoc = await User.findOne({
            email
        });

        if (!userDoc) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // 3) Compare password
        const isPasswordMatch = await bcrypt.compare(
            password,
            userDoc.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        // 4) Create JWT Token
        const token = jwt.sign({
                userId: userDoc._id,
                fullname: userDoc.fullname,
                email: userDoc.email,
            },
            secret, {
                expiresIn: "1h"
            }
        );

        // 5) Set Cookie (optional but recommended)
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: node_mode === "production",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // 6) Response
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: userDoc._id,
                fullname: userDoc.fullname,
                email: userDoc.email,
            },
            accessToken: token,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const logout = async (req, res) => {
    try {

        // 1) Clear cookie
        res.cookie("jwt", "", {
            maxAge: 0,
        });

        // 2) Response
        return res.status(200).json({
            message: "Logout successful",
        });

        // 3) Error
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    const {
        fullname,
        profilePicture
    } = req.body;
    
}

const checkAuth = async (req, res) => {
}

const UserController = {
    signUp,
    signIn,
    logout,
    updateProfile,
    checkAuth
};

module.exports = UserController;
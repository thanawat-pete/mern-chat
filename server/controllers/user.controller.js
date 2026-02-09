const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.JWT_SECRET;

const signUp = async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const emailExists = await User.findOne({
            email
        });
        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "User created successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

const signIn = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const userDoc = await User.findOne({
            email
        });
        if (!userDoc) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, userDoc.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }
        jwt.sign({
                username: userDoc.username,
                id: userDoc._id
            }, secret, {},
            (error, token) => {
                if (error) {
                    return res.status(500).json({
                        message: 'Internal server error: Authentication failed!'
                    });
                }
                res.json({
                    message: 'Login successful',
                    id: userDoc._id,
                    user: userDoc.username,
                    accessToken: token
                });
            })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    signUp,
    signIn
};
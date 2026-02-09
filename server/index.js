const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config();
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const CLIENT_URL = process.env.CLIENT_URL;

app.get("/", (req, res) => {
    res.send(`
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: sarabun;
        ">
            <h1>Welcome to MERN Chat Server.</h1>
        </div>
    `);
});

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
    })
);
app.use(cookieParser());

if (!DB_URL) {
    console.log("DB_URL(Database URL) is undefined in .env file.")
} else {
    mongoose.connect(DB_URL)
        .then(() => {
            console.log("Database connected successful!");
        })
        .catch((error) => {
            console.log("Database connected failed!");
            console.log(error);
        })
}

const userRouter = require("./routers/user.router");
app.use("/api/user", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
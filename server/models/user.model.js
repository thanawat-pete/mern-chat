const mongoose = require("mongoose");
const {
    Schema,
    model
} = mongoose;

const userSchema = new Schema({
    fullname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        min: 6
    },
    profilePicture: {
        type: String,
        default: "https://e7.pngegg.com/pngimages/782/114/png-clipart-profile-icon-circled-user-icon-icons-logos-emojis-users-thumbnail.png"
    }
}, {
    timestamps: true
});

const User = model("User", userSchema);
module.exports = User;
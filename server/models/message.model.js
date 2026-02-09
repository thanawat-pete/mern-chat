const mongoose = require("mongoose");
const {
    Schema,
    model
} = mongoose;

const messageSchema = new Schema({
    text: {
        type: String
    },
    files: {
        type: String
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
}, {
    timestamps: true
});

const Message = model("Message", messageSchema);
module.exports = Message;
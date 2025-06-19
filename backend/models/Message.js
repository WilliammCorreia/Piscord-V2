const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    content: { type: String, required: true, maxlength: 2000 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referenceId: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
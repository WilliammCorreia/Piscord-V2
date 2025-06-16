const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 24 },
    ownerId: { type: String, require: true },
    memberIds: { type: [String] },
    bannedIds: { type: [String] },
}, { timestamps: true });

module.exports = mongoose.model("Server", ServerSchema);
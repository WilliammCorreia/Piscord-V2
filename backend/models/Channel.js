const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true , maxlenght: 24 },
    serverId: { type: String, required: true },
    roleIds: { type: [String] }
}, { timestamps: true });

module.exports = mongoose.model("Channel", ChannelSchema);
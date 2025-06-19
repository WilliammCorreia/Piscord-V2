const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 24 },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberIds: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bannedIds: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

module.exports = mongoose.model("Server", ServerSchema);
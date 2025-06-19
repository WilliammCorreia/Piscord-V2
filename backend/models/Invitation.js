const mongoose = require("mongoose");

const InvitationSchema = mongoose.Schema({
    code: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    serverId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: { type: Boolean, default: true },
    expiredAt: { type: Date },
    maxUsage: { type: Number, default: null },
    currentUsage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Invitation", InvitationSchema);
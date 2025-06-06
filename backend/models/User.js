const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, maxlength: 64 },
    hashPassword: { type: String, required: true, minlength: 12, maxlength: 64 },
    username: { type: String, required: true, maxlength: 24 },
    avatarUrl: { type: String },
    displayStatus: { type: Boolean },
    lastConnection: { type: Date },
}, { timestamps : true });

module.exports = mongoose.model("User", UserSchema);
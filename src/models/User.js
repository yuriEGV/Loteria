const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    name: String,
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    joinDate: { type: Date, default: Date.now },
    totalMonths: { type: Number, default: 0 },  // Months on platform
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

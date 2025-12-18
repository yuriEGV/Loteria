const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    amount: { type: Number, required: true },
    transactionHash: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    monthPaid: { type: Number, required: true }, // Which month this payment covers
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);

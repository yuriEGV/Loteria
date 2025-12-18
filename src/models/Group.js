const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    groupType: {
        type: String,
        enum: ['BASICO', 'ESTANDAR', 'PREMIUM'],
        required: true
    },
    maxParticipants: { type: Number, required: true },  // Group Size (X)
    monthlyAmount: { type: Number, required: true },    // Amount (Y)
    prizeAmount: { type: Number, required: true },      // Prize (N×Y)
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        monthsInGroup: { type: Number, default: 0 },  // Weight for fairness
        joinOrder: Number,      // Arrival order
        lastPaidMonth: { type: Number, default: 0 },
        hasWon: { type: Boolean, default: false }
    }],
    currentRound: { type: Number, default: 1 },     // Current cyclical turn
    blockchainContract: String,  // Smart contract address
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for performance
groupSchema.index({ 'participants.user': 1 });
groupSchema.index({ currentRound: 1 });

module.exports = mongoose.model('Group', groupSchema);

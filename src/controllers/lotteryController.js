const Group = require('../models/Group');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const { calculateFairWinner } = require('../utils/lotteryAlgorithm');
const { transferPrize, getContractBalance } = require('../utils/blockchainVerifier');

// @desc    Run monthly lottery for a group
// @route   POST /api/lottery/run/:groupId
// @access  Private (Admin only)
const runMonthlyLottery = async (req, res) => {
    const { groupId } = req.params;

    try {
        // Populate participants with user data for the algorithm
        const group = await Group.findById(groupId).populate('participants.user');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.isActive) {
            return res.status(400).json({ message: 'Group is not active' });
        }

        if (group.participants.length === 0) {
            return res.status(400).json({ message: 'No participants in group' });
        }

        // 1. Calculate winner using fair algorithm
        const winner = calculateFairWinner(group.participants);

        if (!winner || !winner.user) {
            return res.status(500).json({ message: 'Could not determine winner' });
        }

        // 2. Transfer prize via smart contract
        const transferResult = await transferPrize(
            group.blockchainContract,
            winner.user.walletAddress,
            group.currentRound
        );

        if (!transferResult.success) {
            return res.status(500).json({
                message: 'Prize transfer failed',
                error: transferResult.error
            });
        }

        // 3. Update group state
        const participantIndex = group.participants.findIndex(
            p => p.user._id.toString() === winner.user._id.toString()
        );

        if (participantIndex !== -1) {
            group.participants[participantIndex].hasWon = true;
            group.participants[participantIndex].lastPaidMonth = group.currentRound;
        }

        // Increment all participants' monthsInGroup
        group.participants.forEach(p => {
            p.monthsInGroup += 1;
        });

        group.currentRound += 1;
        await group.save();

        // 4. Update user's totalMonths
        await User.findByIdAndUpdate(winner.user._id, {
            $inc: { totalMonths: 1 }
        });

        res.json({
            success: true,
            winner: {
                walletAddress: winner.user.walletAddress,
                name: winner.user.name,
                email: winner.user.email
            },
            prizeAmount: group.prizeAmount,
            round: group.currentRound - 1,
            txHash: transferResult.txHash,
            blockNumber: transferResult.blockNumber
        });

    } catch (error) {
        console.error('Monthly lottery error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get lottery status for a group
// @route   GET /api/lottery/status/:groupId
// @access  Public
const getLotteryStatus = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).populate('participants.user', 'walletAddress name');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Get contract balance if contract address exists
        let contractBalance = 0;
        if (group.blockchainContract) {
            contractBalance = await getContractBalance(group.blockchainContract);
        }

        res.json({
            groupName: group.name,
            groupType: group.groupType,
            currentRound: group.currentRound,
            participantCount: group.participants.length,
            maxParticipants: group.maxParticipants,
            monthlyAmount: group.monthlyAmount,
            prizeAmount: group.prizeAmount,
            contractBalance,
            isActive: group.isActive,
            participants: group.participants.map(p => ({
                walletAddress: p.user?.walletAddress,
                name: p.user?.name,
                monthsInGroup: p.monthsInGroup,
                joinOrder: p.joinOrder,
                hasWon: p.hasWon
            }))
        });

    } catch (error) {
        console.error('Get lottery status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all active groups
// @route   GET /api/lottery/groups
// @access  Public
const getActiveGroups = async (req, res) => {
    try {
        const groups = await Group.find({ isActive: true })
            .select('name groupType maxParticipants monthlyAmount prizeAmount participants currentRound')
            .lean();

        const groupsWithStats = groups.map(group => ({
            _id: group._id,
            name: group.name,
            groupType: group.groupType,
            maxParticipants: group.maxParticipants,
            currentParticipants: group.participants.length,
            monthlyAmount: group.monthlyAmount,
            prizeAmount: group.prizeAmount,
            currentRound: group.currentRound,
            isFull: group.participants.length >= group.maxParticipants
        }));

        res.json(groupsWithStats);

    } catch (error) {
        console.error('Get active groups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    runMonthlyLottery,
    getLotteryStatus,
    getActiveGroups
};

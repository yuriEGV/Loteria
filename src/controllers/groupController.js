const Group = require('../models/Group');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const { calculateFairPosition } = require('../utils/lotteryAlgorithm');
const { verifyDeposit } = require('../utils/blockchainVerifier');
const { getGroupConfig, isValidGroupType } = require('../config/groupConfigs');

// @desc    Join a group
// @route   POST /api/groups/join/:groupId
// @access  Private
const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    const { txHash } = req.body; // Transaction hash from blockchain deposit
    const user = req.user;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.isActive) {
            return res.status(400).json({ message: 'Group is not active' });
        }

        if (group.participants.length >= group.maxParticipants) {
            return res.status(400).json({ message: 'Group is full' });
        }

        // Check if user is already in group
        const isMember = group.participants.some(p => p.user.toString() === user._id.toString());
        if (isMember) {
            return res.status(400).json({ message: 'User already in group' });
        }

        // 1. Verify blockchain deposit
        const verification = await verifyDeposit(
            txHash,
            group.monthlyAmount,
            user.walletAddress,
            group.blockchainContract
        );

        if (!verification.success) {
            return res.status(400).json({
                message: 'Deposit verification failed',
                error: verification.error
            });
        }

        // 2. Save deposit record
        await Deposit.create({
            user: user._id,
            group: group._id,
            amount: group.monthlyAmount,
            transactionHash: txHash,
            status: 'confirmed',
            monthPaid: 1
        });

        // 3. Calculate fair position
        const position = calculateFairPosition(group.participants, user);

        // 4. Update group and user
        group.participants.push({
            user: user._id,
            monthsInGroup: 0,
            joinOrder: position
        });

        await group.save();

        // Update user's group list
        user.groups.push(group._id);
        await user.save();

        res.json({
            success: true,
            position,
            txHash: verification.txHash,
            blockNumber: verification.blockNumber
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { type, contractAddress } = req.body; // type: 'BASICO', 'ESTANDAR', 'PREMIUM'

    try {
        // Validate group type
        if (!isValidGroupType(type)) {
            return res.status(400).json({
                message: 'Invalid group type. Valid types: BASICO, ESTANDAR, PREMIUM'
            });
        }

        // Get configuration for the group type
        const config = getGroupConfig(type);

        // Create group with predefined configuration
        const group = await Group.create({
            name: `${config.name} - ${new Date().toISOString().slice(0, 7)}`,
            groupType: type.toUpperCase(),
            maxParticipants: config.maxParticipants,
            monthlyAmount: config.monthlyAmount,
            prizeAmount: config.prizeAmount,
            blockchainContract: contractAddress || '', // Optional contract address
            participants: []
        });

        res.status(201).json({
            success: true,
            group: {
                _id: group._id,
                name: group.name,
                groupType: group.groupType,
                maxParticipants: group.maxParticipants,
                monthlyAmount: group.monthlyAmount,
                prizeAmount: group.prizeAmount,
                description: config.description
            }
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(400).json({ message: 'Invalid group data', error: error.message });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:groupId
// @access  Public
const getGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId)
            .populate('participants.user', 'walletAddress name email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { joinGroup, createGroup, getGroup };

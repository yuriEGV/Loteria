const express = require('express');
const router = express.Router();
const { calculateCommission, getCommissionBreakdown, calculateRecoveryTime } = require('../utils/commissionCalculator');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// @desc    Get prize distribution details for a group
// @route   GET /api/commission/distribution/:groupId
// @access  Public
const getPrizeDistribution = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const commissionData = calculateCommission(group.groupType, group.prizeAmount);
        const breakdown = getCommissionBreakdown(group.groupType);
        const recoveryTime = calculateRecoveryTime(group.maxParticipants);

        res.json({
            groupName: group.name,
            groupType: group.groupType,
            premioBruto: group.prizeAmount,
            comision: {
                porcentaje: commissionData.commissionRate,
                costoFijo: commissionData.fixedCost,
                total: commissionData.totalCommission,
                descripcion: commissionData.description
            },
            premioNeto: commissionData.netPrize,
            tiempoRecuperacion: recoveryTime,
            desgloseCostos: breakdown ? {
                gasBlockchain: breakdown.gasBlockchain,
                infraestructura: breakdown.infrastructure,
                soporte: breakdown.support,
                margenNeto: breakdown.netMargin
            } : null
        });

    } catch (error) {
        console.error('Get prize distribution error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get commission rates for all group types
// @route   GET /api/commission/rates
// @access  Public
const getCommissionRates = async (req, res) => {
    try {
        const rates = {
            BASICO: {
                percentage: '2.5%',
                fixedCost: 2000,
                totalOnPrize: 4500,
                netPrize: 95500
            },
            ESTANDAR: {
                percentage: '3.5%',
                fixedCost: 5000,
                totalOnPrize: 18125,
                netPrize: 356875
            },
            PREMIUM: {
                percentage: '4.5%',
                fixedCost: 10000,
                totalOnPrize: 46000,
                netPrize: 754000
            }
        };

        res.json(rates);
    } catch (error) {
        console.error('Get commission rates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register routes
router.get('/distribution/:groupId', getPrizeDistribution);
router.get('/rates', getCommissionRates);

module.exports = router;

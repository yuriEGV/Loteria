/**
 * Configuración de comisiones por tipo de grupo
 * Fórmula: Comisión = (Premio × % Base) + Costo Fijo Operativo
 */
const COMMISSION_CONFIGS = {
    BASICO: {
        percentage: 0.025,      // 2.5%
        fixedCost: 2000,        // $2,000 CLP
        description: 'Cubre gas blockchain + operación básica'
    },
    ESTANDAR: {
        percentage: 0.035,      // 3.5%
        fixedCost: 5000,        // $5,000 CLP
        description: 'Cubre gas + infraestructura + soporte'
    },
    PREMIUM: {
        percentage: 0.045,      // 4.5%
        fixedCost: 10000,       // $10,000 CLP
        description: 'Cubre gas + infraestructura premium + soporte 24/7'
    }
};

/**
 * Calcula la comisión total para un grupo
 * @param {string} groupType - Tipo de grupo (BASICO, ESTANDAR, PREMIUM)
 * @param {number} prizeAmount - Monto del premio bruto
 * @returns {Object} Desglose de comisión
 */
function calculateCommission(groupType, prizeAmount) {
    const config = COMMISSION_CONFIGS[groupType.toUpperCase()];

    if (!config) {
        throw new Error(`Invalid group type: ${groupType}`);
    }

    const percentageAmount = Math.round(prizeAmount * config.percentage);
    const totalCommission = percentageAmount + config.fixedCost;
    const netPrize = prizeAmount - totalCommission;

    return {
        grossPrize: prizeAmount,
        percentageAmount,
        fixedCost: config.fixedCost,
        totalCommission,
        netPrize,
        commissionRate: `${config.percentage * 100}%`,
        description: config.description
    };
}

/**
 * Calcula el desglose de costos cubiertos por la comisión
 * @param {string} groupType - Tipo de grupo
 * @returns {Object} Desglose de costos
 */
function getCommissionBreakdown(groupType) {
    const breakdowns = {
        BASICO: {
            gasBlockchain: 1500,
            infrastructure: 500,
            support: 500,
            netMargin: 2000
        },
        ESTANDAR: {
            gasBlockchain: 3000,
            infrastructure: 1000,
            support: 1000,
            netMargin: 13125
        },
        PREMIUM: {
            gasBlockchain: 6000,
            infrastructure: 2000,
            support: 2000,
            netMargin: 36000
        }
    };

    return breakdowns[groupType.toUpperCase()] || null;
}

/**
 * Calcula el tiempo de recuperación de inversión
 * @param {number} maxParticipants - Número de participantes
 * @returns {string} Tiempo de recuperación
 */
function calculateRecoveryTime(maxParticipants) {
    const months = maxParticipants - 0.5;
    return `${months} meses`;
}

module.exports = {
    COMMISSION_CONFIGS,
    calculateCommission,
    getCommissionBreakdown,
    calculateRecoveryTime
};

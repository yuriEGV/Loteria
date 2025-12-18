/**
 * Configuraciones predefinidas de grupos de lotería
 */
const GROUP_CONFIGS = {
    BASICO: {
        name: 'Básico',
        description: 'Ideal para estudiantes y jóvenes',
        maxParticipants: 10,
        monthlyAmount: 10000, // CLP
        prizeAmount: 100000,  // 10 * 10,000
        recoveryMonths: 10,
        commission: {
            percentage: 0.025,
            fixedCost: 2000,
            total: 4500,
            netPrize: 95500
        }
    },
    ESTANDAR: {
        name: 'Estándar',
        description: 'Perfecto para trabajadores',
        maxParticipants: 15,
        monthlyAmount: 25000, // CLP
        prizeAmount: 375000,  // 15 * 25,000
        recoveryMonths: 15,
        commission: {
            percentage: 0.035,
            fixedCost: 5000,
            total: 18125,
            netPrize: 356875
        }
    },
    PREMIUM: {
        name: 'Premium',
        description: 'Diseñado para profesionales',
        maxParticipants: 8,
        monthlyAmount: 100000, // CLP
        prizeAmount: 800000,   // 8 * 100,000
        recoveryMonths: 8,
        commission: {
            percentage: 0.045,
            fixedCost: 10000,
            total: 46000,
            netPrize: 754000
        }
    }
};

/**
 * Obtiene la configuración de un tipo de grupo
 * @param {string} type - Tipo de grupo (BASICO, ESTANDAR, PREMIUM)
 * @returns {Object} Configuración del grupo
 */
function getGroupConfig(type) {
    const config = GROUP_CONFIGS[type.toUpperCase()];
    if (!config) {
        throw new Error(`Invalid group type: ${type}. Valid types: BASICO, ESTANDAR, PREMIUM`);
    }
    return config;
}

/**
 * Obtiene todos los tipos de grupos disponibles
 * @returns {Array} Lista de configuraciones
 */
function getAllGroupConfigs() {
    return Object.keys(GROUP_CONFIGS).map(key => ({
        type: key,
        ...GROUP_CONFIGS[key]
    }));
}

/**
 * Valida si un tipo de grupo es válido
 * @param {string} type - Tipo de grupo
 * @returns {boolean}
 */
function isValidGroupType(type) {
    return GROUP_CONFIGS.hasOwnProperty(type.toUpperCase());
}

module.exports = {
    GROUP_CONFIGS,
    getGroupConfig,
    getAllGroupConfigs,
    isValidGroupType
};

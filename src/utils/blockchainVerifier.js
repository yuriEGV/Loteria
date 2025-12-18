const { ethers } = require('ethers');
const { provider } = require('../config/blockchain');

/**
 * Verifica un depósito en la blockchain
 * @param {string} txHash - Hash de la transacción
 * @param {number} expectedAmount - Monto esperado en ETH/tokens
 * @param {string} walletAddress - Dirección de la wallet del usuario
 * @param {string} contractAddress - Dirección del smart contract
 * @returns {Object} Resultado de la verificación
 */
async function verifyDeposit(txHash, expectedAmount, walletAddress, contractAddress) {
    try {
        // 1. Obtener la transacción
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return {
                success: false,
                error: 'Transaction not found on blockchain'
            };
        }

        // 2. Esperar confirmación (al menos 1 bloque)
        const receipt = await tx.wait(1);

        if (receipt.status !== 1) {
            return {
                success: false,
                error: 'Transaction failed on blockchain'
            };
        }

        // 3. Verificar que el remitente es correcto
        if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
            return {
                success: false,
                error: 'Wallet address mismatch'
            };
        }

        // 4. Verificar el monto (convertir de Wei a ETH)
        const valueInEth = parseFloat(ethers.formatEther(tx.value));
        const expectedInEth = parseFloat(ethers.formatEther(ethers.parseEther(expectedAmount.toString())));

        if (valueInEth < expectedInEth) {
            return {
                success: false,
                error: `Insufficient amount. Expected: ${expectedInEth} ETH, Got: ${valueInEth} ETH`
            };
        }

        // 5. Verificar que fue al contrato correcto (si se proporciona)
        if (contractAddress && tx.to.toLowerCase() !== contractAddress.toLowerCase()) {
            return {
                success: false,
                error: 'Transaction sent to wrong contract address'
            };
        }

        return {
            success: true,
            txHash: tx.hash,
            amount: valueInEth,
            blockNumber: receipt.blockNumber,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Deposit verification error:', error);
        return {
            success: false,
            error: error.message || 'Unknown verification error'
        };
    }
}

/**
 * Transfiere el premio al ganador mediante el smart contract
 * @param {string} contractAddress - Dirección del smart contract
 * @param {string} winnerAddress - Dirección del ganador
 * @param {number} round - Número de ronda
 * @returns {Object} Resultado de la transferencia
 */
async function transferPrize(contractAddress, winnerAddress, round) {
    try {
        const { wallet, getLotteryContract } = require('../config/blockchain');

        // Obtener instancia del contrato
        const contract = getLotteryContract(contractAddress);

        // Llamar a la función payWinner del smart contract
        const tx = await contract.payWinner(winnerAddress, round);

        // Esperar confirmación
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            winner: winnerAddress,
            round
        };

    } catch (error) {
        console.error('Prize transfer error:', error);
        return {
            success: false,
            error: error.message || 'Transfer failed'
        };
    }
}

/**
 * Obtiene el balance del contrato
 * @param {string} contractAddress - Dirección del smart contract
 * @returns {number} Balance en ETH
 */
async function getContractBalance(contractAddress) {
    try {
        const balance = await provider.getBalance(contractAddress);
        return parseFloat(ethers.formatEther(balance));
    } catch (error) {
        console.error('Error getting contract balance:', error);
        return 0;
    }
}

module.exports = {
    verifyDeposit,
    transferPrize,
    getContractBalance
};

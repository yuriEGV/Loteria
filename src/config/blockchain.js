/*const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// Note: In production, manage the private key securely!
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Placeholder ABI - this needs to be updated with the actual compiled contract ABI
const lotteryABI = [
    // "function deposit() payable",
    // "function getWinner() view returns (address)"
];

const getLotteryContract = (address) =>
    new ethers.Contract(address, lotteryABI, wallet);

module.exports = { provider, wallet, getLotteryContract };
*/
// src/config/blockchain.js
const { ethers } = require('ethers');
require('dotenv').config();

let provider, wallet;

// Validar si blockchain está configurado
const isBlockchainConfigured = () => {
    return process.env.RPC_URL &&
        process.env.PRIVATE_KEY &&
        process.env.PRIVATE_KEY.length === 64; // Private key sin 0x debe tener 64 caracteres
};

if (process.env.BLOCKCHAIN_MODE === 'test' || !isBlockchainConfigured()) {
    // MODO TEST - Sin conexión real (o blockchain no configurado)
    console.log('⚠️  Blockchain en modo TEST - No se realizarán transacciones reales');
    provider = {
        getBalance: async () => 1000000000000000000n,
        getNetwork: async () => ({ chainId: 11155111, name: 'sepolia' })
    };
    wallet = {
        address: process.env.PLATFORM_WALLET || '0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5',
        signTransaction: async () => '0xmocktx'
    };
} else {
    // MODO PRODUCCIÓN - Conexión real
    try {
        provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log('✅ Blockchain conectado:', wallet.address);
    } catch (error) {
        console.error('❌ Error al conectar blockchain:', error.message);
        // Fallback a modo test si falla
        provider = { getBalance: async () => 0n };
        wallet = { address: '0x0000000000000000000000000000000000000000' };
    }
}

const getLotteryContract = (address) => {
    const lotteryABI = [
        "function deposit(address user, uint256 amount) external",
        "function distributePrize(address winner, uint256 amount) external"
    ];

    // Si estamos en modo test, retornar un mock
    if (process.env.BLOCKCHAIN_MODE === 'test' || !isBlockchainConfigured()) {
        return {
            deposit: async () => ({ hash: '0xmocktx', wait: async () => ({}) }),
            distributePrize: async () => ({ hash: '0xmocktx', wait: async () => ({}) })
        };
    }

    return new ethers.Contract(address, lotteryABI, wallet);
};

module.exports = { provider, wallet, getLotteryContract, isBlockchainConfigured };

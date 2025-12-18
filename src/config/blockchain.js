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

if (process.env.BLOCKCHAIN_MODE === 'test') {
    // MODO TEST - Sin conexión real
    provider = { getBalance: async () => 1000000000000000000n };
    wallet = { address: '0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5' };
} else {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

const getLotteryContract = (address) => {
    const lotteryABI = [
        "function deposit(address user, uint256 amount) external",
        "function distributePrize(address winner, uint256 amount) external"
    ];
    return new ethers.Contract(address, lotteryABI, wallet);
};

module.exports = { provider, wallet, getLotteryContract };

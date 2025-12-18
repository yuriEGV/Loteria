// ============================================
// EJEMPLO 1: Integración Básica con MetaMask
// ============================================

// 1. Conectar Wallet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('Por favor instala MetaMask!');
        return null;
    }

    try {
        // Solicitar acceso a la cuenta
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        const walletAddress = accounts[0];
        console.log('Wallet conectada:', walletAddress);

        return walletAddress;
    } catch (error) {
        console.error('Error conectando wallet:', error);
        return null;
    }
}

// 2. Login en la API con Wallet
async function loginWithWallet(walletAddress) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress })
    });

    const data = await response.json();

    // Guardar token en localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('walletAddress', data.walletAddress);

    console.log('Login exitoso:', data);
    return data;
}

// ============================================
// EJEMPLO 2: Depositar en Smart Contract
// ============================================

import { ethers } from 'ethers';

// ABI del contrato LotteryPool
const LOTTERY_ABI = [
    "function deposit() external payable",
    "function getBalance() external view returns (uint256)",
    "function monthlyAmount() external view returns (uint256)",
    "function participants(uint256) external view returns (address)"
];

async function depositToLottery(contractAddress, amountInEth) {
    try {
        // 1. Conectar con MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 2. Crear instancia del contrato
        const contract = new ethers.Contract(
            contractAddress,
            LOTTERY_ABI,
            signer
        );

        // 3. Obtener el monto mensual requerido
        const monthlyAmount = await contract.monthlyAmount();
        console.log('Monto requerido:', ethers.formatEther(monthlyAmount), 'ETH');

        // 4. Hacer el depósito
        const tx = await contract.deposit({
            value: ethers.parseEther(amountInEth.toString())
        });

        console.log('Transacción enviada:', tx.hash);

        // 5. Esperar confirmación
        const receipt = await tx.wait();
        console.log('Transacción confirmada en bloque:', receipt.blockNumber);

        return {
            success: true,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber
        };

    } catch (error) {
        console.error('Error en depósito:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// EJEMPLO 3: Unirse a Grupo (Flujo Completo)
// ============================================

async function joinGroupComplete(groupId, contractAddress, monthlyAmountEth) {
    try {
        // Paso 1: Conectar wallet
        const walletAddress = await connectWallet();
        if (!walletAddress) throw new Error('No se pudo conectar wallet');

        // Paso 2: Login en API
        const loginData = await loginWithWallet(walletAddress);
        const token = loginData.token;

        // Paso 3: Hacer depósito blockchain
        const depositResult = await depositToLottery(contractAddress, monthlyAmountEth);
        if (!depositResult.success) {
            throw new Error('Depósito falló: ' + depositResult.error);
        }

        // Paso 4: Registrar en API con txHash
        const response = await fetch(`http://localhost:5000/api/groups/join/${groupId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                txHash: depositResult.txHash
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Te uniste al grupo exitosamente!');
            console.log('Posición:', result.position);
            console.log('TX Hash:', result.txHash);
            console.log('Bloque:', result.blockNumber);
        }

        return result;

    } catch (error) {
        console.error('❌ Error uniéndose al grupo:', error);
        throw error;
    }
}

// ============================================
// EJEMPLO 4: Verificar Balance del Contrato
// ============================================

async function checkContractBalance(contractAddress) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, LOTTERY_ABI, provider);

    const balance = await contract.getBalance();
    const balanceInEth = ethers.formatEther(balance);

    console.log('Balance del contrato:', balanceInEth, 'ETH');
    return balanceInEth;
}

// ============================================
// EJEMPLO 5: Escuchar Eventos del Contrato
// ============================================

async function listenToDepositEvents(contractAddress) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, LOTTERY_ABI, provider);

    // Escuchar evento Deposit
    contract.on("Deposit", (user, amount, timestamp, event) => {
        console.log('💰 Nuevo depósito detectado!');
        console.log('Usuario:', user);
        console.log('Monto:', ethers.formatEther(amount), 'ETH');
        console.log('Timestamp:', new Date(Number(timestamp) * 1000));

        // Actualizar UI
        updateDepositList(user, amount);
    });
}

// ============================================
// EJEMPLO 6: React Component Completo
// ============================================

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function JoinGroupComponent({ groupId, contractAddress, monthlyAmount }) {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleJoinGroup = async () => {
        setLoading(true);
        setStatus('Conectando wallet...');

        try {
            // 1. Conectar wallet
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            const walletAddress = accounts[0];
            setWallet(walletAddress);

            // 2. Login
            setStatus('Autenticando...');
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress })
            });
            const { token } = await loginRes.json();

            // 3. Depositar
            setStatus('Esperando confirmación de depósito...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, LOTTERY_ABI, signer);

            const tx = await contract.deposit({
                value: ethers.parseEther(monthlyAmount.toString())
            });

            setStatus('Confirmando transacción...');
            const receipt = await tx.wait();

            // 4. Registrar en API
            setStatus('Registrando en grupo...');
            const joinRes = await fetch(`/api/groups/join/${groupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ txHash: receipt.hash })
            });

            const result = await joinRes.json();

            if (result.success) {
                setStatus('✅ ¡Te uniste exitosamente!');
            }

        } catch (error) {
            setStatus('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-group-card">
            <h2>Unirse al Grupo</h2>
            <p>Monto mensual: {monthlyAmount} ETH</p>

            {wallet && <p>Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}</p>}

            <button
                onClick={handleJoinGroup}
                disabled={loading}
            >
                {loading ? 'Procesando...' : 'Unirse al Grupo'}
            </button>

            {status && <p className="status">{status}</p>}
        </div>
    );
}

export default JoinGroupComponent;

// ============================================
// EJEMPLO 7: Testing con Hardhat
// ============================================

// hardhat.config.js
module.exports = {
    solidity: "0.8.0",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};

// scripts/deploy.js
async function main() {
    const LotteryPool = await ethers.getContractFactory("LotteryPool");

    // Desplegar para grupo BASICO (10,000 CLP ≈ 0.01 ETH)
    const monthlyAmount = ethers.parseEther("0.01");
    const maxParticipants = 10;

    const lottery = await LotteryPool.deploy(monthlyAmount, maxParticipants);
    await lottery.waitForDeployment();

    console.log("LotteryPool deployed to:", await lottery.getAddress());
}

main();

// ============================================
// EJEMPLO 8: Manejo de Errores Comunes
// ============================================

async function handleWeb3Errors() {
    try {
        // Tu código aquí
    } catch (error) {
        if (error.code === 4001) {
            // Usuario rechazó la transacción
            console.log('Usuario canceló la transacción');
        } else if (error.code === -32603) {
            // Error interno
            console.log('Error en el nodo RPC');
        } else if (error.message.includes('insufficient funds')) {
            console.log('Fondos insuficientes en la wallet');
        } else if (error.message.includes('nonce')) {
            console.log('Error de nonce - intenta de nuevo');
        } else {
            console.error('Error desconocido:', error);
        }
    }
}

// ============================================
// EJEMPLO 9: Cambiar de Red
// ============================================

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
        });
    } catch (switchError) {
        // Red no agregada, agregarla
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_KEY'],
                    nativeCurrency: {
                        name: 'Sepolia ETH',
                        symbol: 'SEP',
                        decimals: 18
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
            });
        }
    }
}

// ============================================
// EJEMPLO 10: Monitorear Estado de Transacción
// ============================================

async function monitorTransaction(txHash) {
    const provider = new ethers.BrowserProvider(window.ethereum);

    console.log('Esperando confirmación...');

    // Esperar 1 confirmación
    const receipt = await provider.waitForTransaction(txHash, 1);

    if (receipt.status === 1) {
        console.log('✅ Transacción exitosa!');
        console.log('Gas usado:', receipt.gasUsed.toString());
        console.log('Bloque:', receipt.blockNumber);
    } else {
        console.log('❌ Transacción falló');
    }

    return receipt;
}

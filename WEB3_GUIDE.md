# 🌐 Guía Completa de Integración Web3

## 📚 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Conectar MetaMask](#conectar-metamask)
3. [Interactuar con Smart Contracts](#interactuar-con-smart-contracts)
4. [Flujo Completo de Usuario](#flujo-completo-de-usuario)
5. [Testing en Testnet](#testing-en-testnet)
6. [Manejo de Errores](#manejo-de-errores)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🚀 Configuración Inicial

### Instalar Dependencias

```bash
# Para proyectos React/Next.js
npm install ethers

# Para proyectos vanilla JS
# Usar CDN en HTML:
<script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
```

### Configurar Variables de Entorno

```env
# .env.local (Next.js) o .env (React)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
```

---

## 🦊 Conectar MetaMask

### Método 1: Vanilla JavaScript

```javascript
async function connectWallet() {
    // Verificar si MetaMask está instalado
    if (typeof window.ethereum === 'undefined') {
        alert('Por favor instala MetaMask!');
        return null;
    }

    try {
        // Solicitar acceso a cuentas
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        const walletAddress = accounts[0];
        console.log('Conectado:', walletAddress);
        
        return walletAddress;
    } catch (error) {
        if (error.code === 4001) {
            console.log('Usuario rechazó la conexión');
        }
        return null;
    }
}
```

### Método 2: React Hook

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function useWallet() {
    const [wallet, setWallet] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const connect = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            
            setWallet(accounts[0]);
            setProvider(provider);
            setSigner(signer);
        }
    };

    useEffect(() => {
        // Auto-conectar si ya estaba conectado
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        connect();
                    }
                });
        }
    }, []);

    return { wallet, provider, signer, connect };
}
```

---

## 📝 Interactuar con Smart Contracts

### Leer Datos del Contrato

```javascript
const LOTTERY_ABI = [
    "function monthlyAmount() external view returns (uint256)",
    "function maxParticipants() external view returns (uint256)",
    "function getBalance() external view returns (uint256)",
    "function participants(uint256) external view returns (address)"
];

async function readContractData(contractAddress) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, LOTTERY_ABI, provider);
    
    // Leer datos
    const monthlyAmount = await contract.monthlyAmount();
    const maxParticipants = await contract.maxParticipants();
    const balance = await contract.getBalance();
    
    console.log('Monto mensual:', ethers.formatEther(monthlyAmount), 'ETH');
    console.log('Max participantes:', maxParticipants.toString());
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    
    return {
        monthlyAmount: ethers.formatEther(monthlyAmount),
        maxParticipants: maxParticipants.toString(),
        balance: ethers.formatEther(balance)
    };
}
```

### Escribir en el Contrato (Transacciones)

```javascript
async function depositToContract(contractAddress, amountInEth) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, LOTTERY_ABI, signer);
    
    try {
        // Estimar gas
        const gasEstimate = await contract.deposit.estimateGas({
            value: ethers.parseEther(amountInEth)
        });
        
        console.log('Gas estimado:', gasEstimate.toString());
        
        // Enviar transacción
        const tx = await contract.deposit({
            value: ethers.parseEther(amountInEth),
            gasLimit: gasEstimate * 120n / 100n // +20% margen
        });
        
        console.log('TX enviada:', tx.hash);
        
        // Esperar confirmación
        const receipt = await tx.wait();
        console.log('Confirmada en bloque:', receipt.blockNumber);
        
        return receipt;
    } catch (error) {
        console.error('Error en transacción:', error);
        throw error;
    }
}
```

---

## 🎯 Flujo Completo de Usuario

### Componente React Completo

```jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';

function LotteryJoinFlow({ groupId, contractAddress, monthlyAmountEth }) {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash] = useState('');

    const handleJoin = async () => {
        setLoading(true);
        
        try {
            // 1. Conectar wallet
            setStatus('Conectando wallet...');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletAddress = accounts[0];
            const signer = await provider.getSigner();
            
            // 2. Login en API
            setStatus('Autenticando...');
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress })
            });
            const { token } = await loginRes.json();
            
            // 3. Verificar red
            const network = await provider.getNetwork();
            if (network.chainId !== 11155111n) { // Sepolia
                throw new Error('Por favor cambia a Sepolia Testnet');
            }
            
            // 4. Verificar balance
            const balance = await provider.getBalance(walletAddress);
            const requiredAmount = ethers.parseEther(monthlyAmountEth);
            if (balance < requiredAmount) {
                throw new Error('Balance insuficiente');
            }
            
            // 5. Depositar en contrato
            setStatus('Depositando en blockchain...');
            const contract = new ethers.Contract(
                contractAddress,
                ["function deposit() external payable"],
                signer
            );
            
            const tx = await contract.deposit({
                value: requiredAmount
            });
            
            setTxHash(tx.hash);
            setStatus('Esperando confirmación...');
            
            const receipt = await tx.wait();
            
            // 6. Registrar en API
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
                setStatus(`✅ ¡Éxito! Posición: ${result.position}`);
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lottery-join">
            <h3>Unirse al Grupo</h3>
            <p>Depósito requerido: {monthlyAmountEth} ETH</p>
            
            <button onClick={handleJoin} disabled={loading}>
                {loading ? 'Procesando...' : 'Unirse'}
            </button>
            
            {status && <p className="status">{status}</p>}
            
            {txHash && (
                <a 
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ver en Etherscan
                </a>
            )}
        </div>
    );
}

export default LotteryJoinFlow;
```

---

## 🧪 Testing en Testnet

### 1. Configurar Sepolia en MetaMask

```javascript
async function addSepoliaNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'SEP',
                    decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/YOUR_KEY'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
        });
    } catch (error) {
        console.error('Error agregando red:', error);
    }
}
```

### 2. Obtener ETH de Prueba

Faucets para Sepolia:
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

### 3. Desplegar Contrato

```bash
# Usando Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Guardar la dirección del contrato
# Actualizar CONTRACT_ADDRESS en tu frontend
```

---

## ⚠️ Manejo de Errores

### Errores Comunes y Soluciones

```javascript
async function handleTransactionErrors() {
    try {
        // Tu código aquí
    } catch (error) {
        // Usuario rechazó transacción
        if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
            return 'Usuario canceló la transacción';
        }
        
        // Fondos insuficientes
        if (error.code === 'INSUFFICIENT_FUNDS') {
            return 'Balance insuficiente en tu wallet';
        }
        
        // Gas insuficiente
        if (error.message.includes('gas')) {
            return 'Gas insuficiente para la transacción';
        }
        
        // Nonce incorrecto
        if (error.message.includes('nonce')) {
            return 'Error de nonce - intenta de nuevo';
        }
        
        // Red incorrecta
        if (error.code === 'NETWORK_ERROR') {
            return 'Por favor cambia a Sepolia Testnet';
        }
        
        // Error genérico
        return `Error: ${error.message}`;
    }
}
```

---

## ✅ Mejores Prácticas

### 1. Validar Antes de Transaccionar

```javascript
async function validateBeforeTransaction(walletAddress, amountEth) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Verificar balance
    const balance = await provider.getBalance(walletAddress);
    const required = ethers.parseEther(amountEth);
    
    if (balance < required) {
        throw new Error('Balance insuficiente');
    }
    
    // Verificar red
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
        throw new Error('Red incorrecta');
    }
    
    // Estimar gas
    const gasPrice = await provider.getFeeData();
    const estimatedGas = 100000n; // Estimación
    const gasCost = gasPrice.gasPrice * estimatedGas;
    
    if (balance < required + gasCost) {
        throw new Error('Balance insuficiente para gas');
    }
    
    return true;
}
```

### 2. Mostrar Progreso al Usuario

```javascript
function TransactionProgress({ status }) {
    const steps = [
        { key: 'connect', label: 'Conectar Wallet' },
        { key: 'approve', label: 'Aprobar Transacción' },
        { key: 'confirm', label: 'Confirmar en Blockchain' },
        { key: 'register', label: 'Registrar en API' }
    ];
    
    return (
        <div className="progress">
            {steps.map((step, i) => (
                <div key={step.key} className={
                    status === step.key ? 'active' : 
                    i < steps.findIndex(s => s.key === status) ? 'complete' : ''
                }>
                    {step.label}
                </div>
            ))}
        </div>
    );
}
```

### 3. Cachear Datos del Contrato

```javascript
const contractCache = new Map();

async function getCachedContractData(contractAddress) {
    if (contractCache.has(contractAddress)) {
        return contractCache.get(contractAddress);
    }
    
    const data = await readContractData(contractAddress);
    contractCache.set(contractAddress, data);
    
    // Invalidar cache después de 5 minutos
    setTimeout(() => {
        contractCache.delete(contractAddress);
    }, 5 * 60 * 1000);
    
    return data;
}
```

---

## 📱 Demo Interactivo

Abre `examples/web3-demo.html` en tu navegador para probar la integración completa.

**Requisitos**:
1. MetaMask instalado
2. Conectado a Sepolia Testnet
3. ETH de prueba en tu wallet
4. Servidor API corriendo (`npm start`)

---

## 🔗 Recursos Adicionales

- [Documentación de ethers.js](https://docs.ethers.org/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Etherscan Sepolia](https://sepolia.etherscan.io)

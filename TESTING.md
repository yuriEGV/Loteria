# 🧪 Guía de Testing - Loteria Blockchain API

## 📦 Importar Colección en Postman

1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Arrastra el archivo `postman_collection.json`
4. La colección aparecerá en tu sidebar

## 🔧 Variables de Entorno

La colección usa estas variables (se auto-configuran):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `baseUrl` | URL del servidor | `http://localhost:5000` |
| `token` | JWT token (auto-guardado) | `eyJhbGciOiJIUzI1NiIs...` |
| `walletAddress` | Dirección wallet | `0x742d35Cc...` |
| `groupId` | ID del grupo (auto-guardado) | `507f1f77bcf86cd799439011` |
| `txHash` | Hash de transacción | `0x1234...abcdef` |

## 🚀 Flujo de Testing Completo

### 1️⃣ Autenticación
```
POST /api/auth/login
Body: { "walletAddress": "0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5" }
```
✅ **Auto-guarda**: `token` y `walletAddress`

### 2️⃣ Crear Grupo
```
POST /api/groups
Headers: Authorization: Bearer {{token}}
Body: { "type": "BASICO", "contractAddress": "0x..." }
```
✅ **Auto-guarda**: `groupId`

**Tipos disponibles**:
- `BASICO`: 10 personas × $10,000 = $100,000
- `ESTANDAR`: 15 personas × $25,000 = $375,000
- `PREMIUM`: 8 personas × $100,000 = $800,000

### 3️⃣ Ver Grupos Activos
```
GET /api/lottery/groups
```

### 4️⃣ Ver Detalles de Grupo
```
GET /api/groups/{{groupId}}
```

### 5️⃣ Ver Comisiones
```
GET /api/commission/distribution/{{groupId}}
GET /api/commission/rates
```

### 6️⃣ Unirse a Grupo (Requiere Web3)
```
POST /api/groups/join/{{groupId}}
Headers: Authorization: Bearer {{token}}
Body: { "txHash": "0x..." }
```

### 7️⃣ Ejecutar Sorteo
```
POST /api/lottery/run/{{groupId}}
Headers: Authorization: Bearer {{token}}
```

## 🌐 Testing con Web3 (Blockchain Real)

### Opción 1: Testnet (Recomendado)

#### A. Configurar MetaMask
1. Agregar red Sepolia (Ethereum Testnet)
2. Obtener ETH de prueba: https://sepoliafaucet.com

#### B. Desplegar Smart Contract
```bash
# Usando Hardhat
npx hardhat run scripts/deploy.js --network sepolia
```

#### C. Hacer Depósito Real
```javascript
// En tu DApp o consola del navegador
const contract = new ethers.Contract(
    "0xCONTRACT_ADDRESS",
    ABI,
    signer
);

// Depositar
const tx = await contract.deposit({
    value: ethers.parseEther("0.01") // 0.01 ETH
});

const receipt = await tx.wait();
console.log("TX Hash:", receipt.hash);
```

#### D. Usar txHash en Postman
1. Copiar el `receipt.hash`
2. Pegar en variable `txHash` de Postman
3. Ejecutar request "Join Group"

### Opción 2: Modo Test (Sin Blockchain)

Configurar en `.env`:
```env
BLOCKCHAIN_MODE=test
```

Esto permite testing sin conexión blockchain real.

## 📊 Respuestas Esperadas

### ✅ Login Exitoso
```json
{
    "_id": "507f1f77bcf86cd799439011",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ✅ Crear Grupo
```json
{
    "success": true,
    "group": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Básico - 2025-12",
        "groupType": "BASICO",
        "maxParticipants": 10,
        "monthlyAmount": 10000,
        "prizeAmount": 100000,
        "description": "Ideal para estudiantes y jóvenes"
    }
}
```

### ✅ Desglose de Comisión
```json
{
    "groupName": "Básico - 2025-12",
    "groupType": "BASICO",
    "premioBruto": 100000,
    "comision": {
        "porcentaje": "2.5%",
        "costoFijo": 2000,
        "total": 4500,
        "descripcion": "Cubre gas blockchain + operación básica"
    },
    "premioNeto": 95500,
    "tiempoRecuperacion": "9.5 meses",
    "desgloseCostos": {
        "gasBlockchain": 1500,
        "infraestructura": 500,
        "soporte": 500,
        "margenNeto": 2000
    }
}
```

### ✅ Sorteo Exitoso
```json
{
    "success": true,
    "winner": {
        "walletAddress": "0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5",
        "name": "Usuario Test",
        "email": "test@example.com"
    },
    "grossPrize": 100000,
    "commission": {
        "total": 4500,
        "percentage": "2.5%",
        "fixedCost": 2000,
        "description": "Cubre gas blockchain + operación básica"
    },
    "netPrize": 95500,
    "round": 1,
    "txHash": "0x...",
    "blockNumber": 12345
}
```

## ❌ Errores Comunes

### Error: "Not authorized"
**Solución**: Ejecutar primero "Login with Wallet"

### Error: "Deposit verification failed"
**Solución**: 
1. Verificar que `txHash` sea válido
2. Asegurar que la transacción esté confirmada
3. Verificar que el monto sea correcto

### Error: "Group is full"
**Solución**: Crear un nuevo grupo

## 🔍 Scripts de Testing Automático

Los requests incluyen scripts que:
- ✅ Auto-guardan el token JWT
- ✅ Auto-guardan el groupId
- ✅ Validan respuestas
- ✅ Muestran logs en consola

## 📝 Notas Importantes

1. **Orden de Ejecución**: Seguir el flujo 1→2→3→4→5→6→7
2. **Token Expira**: En 30 días (re-login si es necesario)
3. **MongoDB**: Debe estar corriendo y conectado
4. **Servidor**: `npm start` debe estar activo

## 🎯 Casos de Uso Reales

### Caso 1: Usuario se une a grupo
1. Login → Crear Grupo → Join Group (con txHash real)

### Caso 2: Admin ejecuta sorteo
1. Login → Run Monthly Lottery → Ver resultado

### Caso 3: Consultar comisiones
1. Get Commission Rates → Ver tarifas
2. Get Prize Distribution → Ver desglose específico

---

**¿Necesitas ayuda?** Revisa los logs del servidor en la terminal donde corre `npm start`

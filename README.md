# Loteria Blockchain API

Sistema de lotería descentralizada con arquitectura híbrida: backend Node.js/Express/MongoDB + smart contracts Ethereum/Solana.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Desarrollo local
npm run dev

# Producción
npm start
```

## 📋 Grupos Disponibles

| Grupo | Participantes | Depósito Mensual | Premio Bruto | Comisión | Premio Neto |
|-------|--------------|------------------|--------------|----------|-------------|
| **BASICO** | 10 | $10,000 CLP | $100,000 | $4,500 (2.5%+$2k) | $95,500 |
| **ESTANDAR** | 15 | $25,000 CLP | $375,000 | $18,125 (3.5%+$5k) | $356,875 |
| **PREMIUM** | 8 | $100,000 CLP | $800,000 | $46,000 (4.5%+$10k) | $754,000 |

### Sistema de Comisiones
- **Fórmula**: Comisión = (Premio × % Base) + Costo Fijo Operativo
- **Cubre**: Gas blockchain + Infraestructura + Soporte
- **Transparente**: Desglose completo en cada sorteo

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login con wallet

### Grupos
- `POST /api/groups` - Crear grupo
- `GET /api/groups/:id` - Ver grupo
- `POST /api/groups/join/:id` - Unirse (requiere txHash)

### Lotería
- `GET /api/lottery/groups` - Grupos activos
- `GET /api/lottery/status/:id` - Estado del sorteo
- `POST /api/lottery/run/:id` - Ejecutar sorteo mensual

### Comisiones
- `GET /api/commission/distribution/:id` - Desglose de premio
- `GET /api/commission/rates` - Tarifas de comisión

## 📦 Deployment en Vercel

```bash
vercel
```

Ver [walkthrough.md](./walkthrough.md) para documentación completa.

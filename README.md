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

- **BASICO**: 10 personas × $10,000 CLP = $100,000 premio
- **ESTANDAR**: 15 personas × $25,000 CLP = $375,000 premio  
- **PREMIUM**: 8 personas × $100,000 CLP = $800,000 premio

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

## 📦 Deployment en Vercel

```bash
vercel
```

Ver [walkthrough.md](./walkthrough.md) para documentación completa.

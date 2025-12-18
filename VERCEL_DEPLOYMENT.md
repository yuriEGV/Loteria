# 🚀 Guía de Deployment en Vercel

## ❌ Error Actual

```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Causa**: Las variables de entorno no están configuradas en Vercel.

---

## ✅ Solución: Configurar Variables de Entorno

### Paso 1: Ir al Dashboard de Vercel

1. Abre https://vercel.com/dashboard
2. Selecciona tu proyecto **"Loteria"**
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar Variables

Agrega las siguientes variables (una por una):

| Variable | Valor | Environments |
|----------|-------|--------------|
| `MONGO_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `JWT_SECRET` | `tu_secret_super_seguro` | Production, Preview, Development |
| `RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/...` | Production, Preview, Development |
| `PRIVATE_KEY` | `tu_private_key_sin_0x` | Production, Preview, Development |
| `PLATFORM_WALLET` | `0x742d35Cc...` | Production, Preview, Development |
| `BLOCKCHAIN_MODE` | `test` (opcional) | Production, Preview, Development |

### Paso 3: Redesplegar

Después de agregar las variables:

**Opción A: Desde el Dashboard**
1. Ve a **Deployments**
2. Click en el último deployment
3. Click en los **3 puntos** (⋯)
4. Selecciona **Redeploy**

**Opción B: Desde Git**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 📋 Cómo Obtener las Variables

### MONGO_URI
1. Ve a https://cloud.mongodb.com
2. Click en **Connect** en tu cluster
3. Selecciona **Connect your application**
4. Copia la connection string
5. Reemplaza `<password>` con tu contraseña real

Ejemplo:
```
mongodb+srv://usuario:password@cluster.mongodb.net/loteria?retryWrites=true&w=majority
```

### JWT_SECRET
Genera un string aleatorio seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### RPC_URL (Para Blockchain)
1. Crea cuenta en https://www.alchemy.com
2. Crea una app para **Sepolia Testnet**
3. Copia el **HTTP URL**

Ejemplo:
```
https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY_AQUI
```

### PRIVATE_KEY
⚠️ **IMPORTANTE**: Nunca compartas tu private key real

Para testing, puedes usar una wallet de prueba:
```
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

---

## 🔍 Verificar Deployment

Después de redesplegar, verifica:

1. **Logs**: Ve a **Deployments** → Click en el deployment → **Function Logs**
2. Deberías ver:
```
MongoDB Connected: ac-tbqmyj9-shard-00-00.c6vj7t7.mongodb.net
Server running on port 5000
```

3. **Prueba la API**:
```bash
curl https://tu-app.vercel.app/
# Debería responder con: "Loteria Blockchain API is running"
```

---

## 🐛 Troubleshooting

### Error: "MONGO_URI is undefined"
- Verifica que agregaste la variable en Vercel
- Asegúrate de seleccionar **Production** environment
- Redesplega después de agregar variables

### Error: "Invalid connection string"
- Verifica que el MONGO_URI esté completo
- Asegúrate de reemplazar `<password>` con tu contraseña real
- No incluyas espacios ni saltos de línea

### Error: "Cannot connect to MongoDB"
- Verifica que tu IP esté en la whitelist de MongoDB
- En MongoDB Atlas, agrega `0.0.0.0/0` para permitir todas las IPs
- Ve a **Network Access** → **Add IP Address** → **Allow Access from Anywhere**

---

## 📸 Screenshots de Referencia

### 1. Environment Variables en Vercel
```
Settings → Environment Variables → Add New

Key: MONGO_URI
Value: mongodb+srv://...
Environments: ✓ Production ✓ Preview ✓ Development
```

### 2. MongoDB Network Access
```
Security → Network Access → Add IP Address
Access List Entry: 0.0.0.0/0
Comment: Vercel deployment
```

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno agregadas en Vercel
- [ ] MONGO_URI configurado correctamente
- [ ] JWT_SECRET generado y agregado
- [ ] IP 0.0.0.0/0 agregada en MongoDB Atlas
- [ ] Proyecto redesplegado
- [ ] Logs verificados (sin errores)
- [ ] API funcionando (curl test)

---

## 🎯 Próximos Pasos

Una vez que el deployment funcione:

1. **Probar endpoints**:
```bash
# Login
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5"}'

# Ver grupos activos
curl https://tu-app.vercel.app/api/lottery/groups
```

2. **Actualizar Postman** con la URL de producción

3. **Desplegar Smart Contract** en testnet

4. **Crear Frontend** para interactuar con la API

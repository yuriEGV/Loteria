# 🔧 Configuración de Variables de Entorno en Vercel

## ⚠️ Error Actual

```
TypeError: invalid private key
MongoDB Connected: undefined
```

**Causas**:
1. ✅ MongoDB conectado (pero muestra "undefined" - esto es normal)
2. ❌ `PRIVATE_KEY` tiene formato inválido

---

## 📋 Variables de Entorno Requeridas

### 1. Variables OBLIGATORIAS (Mínimo para que funcione)

```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/loteria
JWT_SECRET=cualquier_string_aleatorio_seguro
```

### 2. Variables OPCIONALES (Para blockchain)

```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
PRIVATE_KEY=tu_private_key_64_caracteres_sin_0x
PLATFORM_WALLET=0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5
```

**⚠️ IMPORTANTE**: Si NO configuras las variables de blockchain, el sistema funcionará en **modo TEST** automáticamente.

---

## 🚀 Pasos para Configurar en Vercel

### Paso 1: Ir al Dashboard

1. Abre https://vercel.com/dashboard
2. Selecciona tu proyecto **"Loteria"**
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar Variables Mínimas

**Opción A: Solo API (Sin Blockchain)**

Agrega solo estas 2 variables:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `MONGO_URI` | Tu connection string de MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | String aleatorio | `mi_secret_super_seguro_123` |

✅ Con esto el servidor funcionará en modo TEST

**Opción B: Con Blockchain Completo**

Agrega todas estas variables:

| Variable | Valor | Formato |
|----------|-------|---------|
| `MONGO_URI` | Connection string de MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | String aleatorio | Cualquier texto |
| `RPC_URL` | URL de Alchemy/Infura | `https://eth-sepolia.g.alchemy.com/v2/...` |
| `PRIVATE_KEY` | Private key **SIN 0x** | 64 caracteres hexadecimales |
| `PLATFORM_WALLET` | Dirección de la wallet | `0x742d35Cc...` |

### Paso 3: Formato Correcto de PRIVATE_KEY

❌ **INCORRECTO**:
```
0x1234567890abcdef...  (con 0x)
1234...                (muy corta)
```

✅ **CORRECTO**:
```
1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Debe tener exactamente 64 caracteres hexadecimales (sin el prefijo 0x)**

### Paso 4: Seleccionar Environments

Para cada variable, marca:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Paso 5: Guardar y Redesplegar

1. Click **Save** en cada variable
2. Ve a **Deployments**
3. Click en el último deployment → **⋯** → **Redeploy**

---

## 🔍 Cómo Obtener las Variables

### MONGO_URI

1. Ve a https://cloud.mongodb.com
2. Click **Connect** en tu cluster
3. Selecciona **Connect your application**
4. Copia la connection string
5. Reemplaza `<password>` con tu contraseña real

```
mongodb+srv://usuario:MI_PASSWORD_REAL@cluster.mongodb.net/loteria?retryWrites=true&w=majority
```

### JWT_SECRET

Genera un string aleatorio seguro:

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Cualquier texto
mi_secret_super_seguro_para_jwt_2024
```

### RPC_URL (Opcional - Solo si quieres blockchain)

1. Crea cuenta en https://www.alchemy.com
2. Crea una app para **Sepolia Testnet**
3. Copia el **HTTP URL**

```
https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY_AQUI
```

### PRIVATE_KEY (Opcional - Solo si quieres blockchain)

⚠️ **NUNCA uses una wallet con fondos reales**

**Para testing, crea una wallet nueva:**

1. Abre MetaMask
2. Crea una cuenta nueva
3. Ve a **Account Details** → **Export Private Key**
4. Copia la private key **SIN el 0x**

```
Ejemplo (NO USES ESTA):
ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## ✅ Verificar Deployment

Después de redesplegar:

### 1. Ver Logs

Ve a **Deployments** → Click en el deployment → **Function Logs**

**✅ Debería ver**:
```
MongoDB Connected: ac-tbqmyj9-shard-00-00.c6vj7t7.mongodb.net
⚠️  Blockchain en modo TEST - No se realizarán transacciones reales
Server running
```

**❌ Si ves errores**:
```
Error: The `uri` parameter to `openUri()` must be a string
→ MONGO_URI no está configurado o está vacío

TypeError: invalid private key
→ PRIVATE_KEY tiene formato incorrecto (debe ser 64 caracteres sin 0x)
```

### 2. Probar la API

```bash
# Debería responder "Loteria Blockchain API is running"
curl https://tu-app.vercel.app/

# Probar login
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5"}'
```

---

## 🐛 Troubleshooting

### Error: "MongoDB Connected: undefined"

**No es un error** - Es normal. MongoDB está conectado correctamente.

### Error: "invalid private key"

**Solución**:
1. Verifica que `PRIVATE_KEY` tenga exactamente 64 caracteres
2. Verifica que NO tenga el prefijo `0x`
3. O simplemente **NO agregues** `PRIVATE_KEY` y el sistema funcionará en modo TEST

### Error: "MONGO_URI is undefined"

**Solución**:
1. Verifica que agregaste la variable en Vercel
2. Verifica que seleccionaste **Production** environment
3. Redesplega después de agregar variables

### El servidor funciona pero no hace transacciones blockchain

**Esto es normal** si no configuraste `RPC_URL` y `PRIVATE_KEY`. El sistema está en **modo TEST**.

Para habilitar blockchain real:
1. Agrega `RPC_URL`
2. Agrega `PRIVATE_KEY` (64 caracteres, sin 0x)
3. Redesplega

---

## 📝 Checklist Final

- [ ] `MONGO_URI` agregado en Vercel
- [ ] `JWT_SECRET` agregado en Vercel
- [ ] Variables marcadas para **Production, Preview, Development**
- [ ] Proyecto redesplegado
- [ ] Logs verificados (sin errores)
- [ ] API responde correctamente (`curl` test)
- [ ] (Opcional) `RPC_URL` y `PRIVATE_KEY` para blockchain real

---

## 🎯 Próximos Pasos

Una vez que el deployment funcione:

1. **Probar endpoints** con Postman
2. **Actualizar** `postman_collection.json` con la URL de producción
3. **Desplegar Smart Contract** en Sepolia (si quieres blockchain real)
4. **Crear Frontend** para interactuar con la API

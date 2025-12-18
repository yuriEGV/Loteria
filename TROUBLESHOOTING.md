# 🔧 Solución de Problemas Comunes

## ❌ Error: "JsonWebTokenError: invalid signature"

### Causa
El token JWT fue generado con un `JWT_SECRET` diferente al que usa el servidor actual.

### Solución

**Opción 1: Hacer Login Nuevamente (Recomendado)**

1. En Postman, ejecuta el request **"Login with Wallet"**:
```
POST http://localhost:5000/api/auth/login
Body: {
    "walletAddress": "0x742d35Cc6634C0532925a3b8D7c7aC5329E8A5D5"
}
```

2. El script automático guardará el nuevo token en la variable `{{token}}`

3. Intenta crear el grupo nuevamente

**Opción 2: Verificar JWT_SECRET**

Asegúrate de que tu `.env` tenga un `JWT_SECRET` consistente:

```env
JWT_SECRET=tu_secret_super_seguro_aqui
```

Si cambias el `JWT_SECRET`, todos los tokens anteriores quedarán inválidos.

---

## ⚠️ Warnings de MongoDB

### Warning: "useNewUrlParser is a deprecated option"

**Ya solucionado** - Las opciones deprecadas han sido eliminadas de `src/config/db.js`.

Reinicia el servidor:
```bash
# Ctrl+C para detener
npm start
```

---

## 🔄 Flujo Correcto en Postman

### 1. Login
```
POST /api/auth/login
Body: { "walletAddress": "0x..." }
✅ Auto-guarda token
```

### 2. Crear Grupo
```
POST /api/groups
Headers: Authorization: Bearer {{token}}
Body: { "type": "BASICO", "contractAddress": "0x..." }
✅ Auto-guarda groupId
```

### 3. Ver Grupo
```
GET /api/groups/{{groupId}}
```

---

## 🐛 Otros Errores Comunes

### Error 401: "Not authorized"
**Causa**: Token inválido o expirado  
**Solución**: Hacer login nuevamente

### Error 404: "Group not found"
**Causa**: GroupId incorrecto  
**Solución**: Verificar que la variable `{{groupId}}` esté configurada

### Error 400: "Invalid group type"
**Causa**: Tipo de grupo inválido  
**Solución**: Usar solo: `BASICO`, `ESTANDAR`, o `PREMIUM`

### Error 500: "Server error"
**Causa**: MongoDB no conectado o error en el servidor  
**Solución**: 
1. Verificar que MongoDB esté corriendo
2. Verificar `MONGO_URI` en `.env`
3. Revisar logs del servidor

---

## 📝 Checklist de Debugging

- [ ] Servidor corriendo (`npm start`)
- [ ] MongoDB conectado (ver logs)
- [ ] `.env` configurado correctamente
- [ ] Token válido (hacer login si es necesario)
- [ ] Variables de Postman configuradas (`baseUrl`, `token`, `groupId`)
- [ ] Request body correcto (JSON válido)

---

## 🔍 Ver Logs del Servidor

Los logs del servidor muestran información útil:

```
✅ Correcto:
MongoDB Connected: ac-tbqmyj9-shard-00-00.c6vj7t7.mongodb.net
Server running on port 5000
POST /api/auth/login 200 3804.354 ms - 277

❌ Error:
JsonWebTokenError: invalid signature
POST /api/groups 401 5.440 ms - 28
```

El código de estado HTTP indica el problema:
- `200`: Éxito
- `401`: No autorizado (token inválido)
- `404`: No encontrado
- `500`: Error del servidor

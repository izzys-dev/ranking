# 🚀 Guía de Despliegue a Producción

## Opción 1: Vercel (Recomendado - Más fácil)

### Paso 1: Preparar el proyecto
```bash
# Asegúrate de estar en la rama production
git checkout production

# Verifica que config.local.js NO esté en git
git status
# Debe mostrar: "config/config.local.js" (ignorado)
```

### Paso 2: Crear archivo de configuración en Vercel
1. Ve a [vercel.com](https://vercel.com) e importa tu repositorio
2. En **Settings → Environment Variables**, agrega:
   ```
   SUPABASE_URL = https://tu-proyecto.supabase.co
   SUPABASE_KEY = tu-anon-key-aqui
   ```

### Paso 3: Crear config.local.js en Vercel
En los **Build Settings**, agrega un Build Script:
```bash
echo "window.SUPABASE_URL = '${SUPABASE_URL}'; window.SUPABASE_KEY = '${SUPABASE_KEY}';" > config/config.local.js
```

### Paso 4: Deploy automático
- Vercel desplegará automáticamente cuando hagas push a `production`
- El sitio estará en vivo en: `https://tu-app.vercel.app`

---

## Opción 2: Netlify

### Paso 1: Conectar repositorio
1. Ve a [netlify.com](https://netlify.com)
2. Conecta tu repositorio GitHub
3. Selecciona rama: `production`

### Paso 2: Configurar variables de entorno
En **Site Settings → Build & Deploy → Environment**:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-aqui
```

### Paso 3: Build command
```bash
echo "window.SUPABASE_URL = process.env.SUPABASE_URL; window.SUPABASE_KEY = process.env.SUPABASE_KEY;" > config/config.local.js && cat config/config.js
```

### Paso 4: Desplegar
Push a `production` y Netlify desplegará automáticamente.

---

## Opción 3: Servidor propio (Apache/Nginx)

### Paso 1: Preparar servidor
```bash
# En tu servidor
git clone https://github.com/tu-usuario/ranking.git
cd ranking
git checkout production
```

### Paso 2: Crear config.local.js
```bash
cat > config/config.local.js << EOF
window.SUPABASE_URL = 'https://tu-proyecto.supabase.co';
window.SUPABASE_KEY = 'tu-anon-key-aqui';
EOF
```

### Paso 3: Configurar servidor web

**Para Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    root /var/www/ranking/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Para Apache:**
```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/ranking/frontend
    
    <Directory /var/www/ranking/frontend>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Paso 4: Reiniciar servidor
```bash
sudo systemctl restart nginx
# o
sudo systemctl restart apache2
```

---

## 🔒 SEGURIDAD - Checklist

Antes de cada deploy a producción:

- [ ] `config.local.js` NO está en git (`git status` debe ignorarlo)
- [ ] Variables de entorno están configuradas en el hosting
- [ ] RLS policies en Supabase están activas
- [ ] Rama `production` tiene código limpio sin logs

---

## 🔄 Flujo de trabajo recomendado

```
1. Develop (local)
   └─ git checkout development
   └─ Haz cambios
   └─ Test localmente

2. Preparar producción
   └─ git checkout production
   └─ git merge development
   └─ Verifica que todo funciona

3. Deploy
   └─ git push origin production
   └─ El hosting (Vercel/Netlify/tu servidor) despliega automáticamente
   └─ config.local.js se genera con las variables de entorno
```

---

## ⚡ Requisitos mínimos

- [ ] Supabase URL y Anon Key obtenidas
- [ ] RLS habilitado en Supabase
- [ ] Hosting elegido (Vercel, Netlify, servidor propio)
- [ ] Variables de entorno configuradas en el hosting
- [ ] Dominio configurado (opcional pero recomendado)

---

## 🆘 Troubleshooting

**"No carga datos en producción"**
- Verifica que `config.local.js` está siendo generado correctamente
- Revisa la consola del navegador (F12) para errores
- Verifica las variables de entorno en el hosting

**"Error de CORS"**
- En Supabase, ve a Auth → Settings → Site URL
- Agrega tu dominio de producción: `https://tu-dominio.com`

**"Credenciales expuestas"**
- Regenera las keys en Supabase (Settings → API)
- NO commits `config.local.js`
- Usa variables de entorno del hosting

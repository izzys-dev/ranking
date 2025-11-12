# 🚫 .gitignore - Guía de Archivos Ignorados

Este archivo `.gitignore` especifica qué archivos y carpetas **NO deben ser subidos a GitHub**.

---

## 📋 CATEGORÍAS DE ARCHIVOS IGNORADOS

### 1. **Node Modules** (Dependencias)

```
node_modules/
package-lock.json
```

- Nunca subir `node_modules/` - Se regenera con `npm install`
- `package-lock.json` generalmente se incluye, pero algunos equipos lo ignoran

### 2. **Variables de Entorno** (Credenciales Sensibles)

```
.env
.env.local
.env.*.local
```

- **IMPORTANTE:** Nunca subas archivos .env
- Contienen contraseñas, API keys, tokens
- Usa `.env.example` para mostrar qué variables se necesitan

### 3. **IDE y Editores** (Archivos de Configuración Local)

```
.vscode/
.idea/
*.swp
*.swo
*~
*.sublime-project
*.sublime-workspace
```

- Cada desarrollador usa su propio editor/IDE
- No necesita los archivos de configuración de otros
- Evita conflictos en git

### 4. **Testing** (Reportes de Pruebas)

```
test-results/
playwright-report/
*.log
```

- Los reportes se generan localmente
- Cada máquina genera sus propios reportes
- No son necesarios en el repositorio

### 5. **Build** (Archivos Compilados)

```
dist/
build/
```

- Generados automáticamente por build tools
- Se pueden regenerar en cualquier momento

### 6. **Sistema Operativo** (Archivos del SO)

```
Thumbs.db
.DS_Store
```

- `Thumbs.db` - Windows (caché de imágenes)
- `.DS_Store` - macOS (metadata de carpetas)

### 7. **Archivos Temporales** (Temporal Files)

```
*.tmp
*.temp
*.bak
.cache/
```

- Archivos creados durante desarrollo
- No tienen valor en el repositorio

### 8. **Playwright** (Test Framework)

```
.playwright/
playwright-report/
test-results/
```

- Reportes de ejecución de tests
- Se regeneran cada vez que ejecutas tests

### 9. **Config Sensible** (Archivos Locales)

```
config.js
config.local.js
```

- **NOTA:** En este proyecto, `config.js` es compartido
- Si contiene secrets, crear `.env` en su lugar

---

## ✅ VERIFICAR QUÉ SE IGNORA

```bash
# Ver archivos que git está ignorando
git check-ignore -v *

# Ver archivos que serían ignorados
git ls-files --others --ignored --exclude-standard
```

---

## ⚠️ ARCHIVOS QUE SÍ DEBEN SUBIRSE

```
✅ frontend/
✅ config/
✅ *.html
✅ *.js
✅ *.css
✅ *.json (package.json, playwright.config.js)
✅ *.md (documentación)
✅ .gitignore (este archivo)
✅ .git/ (repositorio)
```

---

## 🔐 SEGURIDAD

### Nunca comitas:

- ❌ `.env` con contraseñas
- ❌ `config.js` con API keys
- ❌ Credenciales de Supabase
- ❌ Tokens de acceso
- ❌ Información sensible

### En su lugar:

- ✅ Crear `.env.example` con variables sin valores
- ✅ Documenta qué variables se necesitan
- ✅ Usa `.env` localmente
- ✅ CI/CD carga variables desde env variables del servidor

---

## 📚 EJEMPLO: .env.example

```bash
# .env.example (SUBIR ESTO, NO .env)

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

# Environment
NODE_ENV=development

# API endpoints
API_BASE_URL=http://localhost:3000
```

---

## 🚀 PARA TU PROYECTO

El `.gitignore` actual está configurado para:

✅ Ignorar `node_modules/` (dependencias)
✅ Ignorar archivos IDE (`.vscode/`, `.idea/`)
✅ Ignorar reportes de tests
✅ Ignorar archivos temporales
✅ Ignorar variables de entorno sensibles

---

## 💡 TIPS

### Si accidentalmente subiste un archivo que debería ignorarse:

```bash
# Remover del repositorio (sin borrar local)
git rm --cached nombre-archivo

# Agregar a .gitignore
echo "nombre-archivo" >> .gitignore

# Hacer commit
git commit -m "Remover archivo que debería estar ignorado"
```

### Si quieres ver todos los archivos en el próximo commit:

```bash
git status
git diff --cached
```

### Para listar archivos ignorados:

```bash
git ls-files --others --ignored --exclude-standard
```

---

## 📌 RESUMEN

- **`.gitignore`** especifica qué NO subir
- **5 archivos ignorados:** node_modules, .env, .vscode, test-results, .DS_Store
- **58 líneas** en total
- **Última actualización:** 12 Nov 2025
- **Status:** ✅ LISTO

---

Ahora cuando hagas `git push`, estos archivos no se subirán a GitHub. ✨

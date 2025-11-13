# 📋 Guía de Deployment - Ranking Depósitos

## 📌 Resumen de Ramas

| Rama          | Propósito                             | Estado            |
| ------------- | ------------------------------------- | ----------------- |
| `development` | Desarrollo activo con logs            | 🔧 En desarrollo  |
| `production`  | Código limpio lista para producción   | ✅ Lista          |
| `main`        | Rama principal (sin usar actualmente) | ❌ Desactualizada |

## 🚀 Proceso de Deployment

### Opción 1: Desde Development a Production

```bash
# 1. Estar en la rama de desarrollo
git checkout development

# 2. Asegurar que todos los cambios estén commiteados
git status

# 3. Cambiar a rama de producción
git checkout production

# 4. Hacer merge de development
git merge development

# 5. Verificar los cambios
git log --oneline -5

# 6. Push a remoto
git push origin production
```

### Opción 2: Deployment directo desde Production

```bash
# 1. Cambiar a rama de producción
git checkout production

# 2. Hacer pull de cambios remotos
git pull origin production

# 3. Verificar que está limpia (sin logs)
grep -r "console.log" frontend/js/*.js

# 4. Desplegar (según tu infraestructura)
# Ejemplos:
# - Copiar archivos a servidor web
# - Push a hosting (Vercel, Netlify, etc.)
# - Ejecutar CI/CD pipeline
```

## ✅ Checklist Pre-Deployment

- [ ] **Rama correcta**: Estoy en `production`
- [ ] **Sin logs**: Verificar con `grep "console.log"`
- [ ] **Build**: Sin errores de compilación
- [ ] **Config**: `config/config.js` tiene credenciales correctas
- [ ] **Traducciones**: Todos los idiomas funcionan
- [ ] **Área**: Se muestra correctamente desde BD
- [ ] **Responsive**: Probado en móvil y desktop
- [ ] **Performance**: No hay slowdowns detectados

## 🔍 Testing Post-Deployment

```bash
# 1. Verificar que la aplicación está running
# Abrir en navegador: https://tu-dominio.com

# 2. Testing funcional
# - Login con usuario Líder
# - Login con usuario Admin Área
# - Login con usuario Super
# - Cambiar idioma (ES, EN, PT)
# - Crear/editar/eliminar registros

# 3. Verificar consola del navegador
# - No debe haber errores rojos
# - No debe haber console.log
# - Verificar Network tab para errores 404/500
```

## 📊 Comparación Development vs Production

### Development

```bash
git checkout development
# Tiene: console.log(), console.error(), debugging logs
# Útil para: Desarrollo, bugfixing, testing
```

### Production

```bash
git checkout production
# NO tiene: console.log, debugging innecesario
# Útil para: Deploy a usuarios finales
# Verificar: grep -r "console.log" frontend/
```

## 🔄 Workflow Recomendado

### Para desarrollo

```bash
git checkout development
# Trabajar en features/bugs
git add .
git commit -m "descripción"
git push origin development
```

### Para producción

```bash
git checkout development
git pull origin development

# Cuando esté listo para producción
git checkout production
git merge development
git push origin production

# Luego desplegar a servidor
```

## 🛡️ Rollback en Producción

Si algo falla en producción:

```bash
# 1. Ver historial
git log --oneline -10

# 2. Revertir al commit anterior
git revert HEAD

# o volver a un commit específico
git reset --hard 6db3ac7

# 3. Push del cambio
git push origin production --force
```

## 📦 Archivos Importantes

```
ranking-depositos/
├── PRODUCTION.md          ← Documentación de producción
├── config/config.js       ← ⚠️ CAMBIAR CREDENCIALES
├── frontend/
│   ├── index.html         ← Login
│   ├── js/
│   │   ├── i18n.js        ← Sistema de traducciones
│   │   ├── dashboard-lider.js
│   │   ├── dashboard-admin-area.js
│   │   └── dashboard-super.js
│   ├── pages/
│   │   ├── dashboard-lider.html
│   │   ├── dashboard-admin-area.html
│   │   └── dashboard-super.html
│   ├── css/
│   │   ├── styles.css
│   │   └── tv-ranking.css
│   └── js/
│       └── tv-ranking.js
└── RLS*.sql               ← Políticas de Supabase
```

## 🔐 Configuración de Producción

Asegurar que `config/config.js` tiene:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co", // ← CAMBIAR
  anonKey: "TU-ANON-KEY", // ← CAMBIAR
};
```

## 📈 Monitoreo

Implementar en producción:

- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Uptime monitoring
- [ ] Performance monitoring

## 📞 Soporte

En caso de problemas:

1. **Revisar logs**: Consola del navegador (F12)
2. **Revisar base de datos**: Supabase dashboard
3. **Revisar tabla usuarios**: Verificar roles y áreas
4. **Limpiar cache**: Ctrl+Shift+Delete

---

**Última actualización:** 13 de noviembre de 2025  
**Estado:** ✅ Listo para producción

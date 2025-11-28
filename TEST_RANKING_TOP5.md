# Test de ranking-top5.html

## Estado Actual ✅

El archivo `frontend/pages/ranking-top5.html` ha sido actualizado con:

### 1. **Filtros Dinámicos por Área** ✅

- Botones ocultos por defecto con `style="display:none"`
- Solo se muestra el botón del área del admin que abre la página
- Lógica en `DOMContentLoaded`:
  ```javascript
  if (areaActual === "recovery") {
    document.getElementById("btnRecovery").style.display = "inline-block";
    metricaActual = "recovery";
  } else if (areaActual === "conversion") {
    document.getElementById("btnConversion").style.display = "inline-block";
    metricaActual = "conversion";
  } else if (areaActual === "retencion") {
    document.getElementById("btnRetencion").style.display = "inline-block";
    metricaActual = "retencion";
  }
  ```

### 2. **Carga de Datos Mejorada** ✅

- Error handling con destructuración: `{ data, error }`
- Logs detallados con emojis:
  - 🚀 Inicializando
  - 👤 Usuario
  - 🔍 Buscando datos
  - ✅ Datos encontrados
  - ❌ Errores
- Validación de null/undefined

### 3. **Acceso Controlado** ✅

- `cambiarMetrica()` valida que la métrica sea del área del admin
- Previene acceso a áreas no autorizadas
- Logs de intentos no autorizados

### 4. **Console Logs para Debug**

```
🚀 Inicializando Ranking Top 5...
👤 Usuario: [nombre] Área: [area]
📍 Área: [area]
🔍 Buscando agentes del área: [area]
✅ Agentes encontrados: [n]
🔍 Buscando depósitos: {tipo, mes, anio}
✅ Depósitos encontrados: [n]
🏆 Top 5: [n]
👥 Líderes cargados: [n]
❌ Error: [mensaje]
```

## Próximos Pasos de Prueba

### 1. **Test en Navegador** 🧪

```bash
1. Abrir DevTools (F12)
2. Ir a Console
3. Abrir ranking-top5.html como admin de un área
4. Verificar logs en orden
5. Revisar si aparece el TOP 5
```

### 2. **Checklist de Validación**

- [ ] Usuario se carga correctamente desde localStorage
- [ ] Solo muestra botón del área correspondiente
- [ ] Los datos se cargan desde Supabase
- [ ] Aparecen máximo 5 agentes
- [ ] Los gradientes de color son correctos
- [ ] Las medallas (🥇🥈🥉4️⃣5️⃣) se muestran
- [ ] La hora se actualiza cada segundo
- [ ] El botón "Volver" regresa al dashboard

### 3. **Si No Cargan Datos**

1. Revisar Console para el error exacto
2. Verificar en Supabase:
   - Tabla `agentes`: ¿existen registros con el área?
   - Tabla `depositos`: ¿existen registros para este mes/año?
   - RLS policies: ¿permiten lectura?
3. Comparar con `tv-ranking.html` (que funciona)
4. Verificar `config.local.js` cargue correctamente

### 4. **Datos de Prueba Recomendados**

```javascript
// Para testing en Console:
currentUser = {
  id: "user-id",
  nombre: "Admin Test",
  rol: "admin_area",
  area: "recovery",
};
localStorage.setItem("user", JSON.stringify(currentUser));
location.reload();
```

## Resumen de Cambios

- ✅ Líneas 374-381: Filter buttons ocultos + IDs
- ✅ Líneas 407-467: DOMContentLoaded reescrito con área-checks
- ✅ Líneas 468-526: cargarRanking() mejorado con error handling
- ✅ Líneas 557-568: cambiarMetrica() con validación de acceso

## Archivos Relacionados

- `frontend/js/dashboard-admin-area.js` - Llama a abrirRankingTop5()
- `frontend/js/tv-ranking.js` - Referencia de implementación funcional
- `frontend/pages/dashboard-admin-area.html` - Botón para abrir

---

**Fecha de actualización**: 28 Nov 2025
**Estado**: Listo para testing en navegador

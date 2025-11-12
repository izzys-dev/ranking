# 🌍 Implementación de i18n en la App

## Estado Actual

✅ **Archivos creados:**

- `frontend/js/i18n.js` - Sistema dinámico
- `frontend/js/translations.json` - Diccionario (ES/EN/PT)
- `GUIA_I18N.md` - Documentación completa
- `frontend/index.html` - **YA ACTUALIZADO** con i18n

---

## 🚀 Próximos Pasos para Completar

### 1. Actualizar `frontend/pages/dashboard-lider.html`

Reemplaza los textos en el HTML con atributos `data-i18n`:

```html
<!-- CAMBIOS NECESARIOS -->

<!-- Cambiar esto: -->
<h1>👥 Panel de Líder</h1>
<!-- Por esto: -->
<h1 data-i18n="dashboard.lider"></h1>

<!-- Cambiar esto: -->
<button class="btn-tv" onclick="abrirRankingTV()">📺 Mostrar Ranking</button>
<!-- Por esto: -->
<button
  class="btn-tv"
  onclick="abrirRankingTV()"
  data-i18n="dashboard.show_ranking"
></button>

<!-- Cambiar esto: -->
<button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
<!-- Por esto: -->
<button
  class="btn-logout"
  onclick="logout()"
  data-i18n="dashboard.logout"
></button>

<!-- Cambiar esto: -->
<h2>Mis Agentes</h2>
<!-- Por esto: -->
<h2 data-i18n="dashboard.my_agents"></h2>

<!-- Cambiar esto: -->
<button class="btn-add" onclick="openModal()">+ Agregar Agente</button>
<!-- Por esto: -->
<button
  class="btn-add"
  onclick="openModal()"
  data-i18n="dashboard.add_agent"
></button>

<!-- Y TODOS LOS OTROS BOTONES Y TEXTOS... -->
```

**Atributos específicos para inputs y placeholders:**

```html
<!-- Para placeholders -->
<input data-i18n-placeholder="form.name" />

<!-- Para labels -->
<label data-i18n-label="form.name"></label>

<!-- Para títulos en modales -->
<h3 data-i18n="deposits.title"></h3>
```

### 2. Actualizar `frontend/pages/dashboard-admin-area.html`

Mismo proceso que dashboard-lider:

- Reemplaza títulos
- Reemplaza botones
- Reemplaza labels
- Reemplaza placeholders

**Ejemplos de cambios:**

```html
<h1>⚡ Panel Administrador de Área</h1>
<!-- Cambiar a: -->
<h1 data-i18n="dashboard.admin_area"></h1>

<h2>Todos los Agentes del Área</h2>
<!-- Cambiar a: -->
<h2 data-i18n="dashboard.all_agents"></h2>
```

### 3. Actualizar `frontend/pages/dashboard-super.html`

Similar a los anteriores:

```html
<h1>👑 Panel de Super Usuario</h1>
<!-- Cambiar a: -->
<h1 data-i18n="dashboard.super"></h1>

<h2>Gestión de Usuarios</h2>
<!-- Cambiar a: -->
<h2 data-i18n="users.title"></h2>
```

### 4. Añadir i18n.js en los scripts de cada dashboard

En cada archivo HTML (después de config.js y antes del script principal):

```html
<script src="../../config/config.js"></script>
<script src="../js/i18n.js"></script>        <!-- ← AGREGAR ESTA LÍNEA
<script src="../js/dashboard-lider.js"></script>
```

---

## 📝 Traduciones Disponibles

### Áreas traducidas en `translations.json`:

```
✅ app.*              - Título y subtitle
✅ login.*            - Email, contraseña, submit
✅ dashboard.*        - Todos los paneles
✅ form.*             - Formularios (botones, labels)
✅ deposits.*         - Sección de depósitos
✅ registers.*        - Sección de registros/leads
✅ targets.*          - Targets/metas
✅ ranking.*          - Rankings
✅ users.*            - Gestión de usuarios
✅ areas.*            - Nombres de áreas
✅ messages.*         - Mensajes de error/éxito
```

---

## 💡 Uso en JavaScript

Cuando necesites mostrar mensajes traducidos dinámicamente:

```javascript
// En login.js
if (error || !data) {
  errorMessage.textContent = window.i18n.t("login.error");
  errorMessage.style.display = "block";
  return;
}

// En dashboard-lider.js
alert(window.i18n.t("messages.success"));

// Para confirmaciones
if (confirm(window.i18n.t("messages.confirm_delete"))) {
  // eliminar
}
```

---

## 🎯 Checklist de Implementación

### Para `dashboard-lider.html`:

- [ ] Reemplazar `<h1>👥 Panel de Líder</h1>` → `data-i18n="dashboard.lider"`
- [ ] Reemplazar todos los botones de acción
- [ ] Reemplazar labels de inputs
- [ ] Reemplazar placeholders
- [ ] Reemplazar títulos de modales
- [ ] Añadir `<script src="../js/i18n.js"></script>`

### Para `dashboard-admin-area.html`:

- [ ] Reemplazar `<h1>⚡ Panel Administrador de Área</h1>` → `data-i18n="dashboard.admin_area"`
- [ ] Reemplazar todos los textos
- [ ] Añadir script i18n.js

### Para `dashboard-super.html`:

- [ ] Reemplazar `<h1>👑 Panel de Super Usuario</h1>` → `data-i18n="dashboard.super"`
- [ ] Reemplazar títulos y botones
- [ ] Añadir script i18n.js

### En JavaScript:

- [ ] Cambiar `alert()` por `window.i18n.t('message.key')`
- [ ] Cambiar mensajes de error
- [ ] Cambiar confirmaciones

---

## 🧪 Cómo Probar

1. **Login a la app:**

   - Deberías ver selector de idiomas en la esquina superior derecha
   - Prueba cambiar idiomas
   - Los textos deben cambiar sin recargar la página

2. **Verificar persistencia:**

   - Cambia a inglés
   - Recarga la página (F5)
   - Debería mantener el idioma inglés

3. **Probar en cada dashboard:**
   - Login como admin_area
   - Cambia idiomas
   - Todos los textos deben traducirse

---

## 📊 Estructura de Ejemplo

Aquí está cómo debería verse un HTML completamente traducido:

```html
<div class="dashboard">
  <div class="header">
    <div>
      <h1 data-i18n="dashboard.lider"></h1>
      <p id="welcomeText" style="color: #64748b; margin-top: 5px;"></p>
      <div id="areaBadge" class="area-badge"></div>
    </div>
    <div style="display: flex; gap: 10px;">
      <button
        class="btn-tv"
        onclick="abrirRankingTV()"
        data-i18n="dashboard.show_ranking"
      ></button>
      <button
        class="btn-logout"
        onclick="logout()"
        data-i18n="dashboard.logout"
      ></button>
    </div>
  </div>

  <div class="card">
    <h2 data-i18n="dashboard.my_agents"></h2>
    <div class="mes-actual" id="mesActual"></div>
    <button
      class="btn-add"
      onclick="openModal()"
      data-i18n="dashboard.add_agent"
    ></button>

    <div id="agentesContainer">
      <div class="empty-state" data-i18n="dashboard.loading"></div>
    </div>
  </div>
</div>

<!-- Modal ejemplo -->
<div id="agenteModal" class="modal">
  <div class="modal-content">
    <h3 id="modalTitle" data-i18n="dashboard.add_agent"></h3>
    <form id="agenteForm">
      <div class="form-group">
        <label data-i18n-label="form.name"></label>
        <input
          type="text"
          id="agenteNombre"
          required
          data-i18n-placeholder="form.name"
        />
      </div>

      <div style="margin-top: 20px;">
        <button
          type="button"
          class="btn-cancel"
          onclick="closeModal()"
          data-i18n="form.cancel"
        ></button>
        <button
          type="submit"
          class="btn-primary"
          data-i18n="form.save"
        ></button>
      </div>
    </form>
  </div>
</div>
```

---

## 🚀 Comandos Útiles

```bash
# Ver qué archivos faltan actualizar
git status

# Hacer commit después de actualizar HTML
git add frontend/pages/*.html
git commit -m "🌍 Traducir HTML dashboards con i18n"

# Ver cambios
git diff frontend/pages/dashboard-lider.html
```

---

## ⚠️ Notas Importantes

1. **Orden de scripts:** i18n.js debe cargarse ANTES de login.js/dashboard-\*.js
2. **Atributos correctos:**

   - `data-i18n` = para textContent
   - `data-i18n-placeholder` = para input placeholders
   - `data-i18n-label` = para labels
   - `data-i18n-title` = para title attribute

3. **Claves inexistentes:** Si una clave no existe, retorna la clave misma
4. **localStorage:** El idioma se guarda automáticamente
5. **Sin recargar página:** Los cambios de idioma se aplican dinámicamente

---

## 📚 Referencia Rápida

```javascript
// Obtener una traducción
window.i18n.t("dashboard.welcome");

// Cambiar idioma
window.i18n.setLanguage("en");

// Obtener idioma actual
window.i18n.getLanguage();

// Escuchar cambios
window.addEventListener("languageChanged", (e) => {
  console.log("Nuevo idioma:", e.detail.language);
});
```

---

**¿Necesitas ayuda?** Consulta `GUIA_I18N.md` para más detalles.

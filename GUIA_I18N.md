# 📚 Guía del Sistema i18n (Internacionalización)

## ¿Qué es i18n?

Sistema dinámico para traducir la aplicación entre idiomas (Español, Inglés, Portugués) **sin recargar la página**.

---

## 📦 Archivos Incluidos

### 1. **frontend/js/i18n.js**
- Clase `I18n` que maneja toda la traducción
- Métodos principales:
  - `t(key)` - Obtiene traducción
  - `setLanguage(language)` - Cambia idioma
  - `translatePage()` - Traduce toda la página

### 2. **frontend/js/translations.json**
- Diccionario con traducciones en 3 idiomas
- Estructura: `{ idioma: { seccion: { clave: "valor" } } }`
- Idiomas soportados:
  - `es` - Español
  - `en` - Inglés
  - `pt` - Portugués

---

## 🚀 Cómo Usar

### Paso 1: Incluir i18n en tu HTML

```html
<!-- ANTES del script principal -->
<script src="../js/i18n.js"></script>

<!-- DESPUÉS, tu script principal -->
<script src="../js/login.js"></script>
```

**Orden correcto:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../../config/config.js"></script>
<script src="../js/i18n.js"></script>    <!-- ← PRIMERO i18n
<script src="../js/login.js"></script>   <!-- ← LUEGO tu script
```

---

### Paso 2: Marcar Elementos HTML

Usa el atributo `data-i18n` con la clave de traducción:

#### **Para texto normal (textContent)**
```html
<!-- ANTES -->
<label for="email">Email</label>

<!-- DESPUÉS -->
<label for="email" data-i18n="login.email"></label>
```

#### **Para placeholders**
```html
<!-- ANTES -->
<input placeholder="tu@email.com">

<!-- DESPUÉS -->
<input data-i18n-placeholder="login.placeholder_email">
```

#### **Para atributos (title, aria-label, etc)**
```html
<!-- Para title -->
<button data-i18n-title="form.delete"></button>

<!-- Para label -->
<label data-i18n-label="form.name"></label>
```

---

### Paso 3: Usar en JavaScript

```javascript
// Obtener traducción
const mensaje = window.i18n.t('messages.success');
console.log(mensaje); // "Operación completada con éxito"

// En error messages
errorMessage.textContent = window.i18n.t('messages.error');

// Mostrar en alert
alert(window.i18n.t('messages.confirm_delete'));
```

---

## 📋 Estructura de Traducciones

```json
{
  "es": {
    "login": {
      "email": "Email",
      "password": "Contraseña",
      "submit": "Iniciar Sesión"
    },
    "dashboard": {
      "welcome": "Bienvenido"
    }
  },
  "en": {
    "login": {
      "email": "Email",
      "password": "Password",
      "submit": "Sign In"
    },
    "dashboard": {
      "welcome": "Welcome"
    }
  }
}
```

**Convención de nombres:**
- `login.email` - Email en login
- `dashboard.welcome` - Bienvenida en dashboard
- `form.cancel` - Botón cancelar en formularios
- `messages.success` - Mensaje de éxito

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Traducir un Formulario

```html
<form>
  <div class="form-group">
    <label data-i18n-label="form.name"></label>
    <input type="text" data-i18n-placeholder="form.name">
  </div>
  
  <div class="form-group">
    <label data-i18n-label="login.email"></label>
    <input type="email" data-i18n-placeholder="login.placeholder_email">
  </div>
  
  <button type="submit" data-i18n="form.save"></button>
  <button type="button" data-i18n="form.cancel"></button>
</form>
```

### Ejemplo 2: Traducir Dinámicamente en JavaScript

```javascript
// Login con mensaje traducido
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        // ... lógica de login ...
        alert(window.i18n.t('messages.success'));
    } catch (error) {
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.textContent = window.i18n.t('login.error');
        errorMsg.style.display = 'block';
    }
}
```

### Ejemplo 3: Traducir un Modal

```html
<div id="confirmModal" class="modal">
  <div class="modal-content">
    <h3 data-i18n="deposits.edit_deposit"></h3>
    <p data-i18n="deposits.confirm_delete"></p>
    
    <button data-i18n="form.cancel" onclick="closeModal()"></button>
    <button data-i18n="form.save" onclick="confirmar()"></button>
  </div>
</div>
```

---

## 🔄 Cambiar Idioma en Tiempo Real

El sistema incluye un **selector automático de idiomas** que se añade al header.

```
🇪🇸 Español | 🇺🇸 English | 🇧🇷 Português
```

Cuando cambias de idioma:
1. Se guarda en `localStorage`
2. Se traduce toda la página **sin recargar**
3. Se mantiene al actualizar la página

---

## 🛠️ Funciones Disponibles

### `window.i18n.t(key, lang?)`
Obtiene traducción de una clave

```javascript
window.i18n.t('login.email')              // "Email" (idioma actual)
window.i18n.t('login.email', 'en')        // "Email" (en inglés)
window.i18n.t('login.email', 'pt')        // "Email" (en portugués)
```

### `window.i18n.setLanguage(language)`
Cambia el idioma actual

```javascript
window.i18n.setLanguage('es')  // Español
window.i18n.setLanguage('en')  // Inglés
window.i18n.setLanguage('pt')  // Portugués
```

### `window.i18n.getLanguage()`
Obtiene idioma actual

```javascript
const current = window.i18n.getLanguage();  // 'es'
```

### `window.i18n.getAvailableLanguages()`
Obtiene idiomas soportados

```javascript
const langs = window.i18n.getAvailableLanguages();  // ['es', 'en', 'pt']
```

---

## 📍 Evento de Cambio de Idioma

```javascript
// Escuchar cuando cambia el idioma
window.addEventListener('languageChanged', (event) => {
    console.log('Idioma cambiado a:', event.detail.language);
    
    // Aquí puedes hacer acciones adicionales
    // Por ejemplo, recargar datos con nuevas traducciones
});
```

---

## ✅ Checklist: Traducir una Página

1. **Agregar i18n.js:**
   ```html
   <script src="../js/i18n.js"></script>
   ```

2. **Marcar todos los textos:**
   ```html
   <h1 data-i18n="dashboard.welcome"></h1>
   <input data-i18n-placeholder="form.name">
   <button data-i18n="form.save"></button>
   ```

3. **Añadir traducciones en translations.json:**
   ```json
   "es": { "dashboard": { "welcome": "Bienvenido" } }
   "en": { "dashboard": { "welcome": "Welcome" } }
   "pt": { "dashboard": { "welcome": "Bem-vindo" } }
   ```

4. **Usar en JavaScript cuando sea necesario:**
   ```javascript
   const mensaje = window.i18n.t('messages.success');
   ```

---

## 🐛 Troubleshooting

### "La traducción no aparece"
✓ Verifica que `data-i18n` tenga la clave correcta  
✓ Comprueba que exista en `translations.json`  
✓ Asegúrate de que i18n.js se cargue ANTES de otros scripts

### "El selector de idiomas no aparece"
✓ Verifica que existe un elemento con clase `.header`  
✓ Abre la consola para ver errores

### "Cambiar idioma no actualiza la página"
✓ Asegúrate de que los elementos tengan `data-i18n-*`  
✓ Los elementos creados dinámicamente necesitan `i18n.translatePage()` después

---

## 🔧 Añadir Más Idiomas

1. Abre `translations.json`
2. Copia la sección de un idioma (ej: inglés)
3. Cambia la clave (ej: `"fr"` para francés)
4. Traduce todos los valores
5. En `i18n.js`, actualiza `getAvailableLanguages()`:

```javascript
getAvailableLanguages() {
    return ['es', 'en', 'pt', 'fr'];  // ← Añadir 'fr'
}
```

---

## 📝 Notas Importantes

- **localStorage**: Guarda el idioma seleccionado
- **Selector automático**: Se crea dinámicamente en el header
- **Fallback**: Si no encuentra traducción, retorna la clave
- **Performance**: Las traducciones se cargan una sola vez
- **Dinámico**: Todos los cambios sin recargar página

---

## 🎓 Próximos Pasos

1. Actualiza todos los HTML con `data-i18n`
2. Añade más traducciones según necesites
3. Prueba cambiar entre idiomas
4. Comparte el idioma del usuario en toda la app

¡Listo! Tu app ahora es multiidioma. 🌍

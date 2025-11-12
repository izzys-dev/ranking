# 🧪 MANUAL DE PRUEBAS - RANKING DEPOSITOS

**URL de la aplicación:** http://127.0.0.1:5500/frontend/index.html

---

## 🔐 **SECCIÓN 1: PRUEBAS DE LOGIN**

### TEST 1: Login Super Usuario (izzysolutions.tics@gmail.com)

**Pasos:**

1. Abre http://127.0.0.1:5500/frontend/index.html
2. Ingresa Email: `izzysolutions.tics@gmail.com`
3. Ingresa Password: `Sagsilver94@`
4. Haz clic en "Iniciar Sesión"

**Verificar:**

- [ ] Se redirige a `dashboard-super.html`
- [ ] Muestra "Bienvenido, [nombre del usuario]"
- [ ] Aparece la estadística de agentes totales, líderes, depósitos e ingreso

**Resultado:** ✅ / ❌

---

### TEST 2: Login Super Usuario (admin@admin.com)

**Pasos:**

1. Vuelve a http://127.0.0.1:5500/frontend/index.html
2. Ingresa Email: `admin@admin.com`
3. Ingresa Password: `admin@2026`
4. Haz clic en "Iniciar Sesión"

**Verificar:**

- [ ] Se redirige a `dashboard-super.html`
- [ ] Aparecen los controles de administración

**Resultado:** ✅ / ❌

---

### TEST 3: Login Admin Recovery

**Pasos:**

1. Vuelve a http://127.0.0.1:5500/frontend/index.html
2. Ingresa Email: `admin.recovery@mail.com`
3. Ingresa Password: `123456`
4. Haz clic en "Iniciar Sesión"

**Verificar:**

- [ ] Se redirige a `dashboard-admin-area.html`
- [ ] Muestra "Área: Recovery" en el badge

**Resultado:** ✅ / ❌

---

### TEST 4: Login Admin Conversion

**Pasos:**

1. Vuelve a http://127.0.0.1:5500/frontend/index.html
2. Ingresa Email: `admin.conversion@mail.com`
3. Ingresa Password: `123456`
4. Haz clic en "Iniciar Sesión"

**Verificar:**

- [ ] Se redirige a `dashboard-admin-area.html`
- [ ] Muestra "Área: Conversion" en el badge
- [ ] Aparece botón "📝 Registro Rápido"

**Resultado:** ✅ / ❌

---

### TEST 5: Login Admin Retencion

**Pasos:**

1. Vuelve a http://127.0.0.1:5500/frontend/index.html
2. Ingresa Email: `admin.retencion@mail.com`
3. Ingresa Password: `123456`
4. Haz clic en "Iniciar Sesión"

**Verificar:**

- [ ] Se redirige a `dashboard-admin-area.html`
- [ ] Muestra "Área: Retencion" en el badge

**Resultado:** ✅ / ❌

---

## 💰 **SECCIÓN 2: PRUEBAS DE DEPÓSITOS (DASHBOARD-LIDER)**

### TEST 6: CRUD Depósitos en Dashboard-Lider

**Requisito previo:** Necesitas conocer un usuario LIDER existente en la base de datos.

**Pasos A - AGREGAR DEPÓSITO:**

1. Haz login con un usuario LIDER
2. En la tabla, encuentra un agente y haz clic en el botón "Depósitos" (💰)
3. En el modal que aparece, haz clic en "Agregar Depósito"
4. Completa los campos:
   - Monto: `500.00`
   - Fecha: (selecciona una fecha del mes actual)
5. Haz clic en "Agregar"

**Verificar:**

- [ ] Aparece mensaje de éxito "Depósito agregado exitosamente ✅"
- [ ] El depósito aparece en la lista
- [ ] El total se actualiza correctamente

**Resultado:** ✅ / ❌

---

**Pasos B - EDITAR DEPÓSITO:**

1. En la lista de depósitos, haz clic en el botón "Editar" del depósito que acabas de crear
2. Modifica los valores:
   - Nuevo Monto: `750.00`
   - Nueva Fecha: (cambia la fecha)
3. Haz clic en "Guardar"

**Verificar:**

- [ ] Aparece mensaje "Depósito actualizado exitosamente ✅"
- [ ] Los nuevos valores aparecen en la lista
- [ ] El total se actualiza

**Resultado:** ✅ / ❌

---

**Pasos C - ELIMINAR DEPÓSITO:**

1. Haz clic en el botón "Eliminar" (🗑️) del depósito
2. Confirma la eliminación en el diálogo

**Verificar:**

- [ ] El depósito se elimina de la lista
- [ ] Aparece mensaje de éxito
- [ ] El total se actualiza

**Resultado:** ✅ / ❌

---

## 💰 **SECCIÓN 3: PRUEBAS DE DEPÓSITOS (DASHBOARD-ADMIN-AREA)**

### TEST 7: CRUD Depósitos en Dashboard-Admin-Area

**Pasos A - AGREGAR DEPÓSITO:**

1. Haz login con `admin.conversion@mail.com` / `123456`
2. En la tabla, encuentra un agente y haz clic en "💰 Depósitos"
3. Si aparece el modal, haz clic en "Agregar Depósito"
4. Completa:
   - Monto: `1000.00`
   - Fecha: (selecciona una fecha)
5. Haz clic en "Agregar"

**Verificar:**

- [ ] Aparece mensaje de éxito
- [ ] El depósito aparece en la lista
- [ ] El total se actualiza

**Resultado:** ✅ / ❌

---

**Pasos B - EDITAR DEPÓSITO:**

1. Haz clic en "Editar" del depósito creado
2. Modifica el monto a `1500.00`
3. Haz clic en "Guardar"

**Verificar:**

- [ ] Se actualiza correctamente
- [ ] Aparece mensaje de éxito

**Resultado:** ✅ / ❌

---

**Pasos C - ELIMINAR DEPÓSITO:**

1. Haz clic en "Eliminar" (🗑️)
2. Confirma la eliminación

**Verificar:**

- [ ] Se elimina correctamente

**Resultado:** ✅ / ❌

---

## 🔧 **SECCIÓN 4: OTROS BOTONES Y FUNCIONALIDADES**

### TEST 8: Botones Principales

**TEST 8A - Botón de Logout:**

1. En cualquier dashboard, haz clic en "Cerrar Sesión"

**Verificar:**

- [ ] Se redirige a la página de login
- [ ] El localStorage se limpia (si abres las DevTools)

**Resultado:** ✅ / ❌

---

**TEST 8B - Botón "Mostrar Ranking" (📺):**

1. En dashboard-super o admin-area, haz clic en "📺 Mostrar Ranking"

**Verificar:**

- [ ] Se abre una nueva ventana/pestaña
- [ ] Muestra el ranking TV

**Resultado:** ✅ / ❌

---

**TEST 8C - Botón "🎯 Target":**

1. En dashboard-lider o admin-area, haz clic en "🎯 Target" de un agente

**Verificar:**

- [ ] Se abre un modal
- [ ] Puedes ingresar target de cantidad y monto
- [ ] Se guarda correctamente

**Resultado:** ✅ / ❌

---

## 📝 **RESUMEN FINAL**

Completa este formulario al final:

| Test                | Resultado | Observaciones |
| ------------------- | --------- | ------------- |
| 1. Super Usuario 1  | ✅/❌     |               |
| 2. Super Usuario 2  | ✅/❌     |               |
| 3. Admin Recovery   | ✅/❌     |               |
| 4. Admin Conversion | ✅/❌     |               |
| 5. Admin Retencion  | ✅/❌     |               |
| 6. CRUD Lider       | ✅/❌     |               |
| 7. CRUD Admin-Area  | ✅/❌     |               |
| 8. Otros Botones    | ✅/❌     |               |

---

**Total de Pruebas:** 8
**Pruebas Exitosas:** **_
**Pruebas Fallidas:** _**

# 🔒 ERROR RLS: Row-Level Security Policy Violation

## ❌ PROBLEMA

```
Error: new row violates row-level security policy for table "registros"
Code: 42501
```

---

## 🔍 ¿QUÉ SIGNIFICA?

Supabase está **rechazando la inserción** en la tabla `registros` porque:

1. **RLS está habilitado** en esa tabla
2. **Las políticas RLS** no permiten que el usuario actual inserte datos
3. El usuario no cumple los requisitos de la política

---

## 🛠️ SOLUCIONES

### OPCIÓN 1: Desactivar RLS (RÁPIDO - Solo desarrollo)

**En Supabase Dashboard:**
1. Ve a: **SQL Editor**
2. Ejecuta:
```sql
-- Desactivar RLS en la tabla registros
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
```

3. O también puedes:
   - Ir a **Tables > registros > Authentication**
   - Desactiva **Enable RLS**

---

### OPCIÓN 2: Crear política RLS permisiva (CORRECTO)

**En Supabase SQL Editor**, ejecuta:

```sql
-- Permitir que usuarios autenticados inserten en registros
CREATE POLICY "registros_insert_policy"
ON registros
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que usuarios lean sus propios registros
CREATE POLICY "registros_select_policy"
ON registros
FOR SELECT
USING (auth.uid() = user_id);

-- Permitir que usuarios actualicen sus propios registros
CREATE POLICY "registros_update_policy"
ON registros
FOR UPDATE
USING (auth.uid() = user_id);
```

---

### OPCIÓN 3: Política RLS por rol

**Si tu tabla tiene relación con agentes/áreas:**

```sql
-- Para administradores (super, admin_area)
CREATE POLICY "admin_all_registros"
ON registros
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.rol IN ('super', 'admin_area')
  )
);

-- Para líderes (pueden ver sus agentes)
CREATE POLICY "lider_registros"
ON registros
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid() 
    AND u.rol = 'lider'
    AND EXISTS (
      SELECT 1 FROM agentes a
      WHERE a.id = registros.agente_id
      AND a.lider_id = u.id
    )
  )
);
```

---

## 📋 PASOS PARA VERIFICAR Y ARREGLAR

### Paso 1: Ver estado actual de RLS

```sql
-- Ver qué tablas tienen RLS activado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE rowsecurity = true
ORDER BY tablename;
```

### Paso 2: Ver políticas actuales

```sql
-- Ver todas las políticas de registros
SELECT * FROM pg_policies WHERE tablename = 'registros';
```

### Paso 3: Eliminar políticas problemáticas

```sql
-- Si hay políticas que te causan problemas, elimínalas
DROP POLICY IF EXISTS "nombre_politica" ON registros;
```

### Paso 4: Crear nuevas políticas

```sql
-- Opción más permisiva (desarrollo)
CREATE POLICY "registros_all"
ON registros
FOR ALL
USING (true)
WITH CHECK (true);

-- O más restrictiva (producción)
CREATE POLICY "registros_usuarios_autenticados"
ON registros
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 🎯 RECOMENDACIÓN PARA TU PROYECTO

### Basado en tu estructura (super, admin_area, lider):

```sql
-- 1. Desactivar RLS si está en desarrollo
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;

-- O si quieres mantener RLS:

-- 2. Crear política permisiva para inserción
CREATE POLICY "insert_registros"
ON registros
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Crear política para lectura
CREATE POLICY "select_registros"  
ON registros
FOR SELECT
USING (true);

-- 4. Crear política para actualización
CREATE POLICY "update_registros"
ON registros
FOR UPDATE
USING (true);
```

---

## 🔧 DÓNDE IR EN SUPABASE

### Dashboard > SQL Editor

1. Copia una de las soluciones arriba
2. Pega en el editor
3. Click en "Run"
4. Verifica que no haya errores

### O en Supabase Dashboard:

1. **Authentication > Policies**
2. Selecciona tabla: **registros**
3. Crea/edita políticas
4. Define permisos por rol

---

## ✅ VERIFICAR QUE FUNCIONA

```sql
-- Después de aplicar cambios, intenta:
INSERT INTO registros (agente_id, fecha, monto, tipo)
VALUES (1, NOW(), 500, 'conversion');

-- Si no da error, ¡está arreglado!
```

---

## 📌 RESUMEN RÁPIDO

| Solución | Ventaja | Desventaja | Usar cuando... |
|----------|---------|-----------|----------------|
| **Desactivar RLS** | Rápido, fácil | Menos seguro | En desarrollo local |
| **Política permisiva** | Simple | Poco control | Prototipado rápido |
| **Política restrictiva** | Seguro | Más complejo | Producción |
| **Política por rol** | Mejor seguridad | Muy específico | Sistema de roles |

---

## 🚨 IMPORTANTE

- **NUNCA** desactives RLS en producción sin políticas
- **SIEMPRE** prueba después de cambiar RLS
- **DOCUMENTA** qué políticas usas y por qué
- **REVISA** permisos si añades nuevos usuarios

---

**¿Cuál solución prefieres aplicar?**

1. ✅ Desactivar RLS (rápido para desarrollo)
2. ✅ Crear política permisiva (simple)
3. ✅ Crear política por rol (seguro)

Dime y te doy los comandos exactos.

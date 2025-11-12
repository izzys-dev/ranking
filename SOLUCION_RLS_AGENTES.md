# 🔒 ERROR RLS: Tabla "agentes" - Violación de política

## ❌ PROBLEMA

```
Error Code: 42501
Tabla: agentes
Mensaje: "new row violates row-level security policy for table "agentes""
```

**Significado:** Supabase rechaza la inserción en `agentes` por políticas RLS.

---

## 🔍 ANÁLISIS

Basado en tu estructura de roles (super, admin_area, lider), el problema es que:

1. **RLS está habilitado** en tabla `agentes`
2. **Las políticas actuales** no permiten INSERT
3. Tu usuario no cumple los requisitos

---

## ✅ SOLUCIÓN RÁPIDA (Recomendada para desarrollo)

### En Supabase SQL Editor, ejecuta:

```sql
-- Desactivar RLS en tabla agentes
ALTER TABLE agentes DISABLE ROW LEVEL SECURITY;
```

**O si quieres mantener RLS pero permitir operaciones:**

```sql
-- Crear política para INSERT
CREATE POLICY "agentes_insert"
ON agentes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Crear política para SELECT
CREATE POLICY "agentes_select"
ON agentes
FOR SELECT
USING (true);

-- Crear política para UPDATE
CREATE POLICY "agentes_update"
ON agentes
FOR UPDATE
USING (true);

-- Crear política para DELETE
CREATE POLICY "agentes_delete"
ON agentes
FOR DELETE
USING (true);
```

---

## 🔐 SOLUCIÓN SEGURA (Para producción con roles)

```sql
-- Permitir que SUPER usuarios hagan todo
CREATE POLICY "super_agentes_all"
ON agentes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'super'
  )
);

-- Permitir que ADMIN_AREA administren sus agentes
CREATE POLICY "admin_agentes_area"
ON agentes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid()
    AND u.rol = 'admin_area'
    AND u.area = agentes.area
  )
);

-- Permitir que LIDER lean sus agentes
CREATE POLICY "lider_agentes_read"
ON agentes
FOR SELECT
USING (
  agentes.lider_id = auth.uid()
);
```

---

## 📋 VERIFICACIÓN

Después de aplicar cambios, verifica que funciona:

```sql
-- Test de INSERT
INSERT INTO agentes (nombre, area, lider_id, activo)
VALUES ('Test Agent', 'conversion', 'some-uuid', true);

-- Si no da error RLS, ¡está arreglado!
```

---

## 🛠️ TABLAS AFECTADAS

Probablemente **TODAS** las tablas principales tienen RLS:

```
❌ registros   - Error RLS
❌ agentes     - Error RLS (actual)
❌ depositos   - Posiblemente
❌ targets_mensuales - Posiblemente
❌ usuarios    - Posiblemente
```

**Solución rápida para todas:**

```sql
-- Desactivar RLS en todas las tablas (SOLO DESARROLLO)
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE agentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE depositos DISABLE ROW LEVEL SECURITY;
ALTER TABLE targets_mensuales DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
```

---

## 🚀 RECOMENDACIÓN

### Para DESARROLLO inmediato:

Ejecuta esto en Supabase SQL Editor:

```sql
-- Desactivar RLS temporalmente en todas las tablas
BEGIN;
ALTER TABLE IF EXISTS registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS depositos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS targets_mensuales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
COMMIT;
```

**Esto permitirá que tu aplicación funcione sin errores RLS.**

---

## ⚠️ IMPORTANTE

- ⚠️ **Solo para desarrollo** desactiver RLS
- ✅ **En producción** debes configurar políticas correctamente
- 🔐 **Nunca** dejes RLS desactivado en datos sensibles
- 📝 **Documenta** qué políticas usas

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecuta el comando** en Supabase SQL Editor
2. **Prueba tu aplicación**
3. **Verifica que funcione** sin errores RLS
4. **Luego** configuraremos políticas adecuadas para producción

---

**¿Quieres que:**

1. ✅ Te dé el comando exacto para copiar-pegar
2. ✅ Te ayude a configurar políticas seguras
3. ✅ Ambas cosas

**Responde para continuar.** 🚀

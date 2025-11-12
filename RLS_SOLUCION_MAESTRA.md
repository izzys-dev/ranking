# 🔒 SOLUCIÓN MAESTRA: Errores RLS en Supabase

## 🎯 RESUMEN RÁPIDO

**Problema:** RLS (Row-Level Security) bloqueando inserciones en múltiples tablas.

**Solución recomendada:** Desactivar RLS temporalmente para desarrollo.

```sql
-- Copia y ejecuta esto en Supabase SQL Editor
BEGIN;
ALTER TABLE IF EXISTS registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS depositos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS targets_mensuales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
COMMIT;
```

**Listo. Tu aplicación debería funcionar ahora.** ✅

---

## 📋 TABLAS AFECTADAS

| Tabla             | Error                    | Solución    |
| ----------------- | ------------------------ | ----------- |
| registros         | ❌ RLS bloqueando INSERT | DISABLE RLS |
| agentes           | ❌ RLS bloqueando INSERT | DISABLE RLS |
| depositos         | ❓ Posiblemente          | DISABLE RLS |
| targets_mensuales | ❓ Posiblemente          | DISABLE RLS |
| usuarios          | ❓ Posiblemente          | DISABLE RLS |

---

## 🚀 PASOS PARA ARREGLARLO

### Paso 1: Ir a Supabase Dashboard

1. Abre: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a: **SQL Editor**

### Paso 2: Copiar el comando

```sql
BEGIN;
ALTER TABLE IF EXISTS registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS depositos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS targets_mensuales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
COMMIT;
```

### Paso 3: Ejecutar

1. Pega en el editor SQL
2. Click en **Run** (botón verde)
3. Espera a que complete

### Paso 4: Verificar

```sql
-- Ver qué tablas tienen RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('registros', 'agentes', 'depositos', 'targets_mensuales', 'usuarios')
ORDER BY tablename;
```

Deberías ver todos `rowsecurity = false`

---

## ✅ VERIFICAR QUE FUNCIONA

En tu navegador, intenta:

1. Agregar un agente ✅
2. Agregar un registro ✅
3. Agregar un depósito ✅

Si **no hay errores RLS**, ¡está resuelto! 🎉

---

## 🔐 DESPUÉS (Para producción)

Una vez que todo funcione, deberías configurar políticas seguras:

```sql
-- Políticas para SUPER usuarios
CREATE POLICY "super_usuarios_all"
ON registros FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'super'
  )
);

-- Similar para otras tablas...
```

Pero **por ahora, desactiva RLS y enfócate en hacer funcionar la app.**

---

## 📌 RESUMEN

```
❌ ANTES: RLS activo → Errores 42501
✅ DESPUÉS: RLS desactivo → Todo funciona

Cuando estés en producción:
✅ Reactiva RLS
✅ Configura políticas seguras
✅ Prueba exhaustivamente
```

---

**¿Ejecutaste los comandos? Responde sí cuando lo hayas hecho y continuamos.** 🚀

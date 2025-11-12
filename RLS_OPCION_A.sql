-- ============================================
-- OPCIÓN A: RLS BÁSICO (SIN RIESGO)
-- ============================================
-- Copia y pega TODO esto en Supabase SQL Editor
-- Click en "Run" y listo
-- ============================================

-- Paso 1: Habilitar RLS en todas las tablas
-- NOTA: ranking_conversion, ranking_recovery, ranking_retencion son VISTAS (views)
-- Las vistas heredan el RLS de sus tablas base automáticamente
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets_mensuales ENABLE ROW LEVEL SECURITY;

-- Paso 2: Crear políticas básicas (todos ven todo, pero con RLS habilitado)
-- Tabla: usuarios
CREATE POLICY "usuarios_select_all"
  ON usuarios
  FOR SELECT
  USING (true);

-- Tabla: agentes
CREATE POLICY "agentes_select_all"
  ON agentes
  FOR SELECT
  USING (true);

-- Tabla: depositos
CREATE POLICY "depositos_select_all"
  ON depositos
  FOR SELECT
  USING (true);

-- Tabla: registros
CREATE POLICY "registros_select_all"
  ON registros
  FOR SELECT
  USING (true);

-- Tabla: targets_mensuales
CREATE POLICY "targets_select_all"
  ON targets_mensuales
  FOR SELECT
  USING (true);

-- NOTA: Las vistas (ranking_conversion, ranking_recovery, ranking_retencion)
-- NO necesitan políticas RLS propias. Heredan el RLS de sus tablas base.
-- Si alguna vista usa agentes o depositos, automáticamente filtrará según su RLS.

-- ============================================
-- Verificación: Ejecuta esto después para confirmar
-- ============================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Deberías ver rowsecurity = true en todas las tablas
-- ============================================

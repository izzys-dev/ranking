-- ============================================
-- ROW-LEVEL SECURITY (RLS) PARA RANKING DEPOSITOS
-- ============================================
-- Este script activa RLS en todas las tablas y crea políticas de seguridad
-- IMPORTANTE: Ejecutar TODO de una vez o en orden

-- ============================================
-- 1. TABLA USUARIOS - RLS
-- ============================================
-- Los usuarios solo ven sus propios datos

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Super usuario ve todos
CREATE POLICY "super_usuarios_ven_todos"
  ON usuarios
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid) = 'super'
  );

-- Política: Otros usuarios ven solo sus datos
CREATE POLICY "usuarios_ven_sus_datos"
  ON usuarios
  FOR SELECT
  USING (id = current_setting('app.current_user_id')::uuid);

-- ============================================
-- 2. TABLA AGENTES - RLS
-- ============================================
-- Los líderes/admins ven solo agentes de su área
-- El super usuario ve todos

ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;

-- Política: Super usuario ve todos los agentes
CREATE POLICY "super_ve_todos_agentes"
  ON agentes
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid) = 'super'
  );

-- Política: Admin de área ve agentes de su área
CREATE POLICY "admin_area_ve_agentes_su_area"
  ON agentes
  FOR SELECT
  USING (
    area = (SELECT area FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid)
  );

-- Política: Líder ve agentes asignados
CREATE POLICY "lider_ve_sus_agentes"
  ON agentes
  FOR SELECT
  USING (
    lider_id = current_setting('app.current_user_id')::uuid
  );

-- ============================================
-- 3. TABLA DEPOSITOS - RLS
-- ============================================
-- Los usuarios ven depósitos de agentes que le pertenecen
-- El super usuario ve todos

ALTER TABLE depositos ENABLE ROW LEVEL SECURITY;

-- Política: Super usuario ve todos los depósitos
CREATE POLICY "super_ve_todos_depositos"
  ON depositos
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid) = 'super'
  );

-- Política: Admin de área ve depósitos de agentes de su área
CREATE POLICY "admin_area_ve_depositos_su_area"
  ON depositos
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE area = (SELECT area FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid)
    )
  );

-- Política: Líder ve depósitos de sus agentes
CREATE POLICY "lider_ve_depositos_sus_agentes"
  ON depositos
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE lider_id = current_setting('app.current_user_id')::uuid
    )
  );

-- ============================================
-- 4. TABLA REGISTROS - RLS
-- ============================================
-- Los usuarios ven registros de agentes que le pertenecen
-- El super usuario ve todos

ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política: Super usuario ve todos los registros
CREATE POLICY "super_ve_todos_registros"
  ON registros
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid) = 'super'
  );

-- Política: Admin de área ve registros de agentes de su área
CREATE POLICY "admin_area_ve_registros_su_area"
  ON registros
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE area = (SELECT area FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid)
    )
  );

-- Política: Líder ve registros de sus agentes
CREATE POLICY "lider_ve_registros_sus_agentes"
  ON registros
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE lider_id = current_setting('app.current_user_id')::uuid
    )
  );

-- ============================================
-- 5. TABLA TARGETS_MENSUALES - RLS
-- ============================================
-- Los usuarios ven targets de agentes que le pertenecen
-- El super usuario ve todos

ALTER TABLE targets_mensuales ENABLE ROW LEVEL SECURITY;

-- Política: Super usuario ve todos los targets
CREATE POLICY "super_ve_todos_targets"
  ON targets_mensuales
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid) = 'super'
  );

-- Política: Admin de área ve targets de agentes de su área
CREATE POLICY "admin_area_ve_targets_su_area"
  ON targets_mensuales
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE area = (SELECT area FROM usuarios WHERE id = current_setting('app.current_user_id')::uuid)
    )
  );

-- Política: Líder ve targets de sus agentes
CREATE POLICY "lider_ve_targets_sus_agentes"
  ON targets_mensuales
  FOR SELECT
  USING (
    agente_id IN (
      SELECT id FROM agentes 
      WHERE lider_id = current_setting('app.current_user_id')::uuid
    )
  );

-- ============================================
-- 6. TABLAS DE RANKING - RLS
-- ============================================
-- Las tablas de ranking son vistas/análisis, dar acceso a todos

ALTER TABLE ranking_conversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_retencion ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los rankings (son públicos dentro de la app)
CREATE POLICY "todos_ven_ranking_conversion"
  ON ranking_conversion
  FOR SELECT
  USING (true);

CREATE POLICY "todos_ven_ranking_recovery"
  ON ranking_recovery
  FOR SELECT
  USING (true);

CREATE POLICY "todos_ven_ranking_retencion"
  ON ranking_retencion
  FOR SELECT
  USING (true);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Este RLS usa current_setting('app.current_user_id') para identificar al usuario
-- 2. Necesitas ACTUALIZAR tu frontend para establecer este setting DESPUÉS del login
-- 3. Ver archivo: FRONTEND_UPDATE_FOR_RLS.md para los cambios necesarios

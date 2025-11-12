-- ============================================
-- ACTUALIZACIÓN PARA LOGIN.JS
-- ============================================
-- Después de hacer login, necesitas establecer el user_id en la sesión de Supabase

-- CAMBIO NECESARIO EN: frontend/js/login.js

-- LÍNEA ~47 (donde guardas el usuario en localStorage)
-- REEMPLAZA:
/*
localStorage.setItem('user', JSON.stringify(data));
*/

-- CON ESTO:
/*
// Guardar usuario en localStorage (sin sensibilidad)
localStorage.setItem('userId', data.id);
localStorage.setItem('userRole', data.rol);
localStorage.setItem('userArea', data.area);

// ⭐ IMPORTANTE: Establecer user_id en Supabase para RLS
supabaseClient.rpc('set_claim', {
    claim: 'user_id',
    value: data.id
});
*/

-- ============================================
-- ACTUALIZACIÓN PARA LOS DASHBOARDS
-- ============================================
-- En dashboard-super.js, dashboard-lider.js, dashboard-admin-area.js

-- CAMBIO 1: En verificarAcceso(), después de cargar el usuario:
/*
async function verificarAcceso() {
    try {
        // ... código existente ...
        
        // ⭐ NUEVO: Establecer user_id en Supabase DESPUÉS de cargar usuario
        const userId = localStorage.getItem('userId');
        if (userId) {
            await supabaseClient.rpc('set_claim', {
                claim: 'user_id', 
                value: userId
            });
        }
        
        return currentUser;
    } catch (error) {
        window.location.href = '../index.html';
    }
}
*/

-- CAMBIO 2: En DOMContentLoaded, DESPUÉS de verificarAcceso():
/*
window.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    // Establecer user_id primero
    const userId = localStorage.getItem('userId');
    if (userId) {
        await supabaseClient.rpc('set_claim', {
            claim: 'user_id',
            value: userId
        });
    }
    
    // Luego hacer las consultas
    await verificarAcceso();
    // ... resto del código ...
});
*/

-- ============================================
-- OPCIÓN ALTERNATIVA (SIN CAMBIAR FRONTEND)
-- ============================================
-- Si no quieres cambiar el frontend, puedes usar una función SQL que establezca el user_id automáticamente
-- Pero esto requiere crear una función personalizada en Supabase

-- En Supabase SQL Editor, crear esta función:
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Luego reemplazar en RLS_POLICIES.sql todas las referencias a:
-- current_setting('app.current_user_id')::uuid
-- CON:
-- get_current_user_id()

-- ============================================
-- ALTERNATIVA MÁS SIMPLE: Sin RLS por ahora
-- ============================================
-- Si quieres implementar RLS gradualmente, puedes:
-- 1. Crear las políticas RLS
-- 2. Pero NO habilitarlas en todas las tablas al mismo tiempo
-- 3. Habilitar una tabla a la vez (ej: usuarios primero)
-- 4. Probar en frontend
-- 5. Si funciona, habilitar la siguiente tabla

-- PASOS:
-- 1. Ejecuta SOLO estos comandos primero:
--    ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
--    (el resto de políticas sin habilitar aún)
-- 2. Prueba en frontend
-- 3. Si funciona, ejecuta:
--    ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
-- 4. Prueba nuevamente
-- 5. Continúa con las demás tablas

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que RLS está habilitado:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Debería mostrar:
-- usuarios       | true
-- agentes        | true
-- depositos      | true
-- registros      | true
-- targets_mensuales | true
-- ranking_*      | true

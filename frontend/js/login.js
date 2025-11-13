const { createClient } = supabase;
let supabaseClient;

window.addEventListener('DOMContentLoaded', () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    // Limpiar cualquier sesión anterior
    localStorage.removeItem('user');
    
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.style.display = 'none';
    
    console.log('Intentando login con:', email);
    
    try {
        // Buscar usuario
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        console.log('Respuesta de Supabase:', { data, error });
        
        if (error || !data) {
            errorMessage.textContent = window.i18n ? window.i18n.t('login.error') : 'Email o contraseña incorrectos';
            errorMessage.style.display = 'block';
            return;
        }
        
        // IMPORTANTE: Guardar usuario en localStorage ANTES de redirigir
        localStorage.setItem('user', JSON.stringify(data));
        console.log('Usuario guardado en localStorage:', data);
        
        // Redirigir según el rol
        if (data.rol === 'super') {
            console.log('Redirigiendo a dashboard-super...');
            window.location.href = window.PATHS.dashboard.super;
        } else if (data.rol === 'admin_area') {
            console.log('Redirigiendo a dashboard-admin-area...');
            window.location.href = window.PATHS.dashboard.adminArea;
        } else if (data.rol === 'lider') {
            console.log('Redirigiendo a dashboard-lider...');
            window.location.href = window.PATHS.dashboard.lider;
        } else {
            errorMessage.textContent = 'Rol de usuario no válido';
            errorMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        errorMessage.textContent = 'Error al iniciar sesión. Intenta de nuevo.';
        errorMessage.style.display = 'block';
    }
}

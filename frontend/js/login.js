const { createClient } = supabase;
let supabaseClient;

window.addEventListener('DOMContentLoaded', () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
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
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .eq('activo', true)
            .single();
        
        console.log('Respuesta de Supabase:', { data, error });
        
        if (error || !data) {
            errorMessage.textContent = i18n.t('login_error');
            errorMessage.style.display = 'block';
            return;
        }
        
        localStorage.setItem('user', JSON.stringify(data));
        console.log('Usuario guardado en localStorage:', data);
        
        if (data.rol === 'super') {
            console.log('Redirigiendo a dashboard-super...');
            window.location.href = 'pages/dashboard-super.html';
        } else if (data.rol === 'admin_area') {
            console.log('Redirigiendo a dashboard-admin-area...');
            window.location.href = 'pages/dashboard-admin-area.html';
        } else if (data.rol === 'lider') {
            console.log('Redirigiendo a dashboard-lider...');
            window.location.href = 'pages/dashboard-lider.html';
        } else {
            errorMessage.textContent = 'Invalid user role';
            errorMessage.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        errorMessage.textContent = i18n.t('error_loading');
        errorMessage.style.display = 'block';
    }
}
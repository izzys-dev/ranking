/**
 * Script para detectar y configurar rutas según el contexto de deployment
 * Soporta:
 * - Localhost (http://localhost:3000/)
 * - Netlify (https://app.netlify.com/)
 * - GitHub Pages raíz (https://usuario.github.io/)
 * - GitHub Pages subcarpeta (https://usuario.github.io/ranking/)
 */

(function() {
    // Detectar base URL
    const currentUrl = window.location.href;
    const pathName = window.location.pathname;
    
    let basePath = '/';
    
    // Detectar si estamos en GitHub Pages subcarpeta
    if (currentUrl.includes('github.io/ranking') || pathName.includes('/ranking/')) {
        basePath = '/ranking/';
    }
    // Si está en otro origen (Netlify, dominio propio, etc.), usar raíz
    else if (!currentUrl.includes('localhost') && !currentUrl.includes('127.0.0.1')) {
        basePath = '/';
    }
    
    // Crear objeto global con las rutas
    window.PATHS = {
        base: basePath,
        config: basePath + 'config/',
        frontend: basePath + 'frontend/',
        js: basePath + 'frontend/js/',
        css: basePath + 'frontend/css/',
        pages: basePath + 'frontend/pages/',
        
        // Métodos auxiliares
        resolveUrl: function(path) {
            // Si el path ya comienza con /, quitar el / y agregar basePath
            if (path.startsWith('/')) {
                path = path.substring(1);
            }
            return basePath + path;
        },
        
        // Rutas de página
        dashboard: {
            lider: basePath + 'frontend/pages/dashboard-lider.html',
            adminArea: basePath + 'frontend/pages/dashboard-admin-area.html',
            super: basePath + 'frontend/pages/dashboard-super.html'
        },
        
        // Rutas de recursos
        resources: {
            configJs: basePath + 'config/config.js',
            configLocal: basePath + 'config/config.local.js',
            i18n: basePath + 'frontend/js/i18n.js',
            index: basePath + 'index.html'
        }
    };
    
    console.log('🌐 Detección de rutas:', {
        baseUrl: currentUrl,
        pathName: pathName,
        basePath: basePath,
        isGitHubPages: currentUrl.includes('github.io'),
        isGitHubPagesSubfolder: currentUrl.includes('github.io/ranking')
    });
})();

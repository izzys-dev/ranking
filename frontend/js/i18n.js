/**
 * Sistema de Internacionalización (i18n) Dinámico
 * Permite traducir la aplicación en tiempo real
 */

class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('appLanguage') || 'es';
        this.translations = {};
        this.initializeLanguageSelector();
    }

    /**
     * Cargar traducciones desde archivo JSON
     */
    async loadTranslations() {
        try {
            // Detectar la ruta correcta según dónde se ejecute
            const currentPath = window.location.pathname;
            const isInPages = currentPath.includes('/pages/');
            const translationsPath = isInPages 
                ? '../js/translations.json' 
                : 'frontend/js/translations.json';
            
            const response = await fetch(translationsPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('✅ Traducciones cargadas correctamente:', Object.keys(this.translations));
        } catch (error) {
            console.error('❌ Error cargando traducciones:', error);
            console.warn('Usando traducciones vacías como fallback');
            // Fallback a traducciones vacías
            this.translations = { es: {}, en: {}, pt: {} };
        }
    }

    /**
     * Obtener traducción de una clave
     * @param {string} key - Clave de la traducción (ej: "login.email")
     * @param {string} lang - Idioma (opcional, usa el actual)
     * @returns {string} Texto traducido
     */
    t(key, lang = null) {
        const language = lang || this.currentLanguage;
        const keys = key.split('.');
        let value = this.translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Retorna la clave si no encuentra la traducción
            }
        }

        return value || key;
    }

    /**
     * Cambiar idioma actual
     * @param {string} language - Código del idioma (es, en, pt)
     */
    async setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('appLanguage', language);
        
        // Actualizar atributo lang del HTML
        document.documentElement.lang = language;
        
        // Traducir toda la página
        await this.translatePage();
        
        // Notificar cambio
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }

    /**
     * Traducir todos los elementos de la página
     */
    async translatePage() {
        // Elementos con atributo data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const attr = el.getAttribute('data-i18n-attr') || 'textContent';
            el[attr] = this.t(key);
        });

        // Placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Titles
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });

        // Labels (para elementos label asociados)
        const labels = document.querySelectorAll('[data-i18n-label]');
        labels.forEach(el => {
            const key = el.getAttribute('data-i18n-label');
            el.textContent = this.t(key);
        });
    }

    /**
     * Crear y insertar selector de idiomas
     */
    initializeLanguageSelector() {
        // Ya no lo hacemos aquí, se hará en el HTML específico
        console.log('i18n inicializado con idioma:', this.currentLanguage);
    }

    /**
     * Obtener idioma actual
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Obtener lista de idiomas disponibles
     */
    getAvailableLanguages() {
        return ['es', 'en', 'pt'];
    }
}

// Instancia global
window.i18n = new I18n();

// Cargar traducciones al inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.loadTranslations();
    await window.i18n.translatePage();
});

// Sistema de internacionalización (i18n)
const translations = {
    es: {
        // Login
        login_title: "Sistema de Ranking",
        login_subtitle: "Accede con tu correo electrónico",
        email: "Email",
        password: "Contraseña",
        login_button: "Iniciar Sesión",
        login_error: "Email o contraseña incorrectos",
        
        // Roles
        role_super: "Super Usuario",
        role_admin_area: "Admin de Área",
        role_leader: "Líder",
        
        // Super Dashboard
        super_panel: "Panel de Super Usuario",
        welcome: "Bienvenido",
        user_management: "Gestión de Usuarios",
        add_leader: "Agregar Líder",
        add_admin_area: "Agregar Admin de Área",
        view_all_rankings: "Ver Todos los Rankings",
        logout: "Cerrar Sesión",
        
        // Areas
        area_conversion: "Conversión",
        area_retention: "Retención",
        area_recovery: "Recovery",
        area: "Área",
        
        // Tables
        name: "Nombre",
        email_label: "Email",
        role: "Rol",
        actions: "Acciones",
        edit: "Editar",
        delete: "Eliminar",
        view_agents: "Ver Agentes",
        
        // Modals
        add_user: "Agregar Usuario",
        edit_user: "Editar Usuario",
        add_leader_title: "Agregar Líder",
        edit_leader_title: "Editar Líder",
        add_admin_title: "Agregar Administrador de Área",
        edit_admin_title: "Editar Administrador de Área",
        full_name: "Nombre completo",
        select_area: "-- Selecciona un área --",
        cancel: "Cancelar",
        save: "Guardar",
        close: "Cerrar",
        
        // Leader Dashboard
        leader_panel: "Panel de Líder",
        area_admin_panel: "Panel Administrador de Área",
        my_agents: "Mis Agentes",
        all_area_agents: "Todos los Agentes del Área",
        add_agent: "Agregar Agente",
        quick_deposit: "Depósito Rápido",
        quick_registration: "Registro Rápido",
        show_ranking: "Mostrar Ranking",
        
        // Agent Management
        agent: "Agente",
        leader: "Líder",
        target: "Target",
        assign_target: "Asignar Target",
        deposits: "Depósitos",
        registrations: "Registros",
        assign_to_leader: "Asignar a Líder",
        select_leader: "-- Selecciona un líder --",
        
        // Stats
        total_agents: "Total Agentes",
        active_leaders: "Líderes Activos",
        monthly_deposits: "Depósitos del Mes",
        total_income: "Total Ingresado",
        
        // Ranking
        ranking_title: "RANKING",
        ranking_conversion: "RANKING CONVERSIÓN",
        ranking_retention: "RANKING RETENCIÓN",
        ranking_recovery: "RANKING RECOVERY",
        position: "Posición",
        current: "Actual",
        progress: "Progreso",
        compliance: "% Cumplimiento",
        last_update: "Última actualización",
        live: "EN VIVO",
        current_date: "Fecha y Hora",
        current_month: "Mes Actual",
        
        // Notifications
        new_deposit: "¡NUEVO DEPÓSITO!",
        new_registration: "¡NUEVO REGISTRO!",
        lead: "Lead",
        
        // Months
        january: "Enero",
        february: "Febrero",
        march: "Marzo",
        april: "Abril",
        may: "Mayo",
        june: "Junio",
        july: "Julio",
        august: "Agosto",
        september: "Septiembre",
        october: "Octubre",
        november: "Noviembre",
        december: "Diciembre",
        
        // Days
        monday: "lunes",
        tuesday: "martes",
        wednesday: "miércoles",
        thursday: "jueves",
        friday: "viernes",
        saturday: "sábado",
        sunday: "domingo",
        
        // Messages
        no_agents: "No hay agentes en esta área",
        loading: "Cargando",
        error_loading: "Error al cargar",
        confirm_delete: "¿Estás seguro de eliminar",
        confirm_delete_agent: "¿Estás seguro de eliminar al agente",
        confirm_delete_user: "¿Estás seguro de eliminar al",
        created_successfully: "creado exitosamente",
        updated_successfully: "actualizado exitosamente",
        deleted_successfully: "eliminado exitosamente",
        user_created: "Usuario creado exitosamente",
        user_updated: "Usuario actualizado exitosamente",
        user_deleted: "Usuario eliminado exitosamente",
        agent_created: "Agente creado exitosamente",
        agent_updated: "Agente actualizado exitosamente",
        agent_deleted: "Agente eliminado exitosamente",
        email_exists: "El email ya existe",
        
        // Empty states
        no_users: "No hay usuarios registrados. Crea el primero.",
        no_leaders: "No hay líderes en esta área",
        no_agents_assigned: "No hay agentes asignados",
        no_agents_create: "No hay agentes en esta área. Crea el primero.",
        
        // Rankings modal
        rankings_by_area: "Rankings por Área",
        agents_of: "Agentes de",
        leader_text: "Líder",
        admin_text: "Administrador"
    },
    
    en: {
        // Login
        login_title: "Ranking System",
        login_subtitle: "Login with your email",
        email: "Email",
        password: "Password",
        login_button: "Sign In",
        login_error: "Incorrect email or password",
        
        // Roles
        role_super: "Super User",
        role_admin_area: "Area Admin",
        role_leader: "Leader",
        
        // Super Dashboard
        super_panel: "Super User Panel",
        welcome: "Welcome",
        user_management: "User Management",
        add_leader: "Add Leader",
        add_admin_area: "Add Area Admin",
        view_all_rankings: "View All Rankings",
        logout: "Logout",
        
        // Areas
        area_conversion: "Conversion",
        area_retention: "Retention",
        area_recovery: "Recovery",
        area: "Area",
        
        // Tables
        name: "Name",
        email_label: "Email",
        role: "Role",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        view_agents: "View Agents",
        
        // Modals
        add_user: "Add User",
        edit_user: "Edit User",
        add_leader_title: "Add Leader",
        edit_leader_title: "Edit Leader",
        add_admin_title: "Add Area Administrator",
        edit_admin_title: "Edit Area Administrator",
        full_name: "Full name",
        select_area: "-- Select an area --",
        cancel: "Cancel",
        save: "Save",
        close: "Close",
        
        // Leader Dashboard
        leader_panel: "Leader Panel",
        area_admin_panel: "Area Administrator Panel",
        my_agents: "My Agents",
        all_area_agents: "All Area Agents",
        add_agent: "Add Agent",
        quick_deposit: "Quick Deposit",
        quick_registration: "Quick Registration",
        show_ranking: "Show Ranking",
        
        // Agent Management
        agent: "Agent",
        leader: "Leader",
        target: "Target",
        assign_target: "Assign Target",
        deposits: "Deposits",
        registrations: "Registrations",
        assign_to_leader: "Assign to Leader",
        select_leader: "-- Select a leader --",
        
        // Stats
        total_agents: "Total Agents",
        active_leaders: "Active Leaders",
        monthly_deposits: "Monthly Deposits",
        total_income: "Total Income",
        
        // Ranking
        ranking_title: "RANKING",
        ranking_conversion: "CONVERSION RANKING",
        ranking_retention: "RETENTION RANKING",
        ranking_recovery: "RECOVERY RANKING",
        position: "Position",
        current: "Current",
        progress: "Progress",
        compliance: "% Compliance",
        last_update: "Last update",
        live: "LIVE",
        current_date: "Date and Time",
        current_month: "Current Month",
        
        // Notifications
        new_deposit: "NEW DEPOSIT!",
        new_registration: "NEW REGISTRATION!",
        lead: "Lead",
        
        // Months
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
        
        // Days
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        
        // Messages
        no_agents: "No agents in this area",
        loading: "Loading",
        error_loading: "Error loading",
        confirm_delete: "Are you sure you want to delete",
        confirm_delete_agent: "Are you sure you want to delete agent",
        confirm_delete_user: "Are you sure you want to delete",
        created_successfully: "created successfully",
        updated_successfully: "updated successfully",
        deleted_successfully: "deleted successfully",
        user_created: "User created successfully",
        user_updated: "User updated successfully",
        user_deleted: "User deleted successfully",
        agent_created: "Agent created successfully",
        agent_updated: "Agent updated successfully",
        agent_deleted: "Agent deleted successfully",
        email_exists: "Email already exists",
        
        // Empty states
        no_users: "No registered users. Create the first one.",
        no_leaders: "No leaders in this area",
        no_agents_assigned: "No agents assigned",
        no_agents_create: "No agents in this area. Create the first one.",
        
        // Rankings modal
        rankings_by_area: "Rankings by Area",
        agents_of: "Agents of",
        leader_text: "Leader",
        admin_text: "Administrator"
    }
};

// Configuración del idioma
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'es';
    }
    
    t(key) {
        return translations[this.currentLanguage][key] || key;
    }
    
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            window.location.reload();
        }
    }
    
    getLanguage() {
        return this.currentLanguage;
    }
    
    getMonths() {
        return [
            this.t('january'),
            this.t('february'),
            this.t('march'),
            this.t('april'),
            this.t('may'),
            this.t('june'),
            this.t('july'),
            this.t('august'),
            this.t('september'),
            this.t('october'),
            this.t('november'),
            this.t('december')
        ];
    }
    
    getDays() {
        return [
            this.t('sunday'),
            this.t('monday'),
            this.t('tuesday'),
            this.t('wednesday'),
            this.t('thursday'),
            this.t('friday'),
            this.t('saturday')
        ];
    }
    
    formatDate(date) {
        const days = this.getDays();
        const months = this.getMonths();
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        if (this.currentLanguage === 'es') {
            return `${dayName}, ${day} de ${month} de ${year}, ${hours}:${minutes}:${seconds}`;
        } else {
            return `${dayName}, ${month} ${day}, ${year}, ${hours}:${minutes}:${seconds}`;
        }
    }
}

const i18n = new I18n();
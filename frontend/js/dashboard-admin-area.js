const { createClient } = supabase;
let supabaseClient;
let currentUser;
let mesActual, anioActual;
let editingAgenteId = null;

window.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    await verificarAcceso();
    configurarMesActual();
    await cargarEstadisticas();
    await cargarAgentes();
    await cargarLideresEnSelect();
});

async function verificarAcceso() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    if (currentUser.rol !== 'admin_area') {
        alert('No tienes acceso a esta página');
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('welcomeText').textContent = `Bienvenido, ${currentUser.nombre}`;
    
    const areaBadge = document.getElementById('areaBadge');
    const areaTexto = currentUser.area.charAt(0).toUpperCase() + currentUser.area.slice(1);
    areaBadge.textContent = `Área: ${areaTexto}`;
    areaBadge.className = `area-badge area-${currentUser.area}`;
    
    // Mostrar botón de registro rápido solo para conversión
    if (currentUser.area === 'conversion') {
        document.getElementById('btnRegistroRapido').style.display = 'inline-block';
    }
}

function configurarMesActual() {
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = `${meses[mesActual - 1]} ${anioActual}`;
}

async function cargarEstadisticas() {
    try {
        // Cargar todos los agentes del área
        const { data: agentes } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true);
        
        // Cargar depósitos
        const { data: depositos } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        const depositosArea = depositos?.filter(d => 
            agentes?.some(a => a.id === d.agente_id)
        ) || [];
        
        const totalDepositos = depositosArea.reduce((sum, d) => sum + parseFloat(d.monto), 0);
        const cantidadDepositos = depositosArea.length;
        
        // Cargar líderes del área
        const { data: lideres } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('rol', 'lider')
            .eq('area', currentUser.area)
            .eq('activo', true);
        
        let html = `
            <div class="stat-card">
                <h3>Total Agentes</h3>
                <div class="value">${agentes?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Líderes Activos</h3>
                <div class="value">${lideres?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Depósitos del Mes</h3>
                <div class="value">${cantidadDepositos}</div>
            </div>
            <div class="stat-card">
                <h3>Total Ingresado</h3>
                <div class="value">$${totalDepositos.toFixed(0)}</div>
            </div>
        `;
        
        document.getElementById('statsGrid').innerHTML = html;
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarLideresEnSelect() {
    try {
        const { data: lideres } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('rol', 'lider')
            .eq('area', currentUser.area)
            .eq('activo', true)
            .order('nombre');
        
        const select = document.getElementById('liderSelect');
        select.innerHTML = '<option value="">-- Selecciona un líder --</option>';
        
        lideres?.forEach(lider => {
            const option = document.createElement('option');
            option.value = lider.id;
            option.textContent = lider.nombre;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error al cargar líderes:', error);
    }
}

async function cargarAgentes() {
    try {
        // Cargar TODOS los agentes del área
        const { data: agentes, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        // Cargar líderes para mostrar nombres
        const { data: lideres } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('rol', 'lider')
            .eq('area', currentUser.area);
        
        const lideresMap = {};
        lideres?.forEach(l => {
            lideresMap[l.id] = l.nombre;
        });
        
        mostrarAgentes(agentes, lideresMap);
        
    } catch (error) {
        console.error('Error al cargar agentes:', error);
        document.getElementById('agentesContainer').innerHTML = 
            '<div class="empty-state">Error al cargar agentes</div>';
    }
}

function mostrarAgentes(agentes, lideresMap) {
    const container = document.getElementById('agentesContainer');
    
    if (!agentes || agentes.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay agentes en esta área. Crea el primero.</div>';
        return;
    }
    
    let html = `
        <table class="agentes-table">
            <thead>
                <tr>
                    <th>Agente</th>
                    <th>Líder</th>
                    <th>Target</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    agentes.forEach(agente => {
        const liderNombre = lideresMap[agente.lider_id] || 'Sin líder';
        
        html += `
            <tr>
                <td><strong>${agente.nombre}</strong></td>
                <td><span class="lider-badge">${liderNombre}</span></td>
                <td><span class="target-info" id="target-${agente.id}">Cargando...</span></td>
                <td>
                    <button class="btn-target" onclick="abrirTargetModal('${agente.id}', '${agente.nombre}')">🎯 Target</button>
                    <button class="btn-depositos" onclick="verDepositos('${agente.id}', '${agente.nombre}')">💰 Depósitos</button>
                    ${currentUser.area === 'conversion' ? 
                        `<button class="btn-registros" onclick="verRegistros('${agente.id}', '${agente.nombre}')">📝 Registros</button>` : ''
                    }
                    <button class="btn-edit" onclick="editarAgente('${agente.id}')">✏️</button>
                    <button class="btn-delete" onclick="eliminarAgente('${agente.id}', '${agente.nombre}')">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Cargar targets de forma asíncrona
    agentes.forEach(agente => cargarTargetAgente(agente.id));
}

async function cargarTargetAgente(agenteId) {
    // Implementar igual que en dashboard-lider.js
}

function abrirRankingTV() {
    // Ver TODOS los agentes del área (sin filtrar por líder)
    const url = `../tv-ranking.html?area=${currentUser.area}`;
    const ventana = window.open(url, '_blank');
    
    if (ventana) {
        ventana.focus();
    }
}

function openModal() {
    // Implementar formulario
}

async function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}


const { createClient } = supabase;
let supabaseClient;
let currentUser;
let editingUsuarioId = null;
let editingUsuarioRol = null;
let areaRankingActual = 'conversion';
let mesActual, anioActual;

// Inicializar mes y año actual
const now = new Date();
mesActual = now.getMonth() + 1;
anioActual = now.getFullYear();

window.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    await verificarAcceso();
    await cargarUsuarios();
});

async function verificarAcceso() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    if (currentUser.rol !== 'super') {
        alert('No tienes acceso a esta página');
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('welcomeText').textContent = `Bienvenido, ${currentUser.nombre}`;
}

async function cargarUsuarios() {
    try {
        // Cargar tanto líderes como admin_area
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .in('rol', ['lider', 'admin_area'])
            .eq('activo', true)
            .order('rol')
            .order('nombre');
        
        if (error) throw error;
        
        mostrarUsuarios(data);
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        document.getElementById('usuariosContainer').innerHTML = 
            '<div class="empty-state">Error al cargar usuarios</div>';
    }
}

function mostrarUsuarios(usuarios) {
    const container = document.getElementById('usuariosContainer');
    
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay usuarios registrados. Crea el primero.</div>';
        return;
    }
    
    let html = `
        <table class="usuarios-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Área</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    usuarios.forEach(usuario => {
        const areaTexto = usuario.area ? usuario.area.charAt(0).toUpperCase() + usuario.area.slice(1) : 'Sin área';
        
        let rolTexto = '';
        let rolBadgeClass = '';
        
        if (usuario.rol === 'lider') {
            rolTexto = 'Líder';
            rolBadgeClass = 'rol-lider';
        } else if (usuario.rol === 'admin_area') {
            rolTexto = 'Admin Área';
            rolBadgeClass = 'rol-admin-area';
        }
        
        html += `
            <tr>
                <td>
                    ${usuario.nombre}
                    <span class="rol-badge ${rolBadgeClass}">${rolTexto}</span>
                </td>
                <td>${usuario.email}</td>
                <td><span class="area-badge area-${usuario.area}">${areaTexto}</span></td>
                <td>
                    ${usuario.rol === 'lider' || usuario.rol === 'admin_area' ? 
                        `<button class="btn-ver-agentes" onclick="verAgentesUsuario('${usuario.id}', '${usuario.nombre}', '${usuario.area}', '${usuario.rol}')">👁️ Ver Agentes</button>` : ''
                    }
                    <button class="btn-edit" onclick="editarUsuario('${usuario.id}', '${usuario.rol}')">✏️ Editar</button>
                    <button class="btn-delete" onclick="eliminarUsuario('${usuario.id}', '${usuario.nombre}', '${usuario.rol}')">🗑️ Eliminar</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function openModal(rol) {
    editingUsuarioId = null;
    editingUsuarioRol = rol;
    
    document.getElementById('usuarioRol').value = rol;
    
    if (rol === 'lider') {
        document.getElementById('modalTitle').textContent = 'Agregar Líder';
    } else if (rol === 'admin_area') {
        document.getElementById('modalTitle').textContent = 'Agregar Administrador de Área';
    }
    
    document.getElementById('usuarioForm').reset();
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('usuarioModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('usuarioModal').style.display = 'none';
}

async function editarUsuario(id, rol) {
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        editingUsuarioId = id;
        editingUsuarioRol = rol;
        
        document.getElementById('usuarioRol').value = rol;
        
        if (rol === 'lider') {
            document.getElementById('modalTitle').textContent = 'Editar Líder';
        } else if (rol === 'admin_area') {
            document.getElementById('modalTitle').textContent = 'Editar Administrador de Área';
        }
        
        document.getElementById('usuarioNombre').value = data.nombre;
        document.getElementById('usuarioEmail').value = data.email;
        document.getElementById('usuarioPassword').value = data.password;
        document.getElementById('usuarioArea').value = data.area;
        document.getElementById('modalError').style.display = 'none';
        document.getElementById('usuarioModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del usuario');
    }
}

document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const password = document.getElementById('usuarioPassword').value;
    const area = document.getElementById('usuarioArea').value;
    const rol = document.getElementById('usuarioRol').value;
    const modalError = document.getElementById('modalError');
    
    modalError.style.display = 'none';
    
    if (!area) {
        modalError.style.display = 'block';
        modalError.textContent = 'Debes seleccionar un área';
        return;
    }
    
    if (!rol) {
        modalError.style.display = 'block';
        modalError.textContent = 'Debe seleccionar un rol válido';
        return;
    }
    
    try {
        if (editingUsuarioId) {
            // Actualizar
            const { error } = await supabaseClient
                .from('usuarios')
                .update({
                    nombre: nombre,
                    email: email,
                    password: password,
                    area: area,
                    rol: rol
                })
                .eq('id', editingUsuarioId);
            
            if (error) throw error;
            
            alert('Usuario actualizado exitosamente');
            
        } else {
            // Crear nuevo
            const { data: existingUser } = await supabaseClient
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .maybeSingle();
            
            if (existingUser) {
                throw new Error('El email ya existe');
            }
            
            const { error: dbError } = await supabaseClient
                .from('usuarios')
                .insert({
                    nombre: nombre,
                    email: email,
                    password: password,
                    rol: rol,
                    area: area,
                    activo: true
                });
            
            if (dbError) throw dbError;
            
            const rolTexto = rol === 'lider' ? 'Líder' : 'Administrador de Área';
            alert(`${rolTexto} creado exitosamente ✅`);
        }
        
        closeModal();
        await cargarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarUsuario(id, nombre, rol) {
    const rolTexto = rol === 'lider' ? 'líder' : 'administrador de área';
    
    if (!confirm(`¿Estás seguro de eliminar al ${rolTexto} ${nombre}?`)) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('usuarios')
            .update({ activo: false })
            .eq('id', id);
        
        if (error) throw error;
        
        alert('Usuario eliminado exitosamente');
        await cargarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario: ' + error.message);
    }
}

// ============================================
// FUNCIONES PARA RANKINGS
// ============================================

async function verTodosLosRankings() {
    document.getElementById('rankingModal').style.display = 'block';
    
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.ranking-tab').classList.add('active');
    
    await cargarRankingPorArea('conversion');
}

async function cambiarAreaRanking(area) {
    areaRankingActual = area;
    
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    await cargarRankingPorArea(area);
}

async function cargarRankingPorArea(area) {
    const container = document.getElementById('rankingContent');
    container.innerHTML = '<div class="empty-state">⏳ Cargando...</div>';
    
    try {
        const { data: agentes, error: agentesError } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', area)
            .eq('activo', true)
            .order('nombre');
        
        if (agentesError) throw agentesError;
        
        if (!agentes || agentes.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 No hay agentes en esta área</div>';
            return;
        }
        
        const { data: targets } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        const { data: depositos } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        let registros = [];
        if (area === 'conversion') {
            const { data: registrosData } = await supabaseClient
                .from('registros')
                .select('*')
                .eq('mes', mesActual)
                .eq('anio', anioActual);
            registros = registrosData || [];
        }
        
        const ranking = agentes.map(agente => {
            const target = targets?.find(t => t.agente_id === agente.id);
            const depositosAgente = depositos?.filter(d => d.agente_id === agente.id) || [];
            const totalDepositos = depositosAgente.reduce((sum, d) => sum + parseFloat(d.monto), 0);
            const cantidadDepositos = depositosAgente.length;
            
            const registrosAgente = registros?.filter(r => r.agente_id === agente.id) || [];
            const cantidadRegistros = registrosAgente.length;
            
            let porcentaje = 0;
            let targetValor = 0;
            let actualValor = 0;
            
            if (area === 'conversion') {
                targetValor = target?.target_cantidad || 0;
                actualValor = cantidadDepositos;
                if (targetValor > 0) {
                    porcentaje = (actualValor / targetValor) * 100;
                }
            } else {
                targetValor = target?.target_monto || 0;
                actualValor = totalDepositos;
                if (targetValor > 0) {
                    porcentaje = (actualValor / targetValor) * 100;
                }
            }
            
            return {
                nombre: agente.nombre,
                target: targetValor,
                actual: actualValor,
                porcentaje: Math.round(porcentaje * 100) / 100,
                cantidadDepositos,
                totalDepositos
            };
        });
        
        ranking.sort((a, b) => b.actual - a.actual);
        mostrarTablaRanking(ranking, area);
        
    } catch (error) {
        console.error('Error al cargar ranking:', error);
        container.innerHTML = '<div class="empty-state">❌ Error al cargar ranking</div>';
    }
}

function mostrarTablaRanking(ranking, area) {
    const container = document.getElementById('rankingContent');
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let html = `<p style="text-align: center; color: #64748b; margin-bottom: 20px; font-weight: 600;">
                    ${meses[mesActual - 1]} ${anioActual}
                </p>`;
    
    html += '<table class="ranking-table">';
    html += '<thead><tr>';
    html += '<th style="width: 80px; text-align: center;">#</th>';
    html += '<th>Agente</th>';
    html += '<th style="text-align: center;">Target</th>';
    html += '<th style="text-align: center;">Actual</th>';
    html += '<th style="text-align: center;">% Cumplimiento</th>';
    html += '</tr></thead><tbody>';
    
    ranking.forEach((agente, index) => {
        const posicion = index + 1;
        let clasePos = '';
        if (posicion === 1) clasePos = 'ranking-position-1';
        else if (posicion === 2) clasePos = 'ranking-position-2';
        else if (posicion === 3) clasePos = 'ranking-position-3';
        
        let clasePorcentaje = 'ranking-percentage-low';
        if (agente.porcentaje >= 100) clasePorcentaje = 'ranking-percentage-high';
        else if (agente.porcentaje >= 70) clasePorcentaje = 'ranking-percentage-medium';
        
        let targetTexto = '';
        let actualTexto = '';
        
        if (area === 'conversion') {
            targetTexto = `${agente.target} deps`;
            actualTexto = `${agente.actual} deps`;
        } else {
            targetTexto = `$${agente.target.toFixed(0)}`;
            actualTexto = `$${agente.actual.toFixed(0)}`;
        }
        
        html += '<tr>';
        html += `<td class="ranking-position ${clasePos}" style="text-align: center;">${posicion}</td>`;
        html += `<td><strong>${agente.nombre}</strong></td>`;
        html += `<td style="text-align: center;">${targetTexto}</td>`;
        html += `<td style="text-align: center;"><strong>${actualTexto}</strong></td>`;
        html += `<td style="text-align: center;" class="ranking-percentage ${clasePorcentaje}">${agente.porcentaje}%</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function cerrarRankingModal() {
    document.getElementById('rankingModal').style.display = 'none';
}

async function verAgentesUsuario(usuarioId, usuarioNombre, usuarioArea, usuarioRol) {
    document.getElementById('agentesLiderModal').style.display = 'block';
    
    const tipoUsuario = usuarioRol === 'lider' ? 'Líder' : 'Administrador';
    document.getElementById('agentesLiderTitle').textContent = `👥 Agentes de ${tipoUsuario}: ${usuarioNombre}`;
    
    const container = document.getElementById('agentesLiderContent');
    container.innerHTML = '<div class="empty-state">⏳ Cargando...</div>';
    
    try {
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('activo', true);
        
        // Si es líder, filtrar por lider_id
        // Si es admin_area, mostrar todos del área
        if (usuarioRol === 'lider') {
            query = query.eq('lider_id', usuarioId);
        } else if (usuarioRol === 'admin_area') {
            query = query.eq('area', usuarioArea);
        }
        
        const { data: agentes, error: agentesError } = await query.order('nombre');
        
        if (agentesError) throw agentesError;
        
        if (!agentes || agentes.length === 0) {
            container.innerHTML = '<div class="empty-state">📭 No hay agentes asignados</div>';
            return;
        }
        
        const { data: targets } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        const { data: depositos } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        let registros = [];
        if (usuarioArea === 'conversion') {
            const { data: registrosData } = await supabaseClient
                .from('registros')
                .select('*')
                .eq('mes', mesActual)
                .eq('anio', anioActual);
            registros = registrosData || [];
        }
        
        const ranking = agentes.map(agente => {
            const target = targets?.find(t => t.agente_id === agente.id);
            const depositosAgente = depositos?.filter(d => d.agente_id === agente.id) || [];
            const totalDepositos = depositosAgente.reduce((sum, d) => sum + parseFloat(d.monto), 0);
            const cantidadDepositos = depositosAgente.length;
            
            const registrosAgente = registros?.filter(r => r.agente_id === agente.id) || [];
            const cantidadRegistros = registrosAgente.length;
            
            let porcentaje = 0;
            let targetValor = 0;
            let actualValor = 0;
            
            if (usuarioArea === 'conversion') {
                targetValor = target?.target_cantidad || 0;
                actualValor = cantidadDepositos;
                if (targetValor > 0) {
                    porcentaje = (actualValor / targetValor) * 100;
                }
            } else {
                targetValor = target?.target_monto || 0;
                actualValor = totalDepositos;
                if (targetValor > 0) {
                    porcentaje = (actualValor / targetValor) * 100;
                }
            }
            
            return {
                nombre: agente.nombre,
                target: targetValor,
                actual: actualValor,
                porcentaje: Math.round(porcentaje * 100) / 100,
                cantidadDepositos,
                totalDepositos
            };
        });
        
        ranking.sort((a, b) => b.actual - a.actual);
        mostrarTablaAgentesUsuario(ranking, usuarioArea);
        
    } catch (error) {
        console.error('Error al cargar agentes:', error);
        container.innerHTML = '<div class="empty-state">❌ Error al cargar agentes</div>';
    }
}

function mostrarTablaAgentesUsuario(ranking, area) {
    const container = document.getElementById('agentesLiderContent');
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let html = `<p style="text-align: center; color: #64748b; margin-bottom: 20px; font-weight: 600;">
                    ${meses[mesActual - 1]} ${anioActual}
                </p>`;
    
    html += '<table class="ranking-table">';
    html += '<thead><tr>';
    html += '<th style="width: 80px; text-align: center;">#</th>';
    html += '<th>Agente</th>';
    html += '<th style="text-align: center;">Target</th>';
    html += '<th style="text-align: center;">Actual</th>';
    html += '<th style="text-align: center;">% Cumplimiento</th>';
    html += '</tr></thead><tbody>';
    
    ranking.forEach((agente, index) => {
        const posicion = index + 1;
        let clasePos = '';
        if (posicion === 1) clasePos = 'ranking-position-1';
        else if (posicion === 2) clasePos = 'ranking-position-2';
        else if (posicion === 3) clasePos = 'ranking-position-3';
        
        let clasePorcentaje = 'ranking-percentage-low';
        if (agente.porcentaje >= 100) clasePorcentaje = 'ranking-percentage-high';
        else if (agente.porcentaje >= 70) clasePorcentaje = 'ranking-percentage-medium';
        
        let targetTexto = '';
        let actualTexto = '';
        
        if (area === 'conversion') {
            targetTexto = `${agente.target} deps`;
            actualTexto = `${agente.actual} deps`;
        } else {
            targetTexto = `$${agente.target.toFixed(0)}`;
            actualTexto = `$${agente.actual.toFixed(0)}`;
        }
        
        html += '<tr>';
        html += `<td class="ranking-position ${clasePos}" style="text-align: center;">${posicion}</td>`;
        html += `<td><strong>${agente.nombre}</strong></td>`;
        html += `<td style="text-align: center;">${targetTexto}</td>`;
        html += `<td style="text-align: center;"><strong>${actualTexto}</strong></td>`;
        html += `<td style="text-align: center;" class="ranking-percentage ${clasePorcentaje}">${agente.porcentaje}%</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function cerrarAgentesLiderModal() {
    document.getElementById('agentesLiderModal').style.display = 'none';
}

async function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}
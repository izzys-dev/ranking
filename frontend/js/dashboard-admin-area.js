const { createClient } = supabase;
let supabaseClient;
let currentUser;
let mesActual, anioActual;
let editingAgenteId = null;
let currentAgenteId = null;
let currentAgenteName = null;

window.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    applyTranslations();
    await verificarAcceso();
    configurarMesActual();
    await cargarEstadisticas();
    await cargarAgentes();
    await cargarLideresEnSelect();
});

function applyTranslations() {
    document.getElementById('panelTitle').textContent = `⚡ ${i18n.t('area_admin_panel')}`;
    document.getElementById('showRankingBtn').textContent = `📺 ${i18n.t('show_ranking')}`;
    document.getElementById('logoutBtn').textContent = i18n.t('logout');
    document.getElementById('allAgentsTitle').textContent = i18n.t('all_area_agents');
    document.getElementById('addAgentBtn').textContent = `+ ${i18n.t('add_agent')}`;
    document.getElementById('quickDepositBtn').textContent = `⚡ ${i18n.t('quick_deposit')}`;
    document.getElementById('quickRegistrationBtn').textContent = `📝 ${i18n.t('quick_registration')}`;
    document.getElementById('loadingAgents').textContent = `${i18n.t('loading')}...`;
    
    // Modal labels
    document.getElementById('assignLeaderLabel').textContent = i18n.t('assign_to_leader');
    document.getElementById('selectLeaderOption').textContent = i18n.t('select_leader');
    document.getElementById('agentNameLabel').textContent = i18n.t('full_name');
    document.getElementById('cancelBtn').textContent = i18n.t('cancel');
    document.getElementById('saveBtn').textContent = i18n.t('save');
    
    // Target modal
    document.getElementById('targetModalTitle').textContent = i18n.t('assign_target');
    document.getElementById('targetAmountLabel').textContent = `${i18n.t('target')} (${i18n.t('deposits').toLowerCase()})`;
    document.getElementById('targetMoneyLabel').textContent = `${i18n.t('target')} ($)`;
    document.getElementById('cancelTargetBtn').textContent = i18n.t('cancel');
    document.getElementById('saveTargetBtn').textContent = i18n.t('save');
    
    // Deposits modal
    document.getElementById('depositAmountLabel').textContent = i18n.t('amount');
    document.getElementById('addDepositBtn').textContent = `+ ${i18n.t('add_agent')}`;
    document.getElementById('closeDepositsBtn').textContent = i18n.t('close');
    
    // Registrations modal
    document.getElementById('addRegistrationBtn').textContent = `+ ${i18n.t('add_agent')}`;
    document.getElementById('closeRegistrationsBtn').textContent = i18n.t('close');
    
    // Quick deposit
    document.getElementById('quickDepositModalTitle').textContent = i18n.t('quick_deposit');
    document.getElementById('selectAgentDepositLabel').textContent = i18n.t('agent');
    document.getElementById('selectAgentOption').textContent = `-- ${i18n.t('select_area')} --`;
    document.getElementById('amountLabel').textContent = i18n.t('amount');
    document.getElementById('cancelQuickDepositBtn').textContent = i18n.t('cancel');
    document.getElementById('saveQuickDepositBtn').textContent = i18n.t('save');
    
    // Quick registration
    document.getElementById('quickRegistrationModalTitle').textContent = i18n.t('quick_registration');
    document.getElementById('selectAgentRegistrationLabel').textContent = i18n.t('agent');
    document.getElementById('selectAgentRegistrationOption').textContent = `-- ${i18n.t('select_area')} --`;
    document.getElementById('cancelQuickRegistrationBtn').textContent = i18n.t('cancel');
    document.getElementById('saveQuickRegistrationBtn').textContent = i18n.t('save');
}

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
    
    document.getElementById('welcomeText').textContent = `${i18n.t('welcome')}, ${currentUser.nombre}`;
    
    const areaBadge = document.getElementById('areaBadge');
    const areaTexto = i18n.t(`area_${currentUser.area}`);
    areaBadge.textContent = `${i18n.t('area')}: ${areaTexto}`;
    areaBadge.className = `area-badge area-${currentUser.area}`;
    
    if (currentUser.area === 'conversion') {
        document.getElementById('quickRegistrationBtn').style.display = 'inline-block';
    }
}

function configurarMesActual() {
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    const meses = i18n.getMonths();
    document.getElementById('mesActual').textContent = `${meses[mesActual - 1]} ${anioActual}`;
}

async function cargarEstadisticas() {
    try {
        const { data: agentes } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true);
        
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
        
        const { data: lideres } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('rol', 'lider')
            .eq('area', currentUser.area)
            .eq('activo', true);
        
        let html = `
            <div class="stat-card">
                <h3>${i18n.t('total_agents')}</h3>
                <div class="value">${agentes?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3>${i18n.t('active_leaders')}</h3>
                <div class="value">${lideres?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3>${i18n.t('monthly_deposits')}</h3>
                <div class="value">${cantidadDepositos}</div>
            </div>
            <div class="stat-card">
                <h3>${i18n.t('total_income')}</h3>
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
        select.innerHTML = `<option value="">${i18n.t('select_leader')}</option>`;
        
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
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true);
        
        const { data: agentes, error } = await query.order('nombre');
        
        if (error) throw error;
        
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
        await cargarAgentesEnSelects(agentes);
        
    } catch (error) {
        console.error('Error al cargar agentes:', error);
        document.getElementById('agentesContainer').innerHTML = 
            `<div class="empty-state">${i18n.t('error_loading')}</div>`;
    }
}

async function cargarAgentesEnSelects(agentes) {
    const selectDeposito = document.getElementById('agenteSelectDeposito');
    const selectRegistro = document.getElementById('agenteSelectRegistro');
    
    selectDeposito.innerHTML = `<option value="">${i18n.t('select_area')}</option>`;
    selectRegistro.innerHTML = `<option value="">${i18n.t('select_area')}</option>`;
    
    agentes?.forEach(agente => {
        const optionDep = document.createElement('option');
        optionDep.value = agente.id;
        optionDep.textContent = agente.nombre;
        selectDeposito.appendChild(optionDep);
        
        const optionReg = document.createElement('option');
        optionReg.value = agente.id;
        optionReg.textContent = agente.nombre;
        selectRegistro.appendChild(optionReg);
    });
}

function mostrarAgentes(agentes, lideresMap) {
    const container = document.getElementById('agentesContainer');
    
    if (!agentes || agentes.length === 0) {
        container.innerHTML = `<div class="empty-state">${i18n.t('no_agents_create')}</div>`;
        return;
    }
    
    let html = `
        <table class="agentes-table">
            <thead>
                <tr>
                    <th>${i18n.t('agent')}</th>
                    <th>${i18n.t('leader')}</th>
                    <th>${i18n.t('target')}</th>
                    <th>${i18n.t('actions')}</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    agentes.forEach(agente => {
        const liderNombre = lideresMap[agente.lider_id] || i18n.t('no_leaders');
        
        html += `
            <tr>
                <td><strong>${agente.nombre}</strong></td>
                <td><span class="lider-badge">${liderNombre}</span></td>
                <td><span class="target-info" id="target-${agente.id}">${i18n.t('loading')}...</span></td>
                <td>
                    <button class="btn-target" onclick="abrirTargetModal('${agente.id}', '${agente.nombre}')">🎯 ${i18n.t('target')}</button>
                    <button class="btn-depositos" onclick="verDepositos('${agente.id}', '${agente.nombre}')">💰 ${i18n.t('deposits')}</button>
                    ${currentUser.area === 'conversion' ? 
                        `<button class="btn-registros" onclick="verRegistros('${agente.id}', '${agente.nombre}')">📝 ${i18n.t('registrations')}</button>` : ''
                    }
                    <button class="btn-edit" onclick="editarAgente('${agente.id}')">✏️</button>
                    <button class="btn-delete" onclick="eliminarAgente('${agente.id}', '${agente.nombre}')">🗑️</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    agentes.forEach(agente => cargarTargetAgente(agente.id));
}

async function cargarTargetAgente(agenteId) {
    try {
        const { data: target } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', agenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        const targetSpan = document.getElementById(`target-${agenteId}`);
        if (!targetSpan) return;
        
        if (target) {
            if (currentUser.area === 'conversion') {
                targetSpan.textContent = `${target.target_cantidad || 0} ${i18n.t('deposits').toLowerCase()}`;
            } else {
                targetSpan.textContent = `$${target.target_monto?.toFixed(0) || 0}`;
            }
        } else {
            targetSpan.textContent = i18n.t('no_target');
        }
    } catch (error) {
        console.error('Error al cargar target:', error);
    }
}

function openModal() {
    editingAgenteId = null;
    document.getElementById('modalTitle').textContent = i18n.t('add_agent');
    document.getElementById('agenteForm').reset();
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('agenteModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('agenteModal').style.display = 'none';
}

async function editarAgente(id) {
    try {
        const { data, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        editingAgenteId = id;
        document.getElementById('modalTitle').textContent = i18n.t('edit_user');
        document.getElementById('liderSelect').value = data.lider_id || '';
        document.getElementById('agenteNombre').value = data.nombre;
        document.getElementById('modalError').style.display = 'none';
        document.getElementById('agenteModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert(i18n.t('error_loading'));
    }
}

document.getElementById('agenteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const liderId = document.getElementById('liderSelect').value;
    const nombre = document.getElementById('agenteNombre').value.trim();
    const modalError = document.getElementById('modalError');
    
    modalError.style.display = 'none';
    
    if (!liderId) {
        modalError.style.display = 'block';
        modalError.textContent = i18n.t('select_leader');
        return;
    }
    
    try {
        if (editingAgenteId) {
            const { error } = await supabaseClient
                .from('agentes')
                .update({
                    nombre: nombre,
                    lider_id: liderId
                })
                .eq('id', editingAgenteId);
            
            if (error) throw error;
            
            alert(i18n.t('agent_updated'));
            
        } else {
            const { error: dbError } = await supabaseClient
                .from('agentes')
                .insert({
                    nombre: nombre,
                    lider_id: liderId,
                    area: currentUser.area,
                    activo: true
                });
            
            if (dbError) throw dbError;
            
            alert(i18n.t('agent_created'));
        }
        
        closeModal();
        await cargarAgentes();
        await cargarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarAgente(id, nombre) {
    if (!confirm(`${i18n.t('confirm_delete_agent')} ${nombre}?`)) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('agentes')
            .update({ activo: false })
            .eq('id', id);
        
        if (error) throw error;
        
        alert(i18n.t('agent_deleted'));
        await cargarAgentes();
        await cargarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        alert(`${i18n.t('error_loading')}: ${error.message}`);
    }
}

async function abrirTargetModal(agenteId, agenteNombre) {
    currentAgenteId = agenteId;
    currentAgenteName = agenteNombre;
    
    document.getElementById('targetModalTitle').textContent = `${i18n.t('assign_target')}: ${agenteNombre}`;
    
    try {
        const { data: target } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', agenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        document.getElementById('targetCantidad').value = target?.target_cantidad || '';
        document.getElementById('targetMonto').value = target?.target_monto || '';
        
    } catch (error) {
        console.error('Error:', error);
    }
    
    document.getElementById('targetModalError').style.display = 'none';
    document.getElementById('targetModal').style.display = 'block';
}

function closeTargetModal() {
    document.getElementById('targetModal').style.display = 'none';
}

document.getElementById('targetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cantidad = parseInt(document.getElementById('targetCantidad').value) || 0;
    const monto = parseFloat(document.getElementById('targetMonto').value) || 0;
    const modalError = document.getElementById('targetModalError');
    
    modalError.style.display = 'none';
    
    try {
        const { data: existing } = await supabaseClient
            .from('targets_mensuales')
            .select('id')
            .eq('agente_id', currentAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        if (existing) {
            const { error } = await supabaseClient
                .from('targets_mensuales')
                .update({
                    target_cantidad: cantidad,
                    target_monto: monto
                })
                .eq('id', existing.id);
            
            if (error) throw error;
        } else {
            const { error } = await supabaseClient
                .from('targets_mensuales')
                .insert({
                    agente_id: currentAgenteId,
                    mes: mesActual,
                    anio: anioActual,
                    target_cantidad: cantidad,
                    target_monto: monto
                });
            
            if (error) throw error;
        }
        
        alert(`${i18n.t('target')} ${i18n.t('updated_successfully')}`);
        closeTargetModal();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function verDepositos(agenteId, agenteNombre) {
    currentAgenteId = agenteId;
    currentAgenteName = agenteNombre;
    
    document.getElementById('depositosModalTitle').textContent = `${i18n.t('deposits')} - ${agenteNombre}`;
    document.getElementById('depositoForm').reset();
    document.getElementById('depositoModalError').style.display = 'none';
    document.getElementById('depositosModal').style.display = 'block';
    
    await cargarListaDepositos();
}

async function cargarListaDepositos() {
    try {
        const { data: depositos, error } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('agente_id', currentAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const lista = document.getElementById('depositosList');
        
        if (!depositos || depositos.length === 0) {
            lista.innerHTML = `<div class="empty-state">${i18n.t('no_agents')}</div>`;
            return;
        }
        
        const meses = i18n.getMonths();
        
        let html = '';
        depositos.forEach(deposito => {
            const fecha = new Date(deposito.created_at);
            const fechaStr = `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
            
            html += `
                <div class="deposito-item">
                    <div class="deposito-info">
                        <div class="deposito-monto">$${parseFloat(deposito.monto).toFixed(2)}</div>
                        <div class="deposito-fecha">${fechaStr}</div>
                    </div>
                    <div class="deposito-actions">
                        <button class="btn-delete" onclick="eliminarDeposito('${deposito.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function closeDepositosModal() {
    document.getElementById('depositosModal').style.display = 'none';
}

document.getElementById('depositoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const monto = parseFloat(document.getElementById('depositoMonto').value);
    const fecha = document.getElementById('depositoFecha').value;
    const modalError = document.getElementById('depositoModalError');

    modalError.style.display = 'none';

    // Debug: mostrar el valor de fecha
    console.log('Valor de fecha antes de insertar:', fecha);
    alert('Valor de fecha antes de insertar: ' + fecha);

    if (monto <= 0) {
        modalError.style.display = 'block';
        modalError.textContent = 'Monto inválido';
        return;
    }
    if (!fecha) {
        modalError.style.display = 'block';
        modalError.textContent = 'La fecha es obligatoria';
        return;
    }

    const fechaObj = new Date(fecha + 'T00:00:00');
    const mes = fechaObj.getMonth() + 1;
    const anio = fechaObj.getFullYear();

    try {
        const { error } = await supabaseClient
            .from('depositos')
            .insert({
                agente_id: currentAgenteId,
                monto: monto,
                fecha: fecha,
                mes: mes,
                anio: anio
            });

        if (error) throw error;

        document.getElementById('depositoForm').reset();
        await cargarListaDepositos();
        await cargarEstadisticas();

    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarDeposito(id) {
    if (!confirm(`${i18n.t('confirm_delete')}?`)) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('depositos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await cargarListaDepositos();
        await cargarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        alert(`${i18n.t('error_loading')}: ${error.message}`);
    }
}

async function verRegistros(agenteId, agenteNombre) {
    currentAgenteId = agenteId;
    currentAgenteName = agenteNombre;
    
    document.getElementById('registrosModalTitle').textContent = `${i18n.t('registrations')} - ${agenteNombre}`;
    document.getElementById('registrosModal').style.display = 'block';
    
    await cargarListaRegistros();
}

async function cargarListaRegistros() {
    try {
        const { data: registros, error } = await supabaseClient
            .from('registros')
            .select('*')
            .eq('agente_id', currentAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const lista = document.getElementById('registrosList');
        
        if (!registros || registros.length === 0) {
            lista.innerHTML = `<div class="empty-state">${i18n.t('no_agents')}</div>`;
            return;
        }
        
        const meses = i18n.getMonths();
        
        let html = '';
        registros.forEach(registro => {
            const fecha = new Date(registro.created_at);
            const fechaStr = `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
            
            html += `
                <div class="registro-item">
                    <div class="registro-info">
                        <div class="deposito-monto">📝 ${i18n.t('lead')}</div>
                        <div class="registro-fecha">${fechaStr}</div>
                    </div>
                    <div class="registro-actions">
                        <button class="btn-delete" onclick="eliminarRegistro('${registro.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function closeRegistrosModal() {
    document.getElementById('registrosModal').style.display = 'none';
}

document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const { error } = await supabaseClient
            .from('registros')
            .insert({
                agente_id: currentAgenteId,
                mes: mesActual,
                anio: anioActual
            });
        
        if (error) throw error;
        
        await cargarListaRegistros();
        
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});

async function eliminarRegistro(id) {
    if (!confirm(`${i18n.t('confirm_delete')}?`)) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('registros')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await cargarListaRegistros();
        
    } catch (error) {
        console.error('Error:', error);
        alert(`${i18n.t('error_loading')}: ${error.message}`);
    }
}

function openDepositoRapido() {
    document.getElementById('depositoRapidoForm').reset();
    document.getElementById('depositoRapidoError').style.display = 'none';
    document.getElementById('depositoRapidoModal').style.display = 'block';
}

function closeDepositoRapido() {
    document.getElementById('depositoRapidoModal').style.display = 'none';
}

document.getElementById('depositoRapidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const agenteId = document.getElementById('agenteSelectDeposito').value;
    const monto = parseFloat(document.getElementById('montoRapido').value);
    const modalError = document.getElementById('depositoRapidoError');
    
    modalError.style.display = 'none';
    
    if (!agenteId || monto <= 0) {
        modalError.style.display = 'block';
        modalError.textContent = 'Complete todos los campos';
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('depositos')
            .insert({
                agente_id: agenteId,
                monto: monto,
                mes: mesActual,
                anio: anioActual
            });
        
        if (error) throw error;
        
        alert(`${i18n.t('deposits')} ${i18n.t('created_successfully')} ✅`);
        closeDepositoRapido();
        await cargarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

function openRegistroRapido() {
    document.getElementById('registroRapidoForm').reset();
    document.getElementById('registroRapidoError').style.display = 'none';
    document.getElementById('registroRapidoModal').style.display = 'block';
}

function closeRegistroRapido() {
    document.getElementById('registroRapidoModal').style.display = 'none';
}

document.getElementById('registroRapidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const agenteId = document.getElementById('agenteSelectRegistro').value;
    const modalError = document.getElementById('registroRapidoError');
    
    modalError.style.display = 'none';
    
    if (!agenteId) {
        modalError.style.display = 'block';
        modalError.textContent = 'Seleccione un agente';
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('registros')
            .insert({
                agente_id: agenteId,
                mes: mesActual,
                anio: anioActual
            });
        
        if (error) throw error;
        
        alert(`${i18n.t('registrations')} ${i18n.t('created_successfully')} ✅`);
        closeRegistroRapido();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

function abrirRankingTV() {
    const url = `../tv-ranking.html?area=${currentUser.area}`;
    const ventana = window.open(url, '_blank');
    
    if (ventana) {
        ventana.focus();
    }
}

async function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}
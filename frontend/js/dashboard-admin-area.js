const { createClient } = supabase;
let supabaseClient;
let currentUser;
let mesActual, anioActual;
let editingAgenteId = null;

// Función helper para obtener textos traducidos
function getButtonText(key) {
    const translations = {
        es: {
            'buttons.deposits': 'Depósitos',
            'buttons.registers': 'Registros',
            'buttons.target': 'Target',
            'buttons.edit': 'Editar',
            'buttons.delete': 'Eliminar'
        },
        en: {
            'buttons.deposits': 'Deposits',
            'buttons.registers': 'Registers',
            'buttons.target': 'Target',
            'buttons.edit': 'Edit',
            'buttons.delete': 'Delete'
        },
        pt: {
            'buttons.deposits': 'Depósitos',
            'buttons.registers': 'Registros',
            'buttons.target': 'Meta',
            'buttons.edit': 'Editar',
            'buttons.delete': 'Deletar'
        }
    };
    
    const lang = window.i18n?.getLanguage?.() || 'es';
    return translations[lang]?.[key] || key;
}

// Función helper para obtener mensajes traducidos
function getMessage(key) {
    const messages = {
        es: {
            'access_denied': 'No tienes acceso a esta página',
            'load_agent_error': 'Error al cargar el agente',
            'agent_updated': 'Agente actualizado exitosamente',
            'agent_created': 'Agente creado exitosamente',
            'agent_deleted': 'Agente eliminado exitosamente',
            'confirm_delete_agent': '¿Estás seguro de que deseas eliminar este agente?',
            'deposit_created': 'Depósito creado exitosamente',
            'deposit_updated': 'Depósito actualizado exitosamente',
            'deposit_deleted': 'Depósito eliminado exitosamente',
            'register_created': 'Registro creado exitosamente',
            'register_updated': 'Registro actualizado exitosamente',
            'register_deleted': 'Registro eliminado exitosamente',
            'target_assigned': 'Target asignado exitosamente'
        },
        en: {
            'access_denied': 'You do not have access to this page',
            'load_agent_error': 'Error loading agent',
            'agent_updated': 'Agent updated successfully',
            'agent_created': 'Agent created successfully',
            'agent_deleted': 'Agent deleted successfully',
            'confirm_delete_agent': 'Are you sure you want to delete this agent?',
            'deposit_created': 'Deposit created successfully',
            'deposit_updated': 'Deposit updated successfully',
            'deposit_deleted': 'Deposit deleted successfully',
            'register_created': 'Register created successfully',
            'register_updated': 'Register updated successfully',
            'register_deleted': 'Register deleted successfully',
            'target_assigned': 'Target assigned successfully'
        },
        pt: {
            'access_denied': 'Você não tem acesso a esta página',
            'load_agent_error': 'Erro ao carregar agente',
            'agent_updated': 'Agente atualizado com sucesso',
            'agent_created': 'Agente criado com sucesso',
            'agent_deleted': 'Agente deletado com sucesso',
            'confirm_delete_agent': 'Tem certeza que deseja deletar este agente?',
            'deposit_created': 'Depósito criado com sucesso',
            'deposit_updated': 'Depósito atualizado com sucesso',
            'deposit_deleted': 'Depósito deletado com sucesso',
            'register_created': 'Registro criado com sucesso',
            'register_updated': 'Registro atualizado com sucesso',
            'register_deleted': 'Registro deletado com sucesso',
            'target_assigned': 'Meta atribuída com sucesso'
        }
    };
    
    const lang = window.i18n?.getLanguage?.() || 'es';
    return messages[lang]?.[key] || key;
}

// Función helper para obtener etiquetas de UI
function getUIText(key) {
    const uiTexts = {
        es: {
            'welcome': 'Bienvenido',
            'area': 'Área',
            'area_conversion': 'Conversión',
            'area_retention': 'Retención',
            'area_recovery': 'Recovery',
            'no_area': 'Sin área'
        },
        en: {
            'welcome': 'Welcome',
            'area': 'Area',
            'area_conversion': 'Conversion',
            'area_retention': 'Retention',
            'area_recovery': 'Recovery',
            'no_area': 'No area'
        },
        pt: {
            'welcome': 'Bem-vindo',
            'area': 'Área',
            'area_conversion': 'Conversão',
            'area_retention': 'Retenção',
            'area_recovery': 'Recovery',
            'no_area': 'Sem área'
        }
    };
    
    const lang = window.i18n?.getLanguage?.() || 'es';
    return uiTexts[lang]?.[key] || key;
}

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

// Listener para cambios de idioma
window.addEventListener('languageChanged', async () => {
    // Actualizar el badge de área
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
        let areaTexto = '';
        const areaValue = currentUser.area ? String(currentUser.area).toLowerCase().trim() : '';
        
        if (areaValue === 'conversion') {
            areaTexto = getUIText('area_conversion');
        } else if (areaValue === 'retention') {
            areaTexto = getUIText('area_retention');
        } else if (areaValue === 'recovery') {
            areaTexto = getUIText('area_recovery');
        } else {
            areaTexto = getUIText('no_area');
        }
        const areaLabel = getUIText('area');
        document.getElementById('areaBadge').textContent = `${areaLabel}: ${areaTexto}`;
    }
    
    configurarMesActual();
    await cargarAgentes();
});

async function verificarAcceso() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    if (currentUser.rol !== 'admin_area') {
        alert(getMessage('access_denied'));
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('welcomeText').textContent = `${getUIText('welcome')}, ${currentUser.nombre}`;
    
    const areaBadge = document.getElementById('areaBadge');
    let areaTexto = '';
    const areaValue = currentUser.area ? String(currentUser.area).toLowerCase().trim() : '';
    
    if (areaValue === 'conversion') {
        areaTexto = getUIText('area_conversion');
    } else if (areaValue === 'retention') {
        areaTexto = getUIText('area_retention');
    } else if (areaValue === 'recovery') {
        areaTexto = getUIText('area_recovery');
    } else {
        areaTexto = getUIText('no_area');
    }
    const areaLabel = getUIText('area');
    areaBadge.textContent = `${areaLabel}: ${areaTexto}`;
    areaBadge.className = `area-badge area-${areaValue}`;
    
    // Mostrar botón de registro rápido solo para conversión
    if (areaValue === 'conversion') {
        document.getElementById('btnRegistroRapido').style.display = 'inline-block';
    }
}

function configurarMesActual() {
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    // Obtener el idioma actual del i18n
    const idioma = window.i18n ? window.i18n.getLanguage() : 'es';
    
    // Mapear idiomas a locales
    const localeMap = {
        'es': 'es-ES',
        'en': 'en-US',
        'pt': 'pt-BR'
    };
    
    const locale = localeMap[idioma] || 'es-ES';
    
    // Usar Intl.DateTimeFormat para obtener el mes en el idioma correcto
    const mesTexto = now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    document.getElementById('mesActual').textContent = mesTexto.charAt(0).toUpperCase() + mesTexto.slice(1);
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
                <h3 data-i18n="dashboard.total_agents">Total Agentes</h3>
                <div class="value">${agentes?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3 data-i18n="dashboard.active_leaders">Líderes Activos</h3>
                <div class="value">${lideres?.length || 0}</div>
            </div>
            <div class="stat-card">
                <h3 data-i18n="dashboard.month_deposits">Depósitos del Mes</h3>
                <div class="value">${cantidadDepositos}</div>
            </div>
            <div class="stat-card">
                <h3 data-i18n="dashboard.total_income">Total Ingresado</h3>
                <div class="value">$${totalDepositos.toFixed(0)}</div>
            </div>
        `;
        
        document.getElementById('statsGrid').innerHTML = html;
        
        // Traducir el contenido nuevo
        if (window.i18n && window.i18n.translatePage) {
            await window.i18n.translatePage();
        }
        
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
        
        console.log('👥 Líderes cargados:', lideres);
        console.log('📊 Total de líderes:', lideres?.length || 0);
        
        const select = document.getElementById('liderSelect');
        select.innerHTML = '<option value="">-- Selecciona un líder --</option>';
        
        lideres?.forEach(lider => {
            console.log('📋 Líder:', { id: lider.id, nombre: lider.nombre, area: lider.area, rol: lider.rol });
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
                    <th data-i18n="dashboard.agents">Agente</th>
                    <th data-i18n="users.leader">Líder</th>
                    <th data-i18n="targets.title">Target</th>
                    <th data-i18n="form.actions">Acciones</th>
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
                    <button class="btn-target" onclick="abrirTargetModal('${agente.id}', '${agente.nombre}')">${getButtonText('buttons.target')}</button>
                    <button class="btn-depositos" onclick="verDepositos('${agente.id}', '${agente.nombre}')">${getButtonText('buttons.deposits')}</button>
                    ${currentUser.area === 'conversion' ? 
                        `<button class="btn-registros" onclick="verRegistros('${agente.id}', '${agente.nombre}')">${getButtonText('buttons.registers')}</button>` : ''
                    }
                    <button class="btn-edit" onclick="editarAgente('${agente.id}')">${getButtonText('buttons.edit')}</button>
                    <button class="btn-delete" onclick="eliminarAgente('${agente.id}', '${agente.nombre}')">${getButtonText('buttons.delete')}</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Traducir encabezados
    if (window.i18n && window.i18n.translatePage) {
        window.i18n.translatePage();
    }
    
    // Cargar targets de forma asíncrona
    agentes.forEach(agente => cargarTargetAgente(agente.id));
}

async function cargarTargetAgente(agenteId) {
    try {
        const { data: target, error } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', agenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        if (error) throw error;
        
        let targetTexto = 'Sin target';
        if (target) {
            if (currentUser.area === 'conversion') {
                targetTexto = `${target.target_cantidad} depósitos`;
            } else {
                targetTexto = `$${parseFloat(target.target_monto).toFixed(2)}`;
            }
        }
        
        const element = document.getElementById(`target-${agenteId}`);
        if (element) {
            element.textContent = targetTexto;
        }
        
    } catch (error) {
        console.error('Error al cargar target del agente:', error);
        const element = document.getElementById(`target-${agenteId}`);
        if (element) {
            element.textContent = 'Error';
        }
    }
}

let depositoAgenteId = null;
let editingDepositoId = null;

async function verDepositos(agenteId, agenteNombre) {
    depositoAgenteId = agenteId;
    
    const depositoAgenteEl = document.getElementById('depositoAgenteNombre');
    if (depositoAgenteEl) {
        depositoAgenteEl.textContent = agenteNombre;
    }
    
    const depositoForm = document.getElementById('depositoForm');
    if (depositoForm) {
        depositoForm.reset();
    }
    
    const depositoError = document.getElementById('depositoError');
    if (depositoError) {
        depositoError.style.display = 'none';
    }
    
    editingDepositoId = null;
    
    const btnGuardar = document.getElementById('btnGuardarDeposito');
    if (btnGuardar) {
        btnGuardar.textContent = 'Agregar';
    }
    
    const depositosModal = document.getElementById('depositosModal');
    if (depositosModal) {
        depositosModal.style.display = 'block';
    }
    
    await cargarDepositosAgente();
}

async function cargarDepositosAgente() {
    try {
        const { data: depositos, error } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('agente_id', depositoAgenteId)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        mostrarDepositosAgente(depositos || []);
        
    } catch (error) {
        console.error('Error al cargar depósitos:', error);
        document.getElementById('depositoError').textContent = 'Error al cargar depósitos';
        document.getElementById('depositoError').style.display = 'block';
    }
}

function mostrarDepositosAgente(depositos) {
    const container = document.getElementById('depositosList');
    
    if (depositos.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay depósitos registrados</div>';
        return;
    }
    
    let totalDepositos = 0;
    let html = '<h4 style="margin-top: 30px; margin-bottom: 15px;">Depósitos Registrados:</h4>';
    
    depositos.forEach(deposito => {
        totalDepositos += parseFloat(deposito.monto);
        const fecha = new Date(deposito.fecha).toLocaleDateString('es-ES');
        
        html += `
            <div class="deposito-item">
                <div class="deposito-info">
                    <div class="deposito-monto">$${parseFloat(deposito.monto).toFixed(2)}</div>
                    <div class="deposito-fecha">${fecha}</div>
                </div>
                <div class="deposito-actions">
                    <button type="button" class="btn-edit" onclick="editarDeposito('${deposito.id}')">✏️</button>
                    <button type="button" class="btn-delete" onclick="eliminarDeposito('${deposito.id}')">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
            <strong>Total de depósitos: $${totalDepositos.toFixed(2)}</strong>
        </div>
    `;
    
    container.innerHTML = html;
}

async function editarDeposito(depositoId) {
    try {
        const { data: deposito, error } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('id', depositoId)
            .single();
        
        if (error) throw error;
        
        editingDepositoId = deposito.id;
        document.getElementById('depositoMonto').value = deposito.monto;
        
        // Convertir fecha ISO a formato YYYY-MM-DD
        const fecha = new Date(deposito.fecha);
        const fechaFormato = fecha.toISOString().split('T')[0];
        document.getElementById('depositoFecha').value = fechaFormato;
        
        document.getElementById('btnGuardarDeposito').textContent = 'Guardar cambios';
        
        // Scroll al formulario
        document.getElementById('depositoForm').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('depositoMonto').focus();
        
    } catch (error) {
        console.error('Error al cargar depósito:', error);
        document.getElementById('depositoError').textContent = 'Error al cargar el depósito';
        document.getElementById('depositoError').style.display = 'block';
    }
}

async function eliminarDeposito(depositoId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este depósito?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('depositos')
            .delete()
            .eq('id', depositoId);
        
        if (error) throw error;
        
        document.getElementById('depositoError').style.display = 'none';
        await cargarDepositosAgente();
        
    } catch (error) {
        console.error('Error al eliminar depósito:', error);
        document.getElementById('depositoError').textContent = 'Error al eliminar el depósito';
        document.getElementById('depositoError').style.display = 'block';
    }
}

function cerrarDepositosModal() {
    document.getElementById('depositosModal').style.display = 'none';
    depositoAgenteId = null;
    editingDepositoId = null;
}

// Manejar envío del formulario de depósitos
document.addEventListener('DOMContentLoaded', function() {
    const depositoForm = document.getElementById('depositoForm');
    if (depositoForm) {
        depositoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const monto = parseFloat(document.getElementById('depositoMonto').value);
            const fecha = document.getElementById('depositoFecha').value;
            
            if (!monto || monto <= 0) {
                document.getElementById('depositoError').textContent = 'El monto debe ser mayor a 0';
                document.getElementById('depositoError').style.display = 'block';
                return;
            }
            
            if (!fecha) {
                document.getElementById('depositoError').textContent = 'Debes seleccionar una fecha';
                document.getElementById('depositoError').style.display = 'block';
                return;
            }
            
            try {
                if (editingDepositoId) {
                    // UPDATE
                    const { error } = await supabaseClient
                        .from('depositos')
                        .update({
                            monto,
                            fecha,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', editingDepositoId);
                    
                    if (error) throw error;
                    
                } else {
                    // INSERT
                    const now = new Date();
                    const { error } = await supabaseClient
                        .from('depositos')
                        .insert({
                            agente_id: depositoAgenteId,
                            monto,
                            fecha,
                            mes: now.getMonth() + 1,
                            anio: now.getFullYear(),
                            created_at: new Date().toISOString()
                        });
                    
                    if (error) throw error;
                }
                
                document.getElementById('depositoError').style.display = 'none';
                document.getElementById('depositoForm').reset();
                editingDepositoId = null;
                document.getElementById('btnGuardarDeposito').textContent = 'Agregar';
                
                await cargarDepositosAgente();
                
            } catch (error) {
                console.error('Error al guardar depósito:', error);
                document.getElementById('depositoError').textContent = 'Error al guardar el depósito: ' + error.message;
                document.getElementById('depositoError').style.display = 'block';
            }
        });
    }
});

function abrirRankingTV() {
    // Ver TODOS los agentes del área (sin filtrar por líder)
    const url = `../tv-ranking.html?area=${currentUser.area}`;
    const ventana = window.open(url, '_blank');
    
    if (ventana) {
        ventana.focus();
    }
}

function openModal() {
    editingAgenteId = null;
    document.getElementById('modalTitle').textContent = 'Agregar Agente';
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
        document.getElementById('modalTitle').textContent = 'Editar Agente';
        document.getElementById('agenteNombre').value = data.nombre;
        document.getElementById('liderSelect').value = data.lider_id || '';
        document.getElementById('modalError').style.display = 'none';
        document.getElementById('agenteModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert(getMessage('load_agent_error') + ': ' + error.message);
    }
}

document.getElementById('agenteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('agenteNombre').value.trim();
    const liderID = document.getElementById('liderSelect').value;
    const modalError = document.getElementById('modalError');
    
    modalError.style.display = 'none';
    
    if (!liderID) {
        modalError.style.display = 'block';
        modalError.textContent = 'Error: Debe seleccionar un líder';
        return;
    }
    
    try {
        if (editingAgenteId) {
            const { error } = await supabaseClient
                .from('agentes')
                .update({ 
                    nombre: nombre,
                    lider_id: liderID
                })
                .eq('id', editingAgenteId);
            
            if (error) throw error;
            
            alert(getMessage('agent_updated'));
            
        } else {
            const { data: existingAgente } = await supabaseClient
                .from('agentes')
                .select('*')
                .eq('nombre', nombre)
                .eq('lider_id', liderID)
                .eq('area', currentUser.area)
                .maybeSingle();
            
            if (existingAgente) {
                if (!existingAgente.activo) {
                    const { error: reactivateError } = await supabaseClient
                        .from('agentes')
                        .update({ activo: true })
                        .eq('id', existingAgente.id);
                    
                    if (reactivateError) throw reactivateError;
                    
                    alert(getMessage('agent_updated'));
                } else {
                    throw new Error('Este agente ya existe y está activo');
                }
            } else {
                const { error: dbError } = await supabaseClient
                    .from('agentes')
                    .insert({
                        nombre: nombre,
                        area: currentUser.area,
                        lider_id: liderID
                    });
                
                if (dbError) throw dbError;
                
                alert(getMessage('agent_created'));
            }
        }
        
        closeModal();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarAgente(id, nombre) {
    if (!confirm(`¿Estás seguro de desactivar al agente ${nombre}?\n\nPodrás reactivarlo después si lo necesitas.`)) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('agentes')
            .update({ activo: false })
            .eq('id', id);
        
        if (error) throw error;
        
        alert(getMessage('agent_deleted'));
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// ============================================
// FUNCIONES PARA TARGETS
// ============================================

let targetAgenteId = null;

async function abrirTargetModal(agenteId, agenteNombre) {
    targetAgenteId = agenteId;
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    document.getElementById('targetModalTitle').textContent = 'Asignar Target del Mes';
    document.getElementById('targetAgente').value = agenteNombre;
    document.getElementById('targetMes').value = `${meses[mesActual - 1]} ${anioActual}`;
    
    if (currentUser.area === 'conversion') {
        document.getElementById('targetCantidadGroup').style.display = 'block';
        document.getElementById('targetMontoGroup').style.display = 'none';
        document.getElementById('targetCantidad').required = true;
        document.getElementById('targetMonto').required = false;
    } else {
        document.getElementById('targetCantidadGroup').style.display = 'none';
        document.getElementById('targetMontoGroup').style.display = 'block';
        document.getElementById('targetCantidad').required = false;
        document.getElementById('targetMonto').required = true;
    }
    
    // Cargar target actual si existe
    try {
        const { data: target, error } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', agenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        if (error) throw error;
        
        if (target) {
            if (currentUser.area === 'conversion') {
                document.getElementById('targetCantidad').value = target.target_cantidad || '';
            } else {
                document.getElementById('targetMonto').value = target.target_monto || '';
            }
        } else {
            document.getElementById('targetCantidad').value = '';
            document.getElementById('targetMonto').value = '';
        }
        
    } catch (error) {
        console.error('Error al cargar target:', error);
    }
    
    document.getElementById('targetModalError').style.display = 'none';
    document.getElementById('targetModal').style.display = 'block';
}

function closeTargetModal() {
    document.getElementById('targetModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const targetForm = document.getElementById('targetForm');
    if (targetForm) {
        targetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const modalError = document.getElementById('targetModalError');
            modalError.style.display = 'none';
            
            try {
                let targetData = {
                    agente_id: targetAgenteId,
                    mes: mesActual,
                    anio: anioActual
                };
                
                if (currentUser.area === 'conversion') {
                    targetData.target_cantidad = parseInt(document.getElementById('targetCantidad').value);
                    if (!targetData.target_cantidad || targetData.target_cantidad <= 0) {
                        throw new Error('El target de cantidad debe ser mayor a 0');
                    }
                } else {
                    targetData.target_monto = parseFloat(document.getElementById('targetMonto').value);
                    if (!targetData.target_monto || targetData.target_monto <= 0) {
                        throw new Error('El target de monto debe ser mayor a 0');
                    }
                }
                
                // Verificar si ya existe un target para este agente este mes
                const { data: existingTarget, error: checkError } = await supabaseClient
                    .from('targets_mensuales')
                    .select('*')
                    .eq('agente_id', targetAgenteId)
                    .eq('mes', mesActual)
                    .eq('anio', anioActual)
                    .maybeSingle();
                
                if (checkError) throw checkError;
                
                if (existingTarget) {
                    // UPDATE
                    const { error } = await supabaseClient
                        .from('targets_mensuales')
                        .update(targetData)
                        .eq('id', existingTarget.id);
                    
                    if (error) throw error;
                } else {
                    // INSERT
                    const { error } = await supabaseClient
                        .from('targets_mensuales')
                        .insert(targetData);
                    
                    if (error) throw error;
                }
                
                closeTargetModal();
                await cargarAgentes();
                alert(getMessage('target_assigned'));
                
            } catch (error) {
                console.error('Error:', error);
                modalError.style.display = 'block';
                modalError.textContent = `Error: ${error.message}`;
            }
        });
    }
});

// ============================================
// FUNCIONES PARA DEPÓSITO RÁPIDO
// ============================================

async function openDepositoRapido() {
    try {
        const { data: agentes, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        const select = document.getElementById('depositoAgente');
        select.innerHTML = '<option value="">-- Selecciona un agente --</option>';
        
        agentes.forEach(agente => {
            const option = document.createElement('option');
            option.value = agente.id;
            option.textContent = agente.nombre;
            select.appendChild(option);
        });
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('depositoRapidoFecha').value = today;
        
        document.getElementById('depositoRapidoForm').reset();
        document.getElementById('depositoRapidoFecha').value = today;
        document.getElementById('depositoRapidoError').style.display = 'none';
        document.getElementById('depositoRapidoModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert(getMessage('load_agent_error'));
    }
}

function closeDepositoRapido() {
    document.getElementById('depositoRapidoModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const depositoRapidoForm = document.getElementById('depositoRapidoForm');
    if (depositoRapidoForm) {
        depositoRapidoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const agenteId = document.getElementById('depositoAgente').value;
            const monto = parseFloat(document.getElementById('depositoRapidoMonto').value);
            const fecha = document.getElementById('depositoRapidoFecha').value;
            const modalError = document.getElementById('depositoRapidoError');
            
            modalError.style.display = 'none';
            
            try {
                const fechaObj = new Date(fecha + 'T00:00:00');
                const mes = fechaObj.getMonth() + 1;
                const anio = fechaObj.getFullYear();
                
                const { error } = await supabaseClient
                    .from('depositos')
                    .insert({
                        agente_id: agenteId,
                        monto: monto,
                        fecha: fecha,
                        mes: mes,
                        anio: anio
                    });
                
                if (error) throw error;
                
                alert(getMessage('deposit_created'));
                closeDepositoRapido();
                await cargarAgentes();
                
            } catch (error) {
                console.error('Error:', error);
                modalError.style.display = 'block';
                modalError.textContent = `Error: ${error.message}`;
            }
        });
    }
});

// ============================================
// FUNCIONES PARA REGISTRO RÁPIDO (LEADS)
// ============================================

async function openRegistroRapido() {
    try {
        const { data: agentes, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', currentUser.area)
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        const select = document.getElementById('registroAgente');
        select.innerHTML = '<option value="">-- Selecciona un agente --</option>';
        
        agentes.forEach(agente => {
            const option = document.createElement('option');
            option.value = agente.id;
            option.textContent = agente.nombre;
            select.appendChild(option);
        });
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('registroFecha').value = today;
        
        document.getElementById('registroRapidoForm').reset();
        document.getElementById('registroFecha').value = today;
        document.getElementById('registroRapidoError').style.display = 'none';
        document.getElementById('registroRapidoModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert(getMessage('load_agent_error'));
    }
}

function closeRegistroRapido() {
    document.getElementById('registroRapidoModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const registroRapidoForm = document.getElementById('registroRapidoForm');
    if (registroRapidoForm) {
        registroRapidoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const agenteId = document.getElementById('registroAgente').value;
            const fecha = document.getElementById('registroFecha').value;
            const modalError = document.getElementById('registroRapidoError');
            
            modalError.style.display = 'none';
            
            try {
                const fechaObj = new Date(fecha + 'T00:00:00');
                const mes = fechaObj.getMonth() + 1;
                const anio = fechaObj.getFullYear();
                
                const { error } = await supabaseClient
                    .from('registros')
                    .insert({
                        agente_id: agenteId,
                        fecha: fecha,
                        mes: mes,
                        anio: anio
                    });
                
                if (error) throw error;
                
                alert(getMessage('register_created'));
                closeRegistroRapido();
                await cargarAgentes();
                
            } catch (error) {
                console.error('Error:', error);
                modalError.style.display = 'block';
                modalError.textContent = `Error: ${error.message}`;
            }
        });
    }
});

// ============================================
// FUNCIONES PARA REGISTROS (LEADS)
// ============================================

let registroAgenteId = null;
let editingRegistroId = null;

async function verRegistros(agenteId, agenteNombre) {
    registroAgenteId = agenteId;
    document.getElementById('registrosAgenteNombre').textContent = agenteNombre;
    document.getElementById('registrosContainer').innerHTML = '<div class="empty-state">Cargando registros...</div>';
    document.getElementById('registrosModal').style.display = 'block';
    
    await cargarRegistrosAgente();
}

async function cargarRegistrosAgente() {
    try {
        const { data: registros, error } = await supabaseClient
            .from('registros')
            .select('*')
            .eq('agente_id', registroAgenteId)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        mostrarRegistrosAgente(registros || []);
        
    } catch (error) {
        console.error('Error al cargar registros:', error);
        document.getElementById('registrosContainer').innerHTML = 
            `<div class="empty-state">Error al cargar registros: ${error.message}</div>`;
    }
}

function mostrarRegistrosAgente(registros) {
    const container = document.getElementById('registrosContainer');
    
    if (registros.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay registros (leads) registrados</div>';
        return;
    }
    
    let html = '<h4 style="margin-top: 30px; margin-bottom: 15px;">Registros (Leads) Registrados:</h4>';
    
    registros.forEach(registro => {
        const fecha = new Date(registro.fecha).toLocaleDateString('es-ES');
        
        html += `
            <div class="deposito-item">
                <div class="deposito-info">
                    <div class="deposito-fecha">${fecha}</div>
                </div>
                <div class="deposito-actions">
                    <button type="button" class="btn-edit" onclick="editarRegistro('${registro.id}')">✏️</button>
                    <button type="button" class="btn-delete" onclick="eliminarRegistro('${registro.id}')">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function closeRegistrosModal() {
    document.getElementById('registrosModal').style.display = 'none';
    registroAgenteId = null;
    editingRegistroId = null;
}

async function agregarRegistroAgente() {
    editingRegistroId = null;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('registroEditFecha').value = today;
    document.getElementById('registroEditError').style.display = 'none';
    document.getElementById('registroEditModal').style.display = 'block';
}

async function editarRegistro(registroId) {
    try {
        const { data: registro, error } = await supabaseClient
            .from('registros')
            .select('*')
            .eq('id', registroId)
            .single();
        
        if (error) throw error;
        
        editingRegistroId = registro.id;
        const fecha = new Date(registro.fecha);
        const fechaFormato = fecha.toISOString().split('T')[0];
        document.getElementById('registroEditFecha').value = fechaFormato;
        document.getElementById('registroEditError').style.display = 'none';
        document.getElementById('registroEditModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error al cargar registro:', error);
        alert('Error: ' + error.message);
    }
}

function closeRegistroEditModal() {
    document.getElementById('registroEditModal').style.display = 'none';
    editingRegistroId = null;
}

async function eliminarRegistro(registroId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('registros')
            .delete()
            .eq('id', registroId);
        
        if (error) throw error;
        
        await cargarRegistrosAgente();
        
    } catch (error) {
        console.error('Error al eliminar registro:', error);
        alert('Error: ' + error.message);
    }
}

// Manejar envío del formulario de registros
document.addEventListener('DOMContentLoaded', function() {
    const registroEditForm = document.getElementById('registroEditForm');
    if (registroEditForm) {
        registroEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fecha = document.getElementById('registroEditFecha').value;
            const errorDiv = document.getElementById('registroEditError');
            
            if (!fecha) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Debes seleccionar una fecha';
                return;
            }
            
            try {
                if (editingRegistroId) {
                    // UPDATE
                    const { error } = await supabaseClient
                        .from('registros')
                        .update({
                            fecha,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', editingRegistroId);
                    
                    if (error) throw error;
                } else {
                    // INSERT
                    const now = new Date();
                    const { error } = await supabaseClient
                        .from('registros')
                        .insert({
                            agente_id: registroAgenteId,
                            fecha,
                            mes: now.getMonth() + 1,
                            anio: now.getFullYear(),
                            created_at: new Date().toISOString()
                        });
                    
                    if (error) throw error;
                }
                
                errorDiv.style.display = 'none';
                closeRegistroEditModal();
                await cargarRegistrosAgente();
                
            } catch (error) {
                console.error('Error al guardar registro:', error);
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Error: ' + error.message;
            }
        });
    }
});

async function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}


const { createClient } = supabase;
let supabaseClient;
let currentUser;
let editingAgenteId = null;
let targetAgenteId = null;
let depositosAgenteId = null;
let depositosAgenteNombre = null;
let editingDepositoId = null;
let registrosAgenteId = null;
let registrosAgenteNombre = null;
let editingRegistroId = null;
let mesActual, anioActual;

window.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = `📅 Mes Actual: ${meses[mesActual - 1]} ${anioActual}`;
    
    await verificarAcceso();
    await cargarAgentes();
});

async function verificarAcceso() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    if (currentUser.rol !== 'lider') {
        alert('No tienes acceso a esta página');
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('welcomeText').textContent = `Bienvenido, ${currentUser.nombre}`;
    
    const areaBadge = document.getElementById('areaBadge');
    const areaTexto = currentUser.area ? currentUser.area.charAt(0).toUpperCase() + currentUser.area.slice(1) : 'Sin área';
    areaBadge.textContent = `Área: ${areaTexto}`;
    areaBadge.classList.add(`area-${currentUser.area}`);
    
    if (currentUser.area === 'conversion') {
        document.getElementById('btnRegistroRapido').style.display = 'inline-block';
    }
}

async function cargarAgentes() {
    try {
        const { data: agentes, error: agentesError } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('lider_id', currentUser.id)
            .eq('activo', true)
            .order('nombre');
        
        if (agentesError) throw agentesError;
        
        const { data: targets, error: targetsError } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        if (targetsError) throw targetsError;
        
        const { data: depositos, error: depositosError } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        if (depositosError) throw depositosError;
        
        let registros = [];
        if (currentUser.area === 'conversion') {
            const { data: registrosData, error: registrosError } = await supabaseClient
                .from('registros')
                .select('*')
                .eq('mes', mesActual)
                .eq('anio', anioActual);
            
            if (registrosError) throw registrosError;
            registros = registrosData || [];
        }
        
        const agentesConDatos = agentes.map(agente => {
            const target = targets?.find(t => t.agente_id === agente.id);
            const depositosAgente = depositos?.filter(d => d.agente_id === agente.id) || [];
            const totalDepositos = depositosAgente.reduce((sum, d) => sum + parseFloat(d.monto), 0);
            const cantidadDepositos = depositosAgente.length;
            
            const registrosAgente = registros?.filter(r => r.agente_id === agente.id) || [];
            const cantidadRegistros = registrosAgente.length;
            
            return { 
                ...agente, 
                target,
                totalDepositos,
                cantidadDepositos,
                cantidadRegistros
            };
        });
        
        mostrarAgentes(agentesConDatos);
        
    } catch (error) {
        console.error('Error al cargar agentes:', error);
        document.getElementById('agentesContainer').innerHTML = 
            '<div class="empty-state">Error al cargar agentes</div>';
    }
}

function mostrarAgentes(agentes) {
    const container = document.getElementById('agentesContainer');
    
    if (!agentes || agentes.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay agentes registrados. Agrega el primero.</div>';
        return;
    }
    
    let headers = `
        <th>Nombre</th>
        <th>Área</th>
        <th>Target del Mes</th>
        <th>Depósitos del Mes</th>
    `;
    
    if (currentUser.area === 'conversion') {
        headers += '<th>Registros del Mes</th>';
    }
    
    headers += '<th>Acciones</th>';
    
    let html = `
        <table class="agentes-table">
            <thead>
                <tr>${headers}</tr>
            </thead>
            <tbody>
    `;
    
    agentes.forEach(agente => {
        const areaTexto = agente.area ? agente.area.charAt(0).toUpperCase() + agente.area.slice(1) : '';
        
        let targetTexto = '<span class="target-info">Sin target asignado</span>';
        if (agente.target) {
            if (currentUser.area === 'conversion') {
                targetTexto = `<strong>${agente.target.target_cantidad || 0}</strong> depósitos`;
            } else {
                targetTexto = `<strong>$${agente.target.target_monto || 0}</strong>`;
            }
        }
        
        let depositosTexto = '';
        if (currentUser.area === 'conversion') {
            depositosTexto = `<strong>${agente.cantidadDepositos}</strong> depósitos<br><span class="target-info">$${agente.totalDepositos.toFixed(2)}</span>`;
        } else {
            depositosTexto = `<strong>$${agente.totalDepositos.toFixed(2)}</strong>`;
        }
        
        let registrosTexto = '';
        if (currentUser.area === 'conversion') {
            registrosTexto = `<td><strong>${agente.cantidadRegistros}</strong> registros</td>`;
        }
        
        let botones = `
            <button class="btn-depositos" onclick="verDepositos('${agente.id}', '${agente.nombre}')">Depósitos</button>
        `;
        
        if (currentUser.area === 'conversion') {
            botones += `<button class="btn-registros" onclick="verRegistros('${agente.id}', '${agente.nombre}')">Registros</button>`;
        }
        
        botones += `
            <button class="btn-target" onclick="asignarTarget('${agente.id}', '${agente.nombre}')">Target</button>
            <button class="btn-edit" onclick="editarAgente('${agente.id}')">Editar</button>
            <button class="btn-delete" onclick="eliminarAgente('${agente.id}', '${agente.nombre}')">Eliminar</button>
        `;
        
        html += `
            <tr>
                <td>${agente.nombre}</td>
                <td>${areaTexto}</td>
                <td>${targetTexto}</td>
                <td>${depositosTexto}</td>
                ${registrosTexto}
                <td>${botones}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
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
        document.getElementById('modalError').style.display = 'none';
        document.getElementById('agenteModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del agente');
    }
}

document.getElementById('agenteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('agenteNombre').value.trim();
    const modalError = document.getElementById('modalError');
    
    modalError.style.display = 'none';
    
    try {
        if (editingAgenteId) {
            const { error } = await supabaseClient
                .from('agentes')
                .update({ nombre: nombre })
                .eq('id', editingAgenteId);
            
            if (error) throw error;
            
            alert('Agente actualizado exitosamente');
            
        } else {
            const { data: existingAgente } = await supabaseClient
                .from('agentes')
                .select('*')
                .eq('nombre', nombre)
                .eq('lider_id', currentUser.id)
                .eq('area', currentUser.area)
                .maybeSingle();
            
            if (existingAgente) {
                if (!existingAgente.activo) {
                    const { error: reactivateError } = await supabaseClient
                        .from('agentes')
                        .update({ activo: true })
                        .eq('id', existingAgente.id);
                    
                    if (reactivateError) throw reactivateError;
                    
                    alert('Agente reactivado exitosamente ✅');
                } else {
                    throw new Error('Este agente ya existe y está activo');
                }
            } else {
                const { error: dbError } = await supabaseClient
                    .from('agentes')
                    .insert({
                        nombre: nombre,
                        area: currentUser.area,
                        lider_id: currentUser.id
                    });
                
                if (dbError) throw dbError;
                
                alert('Agente creado exitosamente ✅');
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
        
        alert('Agente desactivado exitosamente');
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al desactivar agente: ' + error.message);
    }
}

async function asignarTarget(agenteId, agenteNombre) {
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
    
    try {
        const { data: targetActual } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', agenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        if (targetActual) {
            if (currentUser.area === 'conversion') {
                document.getElementById('targetCantidad').value = targetActual.target_cantidad || '';
            } else {
                document.getElementById('targetMonto').value = targetActual.target_monto || '';
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

document.getElementById('targetForm').addEventListener('submit', async (e) => {
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
            targetData.target_monto = null;
        } else {
            targetData.target_monto = parseFloat(document.getElementById('targetMonto').value);
            targetData.target_cantidad = null;
        }
        
        const { data: existingTarget } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('agente_id', targetAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .maybeSingle();
        
        if (existingTarget) {
            const { error } = await supabaseClient
                .from('targets_mensuales')
                .update(targetData)
                .eq('id', existingTarget.id);
            
            if (error) throw error;
            alert('Target actualizado exitosamente ✅');
        } else {
            const { error } = await supabaseClient
                .from('targets_mensuales')
                .insert(targetData);
            
            if (error) throw error;
            alert('Target asignado exitosamente ✅');
        }
        
        closeTargetModal();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function openDepositoRapido() {
    try {
        const { data: agentes, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('lider_id', currentUser.id)
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
        document.getElementById('depositoFecha').value = today;
        
        document.getElementById('depositoRapidoForm').reset();
        document.getElementById('depositoFecha').value = today;
        document.getElementById('depositoRapidoError').style.display = 'none';
        document.getElementById('depositoRapidoModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar agentes');
    }
}

function closeDepositoRapido() {
    document.getElementById('depositoRapidoModal').style.display = 'none';
}

document.getElementById('depositoRapidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const agenteId = document.getElementById('depositoAgente').value;
    const monto = parseFloat(document.getElementById('depositoMonto').value);
    const fecha = document.getElementById('depositoFecha').value;
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
        
        alert('Depósito registrado exitosamente ✅');
        closeDepositoRapido();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function verDepositos(agenteId, agenteNombre) {
    depositosAgenteId = agenteId;
    depositosAgenteNombre = agenteNombre;
    
    document.getElementById('depositosModalTitle').textContent = `Depósitos de ${agenteNombre}`;
    document.getElementById('depositosAgenteNombre').textContent = `Mes actual: ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    
    document.getElementById('depositosModal').style.display = 'block';
    
    await cargarDepositosAgente();
}

function closeDepositosModal() {
    document.getElementById('depositosModal').style.display = 'none';
}

async function cargarDepositosAgente() {
    try {
        const { data: depositos, error } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('agente_id', depositosAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        mostrarDepositosAgente(depositos);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('depositosContainer').innerHTML = 
            '<div class="empty-state">Error al cargar depósitos</div>';
    }
}

function mostrarDepositosAgente(depositos) {
    const container = document.getElementById('depositosContainer');
    
    if (!depositos || depositos.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay depósitos registrados este mes.</div>';
        return;
    }
    
    let html = '';
    let totalMonto = 0;
    
    depositos.forEach(deposito => {
        totalMonto += parseFloat(deposito.monto);
        const fechaFormateada = new Date(deposito.fecha + 'T00:00:00').toLocaleDateString('es-ES');
        
        html += `
            <div class="deposito-item">
                <div class="deposito-info">
                    <div class="deposito-monto">$${parseFloat(deposito.monto).toFixed(2)}</div>
                    <div class="deposito-fecha">📅 ${fechaFormateada}</div>
                </div>
                <div class="deposito-actions">
                    <button class="btn-edit" onclick="editarDeposito('${deposito.id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarDeposito('${deposito.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    html = `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 14px; color: #64748b;">Total del mes</div>
            <div style="font-size: 24px; font-weight: 700; color: #0f172a;">$${totalMonto.toFixed(2)}</div>
            <div style="font-size: 14px; color: #64748b;">${depositos.length} depósito(s)</div>
        </div>
    ` + html;
    
    container.innerHTML = html;
}

function agregarDepositoAgente() {
    editingDepositoId = null;
    document.getElementById('depositoEditTitle').textContent = `Agregar Depósito - ${depositosAgenteNombre}`;
    document.getElementById('depositoEditForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('depositoEditFecha').value = today;
    
    document.getElementById('depositoEditError').style.display = 'none';
    document.getElementById('depositoEditModal').style.display = 'block';
}

function closeDepositoEditModal() {
    document.getElementById('depositoEditModal').style.display = 'none';
}

async function editarDeposito(depositoId) {
    try {
        const { data, error } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('id', depositoId)
            .single();
        
        if (error) throw error;
        
        editingDepositoId = depositoId;
        document.getElementById('depositoEditTitle').textContent = `Editar Depósito - ${depositosAgenteNombre}`;
        document.getElementById('depositoEditMonto').value = data.monto;
        document.getElementById('depositoEditFecha').value = data.fecha;
        document.getElementById('depositoEditError').style.display = 'none';
        document.getElementById('depositoEditModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar depósito');
    }
}

document.getElementById('depositoEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const monto = parseFloat(document.getElementById('depositoEditMonto').value);
    const fecha = document.getElementById('depositoEditFecha').value;
    const modalError = document.getElementById('depositoEditError');
    
    modalError.style.display = 'none';
    
    try {
        const fechaObj = new Date(fecha + 'T00:00:00');
        const mes = fechaObj.getMonth() + 1;
        const anio = fechaObj.getFullYear();
        
        const depositoData = {
            monto: monto,
            fecha: fecha,
            mes: mes,
            anio: anio
        };
        
        if (editingDepositoId) {
            const { error } = await supabaseClient
                .from('depositos')
                .update(depositoData)
                .eq('id', editingDepositoId);
            
            if (error) throw error;
            
            alert('Depósito actualizado exitosamente ✅');
        } else {
            depositoData.agente_id = depositosAgenteId;
            
            const { error } = await supabaseClient
                .from('depositos')
                .insert(depositoData);
            
            if (error) throw error;
            
            alert('Depósito agregado exitosamente ✅');
        }
        
        closeDepositoEditModal();
        await cargarDepositosAgente();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarDeposito(depositoId) {
    if (!confirm('¿Estás seguro de eliminar este depósito?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('depositos')
            .delete()
            .eq('id', depositoId);
        
        if (error) throw error;
        
        alert('Depósito eliminado exitosamente');
        await cargarDepositosAgente();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar depósito: ' + error.message);
    }
}

async function openRegistroRapido() {
    try {
        const { data: agentes, error } = await supabaseClient
            .from('agentes')
            .select('*')
            .eq('lider_id', currentUser.id)
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
        alert('Error al cargar agentes');
    }
}

function closeRegistroRapido() {
    document.getElementById('registroRapidoModal').style.display = 'none';
}

document.getElementById('registroRapidoForm').addEventListener('submit', async (e) => {
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
        
        alert('Registro (Lead) registrado exitosamente ✅');
        closeRegistroRapido();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function verRegistros(agenteId, agenteNombre) {
    registrosAgenteId = agenteId;
    registrosAgenteNombre = agenteNombre;
    
    document.getElementById('registrosModalTitle').textContent = `Registros (Leads) de ${agenteNombre}`;
    document.getElementById('registrosAgenteNombre').textContent = `Mes actual: ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    
    document.getElementById('registrosModal').style.display = 'block';
    
    await cargarRegistrosAgente();
}

function closeRegistrosModal() {
    document.getElementById('registrosModal').style.display = 'none';
}

async function cargarRegistrosAgente() {
    try {
        const { data: registros, error } = await supabaseClient
            .from('registros')
            .select('*')
            .eq('agente_id', registrosAgenteId)
            .eq('mes', mesActual)
            .eq('anio', anioActual)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        mostrarRegistrosAgente(registros);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('registrosContainer').innerHTML = 
            '<div class="empty-state">Error al cargar registros</div>';
    }
}

function mostrarRegistrosAgente(registros) {
    const container = document.getElementById('registrosContainer');
    
    if (!registros || registros.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay registros (leads) este mes.</div>';
        return;
    }
    
    let html = '';
    
    registros.forEach(registro => {
        const fechaFormateada = new Date(registro.fecha + 'T00:00:00').toLocaleDateString('es-ES');
        
        html += `
            <div class="registro-item">
                <div class="deposito-info">
                    <div class="deposito-monto">📝 Registro (Lead)</div>
                    <div class="deposito-fecha">📅 ${fechaFormateada}</div>
                </div>
                <div class="deposito-actions">
                    <button class="btn-edit" onclick="editarRegistro('${registro.id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarRegistro('${registro.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    html = `
        <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 14px; color: #64748b;">Total del mes</div>
            <div style="font-size: 24px; font-weight: 700; color: #0f172a;">${registros.length}</div>
            <div style="font-size: 14px; color: #64748b;">registro(s) / lead(s)</div>
        </div>
    ` + html;
    
    container.innerHTML = html;
}

function agregarRegistroAgente() {
    editingRegistroId = null;
    document.getElementById('registroEditTitle').textContent = `Agregar Registro - ${registrosAgenteNombre}`;
    document.getElementById('registroEditForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('registroEditFecha').value = today;
    
    document.getElementById('registroEditError').style.display = 'none';
    document.getElementById('registroEditModal').style.display = 'block';
}

function closeRegistroEditModal() {
    document.getElementById('registroEditModal').style.display = 'none';
}

async function editarRegistro(registroId) {
    try {
        const { data, error } = await supabaseClient
            .from('registros')
            .select('*')
            .eq('id', registroId)
            .single();
        
        if (error) throw error;
        
        editingRegistroId = registroId;
        document.getElementById('registroEditTitle').textContent = `Editar Registro - ${registrosAgenteNombre}`;
        document.getElementById('registroEditFecha').value = data.fecha;
        document.getElementById('registroEditError').style.display = 'none';
        document.getElementById('registroEditModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar registro');
    }
}

document.getElementById('registroEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fecha = document.getElementById('registroEditFecha').value;
    const modalError = document.getElementById('registroEditError');
    
    modalError.style.display = 'none';
    
    try {
        const fechaObj = new Date(fecha + 'T00:00:00');
        const mes = fechaObj.getMonth() + 1;
        const anio = fechaObj.getFullYear();
        
        const registroData = {
            fecha: fecha,
            mes: mes,
            anio: anio
        };
        
        if (editingRegistroId) {
            const { error } = await supabaseClient
                .from('registros')
                .update(registroData)
                .eq('id', editingRegistroId);
            
            if (error) throw error;
            
            alert('Registro actualizado exitosamente ✅');
        } else {
            registroData.agente_id = registrosAgenteId;
            
            const { error } = await supabaseClient
                .from('registros')
                .insert(registroData);
            
            if (error) throw error;
            
            alert('Registro agregado exitosamente ✅');
        }
        
        closeRegistroEditModal();
        await cargarRegistrosAgente();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        modalError.style.display = 'block';
        modalError.textContent = `Error: ${error.message}`;
    }
});

async function eliminarRegistro(registroId) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) {
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('registros')
            .delete()
            .eq('id', registroId);
        
        if (error) throw error;
        
        alert('Registro eliminado exitosamente');
        await cargarRegistrosAgente();
        await cargarAgentes();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar registro: ' + error.message);
    }
}
function abrirRankingTV() {
    // Pasar el ID del líder en la URL para filtrar solo sus agentes
    const url = `../tv-ranking.html?area=${currentUser.area}&lider_id=${currentUser.id}`;
    const ventana = window.open(url, '_blank');
    
    if (ventana) {
        ventana.focus();
    }
}
async function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}



const { createClient } = supabase;
let supabaseClient;
let areaActual;
let mesActual, anioActual;
let agentesMap = {};
let liderId = null; // ID del líder para filtrar agentes

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando TV Ranking...');
    
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    // Obtener área y lider_id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    areaActual = urlParams.get('area') || 'conversion';
    liderId = urlParams.get('lider_id'); // Obtener ID del líder
    
    console.log('📍 Área:', areaActual);
    console.log('👤 Líder ID:', liderId || 'Todos los líderes');
    
    // Validar área
    if (!['conversion', 'retencion', 'recovery'].includes(areaActual)) {
        areaActual = 'conversion';
    }
    
    // Configurar colores según área
    document.body.classList.add(areaActual);
    
    // Configurar título según área
    const titulos = {
        'conversion': '🎯 RANKING CONVERSIÓN',
        'retencion': '🔄 RANKING RETENCIÓN',
        'recovery': '💰 RANKING RECOVERY'
    };
    
    let tituloBase = titulos[areaActual];
    
    // Si es el ranking de un líder específico, personalizar el título
    if (liderId) {
        const { data: lider } = await supabaseClient
            .from('usuarios')
            .select('nombre')
            .eq('id', liderId)
            .single();
        
        if (lider) {
            tituloBase = `${tituloBase} - ${lider.nombre}`;
        }
    }
    
    document.getElementById('areaTitle').textContent = tituloBase;
    
    // Configurar mes actual
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    console.log('📅 Mes:', mesActual, 'Año:', anioActual);
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = `${meses[mesActual - 1]} ${anioActual}`;
    
    // Actualizar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Cargar agentes map
    await cargarAgentesMap();
    
    // Cargar ranking inicial
    await cargarRanking();
    
    // Suscribirse a cambios en tiempo real
    suscribirseACambios();
    
    console.log('✅ TV Ranking inicializado correctamente');
});

function actualizarFechaHora() {
    const ahora = new Date();
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('fechaHora').textContent = ahora.toLocaleDateString('es-ES', opciones);
}

async function cargarAgentesMap() {
    try {
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', areaActual)
            .eq('activo', true);
        
        // Si hay lider_id, filtrar solo sus agentes
        if (liderId) {
            query = query.eq('lider_id', liderId);
        }
        
        const { data: agentes } = await query;
        
        agentes?.forEach(agente => {
            agentesMap[agente.id] = agente.nombre;
        });
        
        console.log('👥 Agentes cargados:', agentesMap);
    } catch (error) {
        console.error('❌ Error al cargar mapa de agentes:', error);
    }
}

function suscribirseACambios() {
    console.log('🔌 Suscribiéndose a cambios en tiempo real...');
    
    // Canal único para todo
    const canal = supabaseClient.channel('cambios-ranking');
    
    // Suscribirse a cambios en depósitos
    canal.on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'depositos'
        },
        async (payload) => {
            console.log('💰 Nuevo depósito detectado:', payload);
            
            const nuevoDeposito = payload.new;
            
            // Verificar que es del mes actual
            if (nuevoDeposito.mes === mesActual && nuevoDeposito.anio === anioActual) {
                console.log('✅ Depósito del mes actual');
                
                // Obtener info del agente
                let queryAgente = supabaseClient
                    .from('agentes')
                    .select('*')
                    .eq('id', nuevoDeposito.agente_id)
                    .eq('area', areaActual);
                
                // Si hay lider_id, verificar que el agente pertenece a este líder
                if (liderId) {
                    queryAgente = queryAgente.eq('lider_id', liderId);
                }
                
                const { data: agente } = await queryAgente.single();
                
                if (agente) {
                    console.log('🎉 Mostrando celebración para:', agente.nombre);
                    
                    // Mostrar celebración
                    mostrarCelebracion(agente.nombre, nuevoDeposito.monto);
                    
                    // Recargar ranking después de la animación
                    setTimeout(() => {
                        console.log('🔄 Recargando ranking...');
                        cargarRanking(nuevoDeposito.agente_id);
                    }, 1000);
                } else {
                    console.log('⚠️ Depósito de otro líder o área');
                }
            } else {
                console.log('⚠️ Depósito de otro mes/año');
            }
        }
    );
    
    // Suscribirse a cambios en registros (para conversión)
    if (areaActual === 'conversion') {
        canal.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'registros'
            },
            async (payload) => {
                console.log('📝 Nuevo registro detectado:', payload);
                
                const nuevoRegistro = payload.new;
                
                if (nuevoRegistro.mes === mesActual && nuevoRegistro.anio === anioActual) {
                    let queryAgente = supabaseClient
                        .from('agentes')
                        .select('*')
                        .eq('id', nuevoRegistro.agente_id)
                        .eq('area', areaActual);
                    
                    // Si hay lider_id, verificar que el agente pertenece a este líder
                    if (liderId) {
                        queryAgente = queryAgente.eq('lider_id', liderId);
                    }
                    
                    const { data: agente } = await queryAgente.single();
                    
                    if (agente) {
                        console.log('🎉 Mostrando celebración de registro para:', agente.nombre);
                        mostrarCelebracionRegistro(agente.nombre);
                        setTimeout(() => {
                            cargarRanking(nuevoRegistro.agente_id);
                        }, 1000);
                    }
                }
            }
        );
    }
    
    // Suscribirse a cambios en targets
    canal.on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'targets_mensuales'
        },
        () => {
            console.log('🎯 Target actualizado, recargando...');
            cargarRanking();
        }
    );
    
    // Suscribir el canal
    canal.subscribe((status) => {
        console.log('📡 Estado de suscripción:', status);
        
        if (status === 'SUBSCRIBED') {
            console.log('✅ Suscrito exitosamente a cambios en tiempo real');
        } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Error en la suscripción');
        } else if (status === 'TIMED_OUT') {
            console.error('⏱️ Timeout en la suscripción');
        }
    });
}

function mostrarCelebracion(nombreAgente, monto) {
    console.log('🎊 Lanzando celebración...');
    
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-deposito';
    notificacion.innerHTML = `
        <div class="emoji">🎉</div>
        <h2>¡NUEVO DEPÓSITO!</h2>
        <p>${nombreAgente}</p>
        <div class="monto">$${parseFloat(monto).toFixed(2)}</div>
    `;
    document.body.appendChild(notificacion);
    
    // Reproducir sonido de celebración desde archivo
    reproducirSonidoCelebracion();
    
    // Confetti
    lanzarConfetti();
    
    // Eliminar después de la animación
    setTimeout(() => {
        notificacion.remove();
    }, 5000);
}

function mostrarCelebracionRegistro(nombreAgente) {
    console.log('📝 Lanzando celebración de registro...');
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-deposito';
    notificacion.innerHTML = `
        <div class="emoji">📝</div>
        <h2>¡NUEVO REGISTRO!</h2>
        <p>${nombreAgente}</p>
        <div class="monto">+1 Lead</div>
    `;
    document.body.appendChild(notificacion);
    
    // Reproducir sonido de celebración desde archivo
    reproducirSonidoCelebracion();
    
    lanzarConfetti();
    
    setTimeout(() => {
        notificacion.remove();
    }, 5000);
}

// Función para reproducir sonido desde archivo MP3
function reproducirSonidoCelebracion() {
    try {
        // Crear nuevo objeto de audio
        const audio = new Audio('assets/sounds/celebration.mp3');
        
        // Configurar volumen (0.0 a 1.0)
        audio.volume = 0.6; // 60% del volumen
        
        // Reproducir el audio
        audio.play().catch(error => {
            console.warn('⚠️ No se pudo reproducir el sonido:', error);
            // Algunos navegadores bloquean la reproducción automática de audio
            // hasta que el usuario interactúe con la página
        });
        
        console.log('🔊 Sonido de celebración reproducido desde archivo MP3');
        
    } catch (error) {
        console.warn('⚠️ Error al cargar el archivo de audio:', error);
    }
}

function lanzarConfetti() {
    const duracion = 5000;
    const finalizacion = Date.now() + duracion;
    
    const intervalo = setInterval(() => {
        const tiempoRestante = finalizacion - Date.now();
        
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            return;
        }
        
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#10b981', '#059669', '#34d399']
        });
        
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#10b981', '#059669', '#34d399']
        });
    }, 50);
    
    // Explosión central
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#6ee7b7']
    });
}

async function cargarRanking(agenteIdNuevo = null) {
    try {
        console.log('📊 Cargando ranking...');
        console.log('🔍 Filtrar por líder:', liderId || 'No (todos los líderes)');
        
        // Cargar agentes del área (filtrar por líder si viene en la URL)
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', areaActual)
            .eq('activo', true);
        
        // Si hay lider_id, filtrar solo sus agentes
        if (liderId) {
            query = query.eq('lider_id', liderId);
        }
        
        const { data: agentes, error: agentesError } = await query.order('nombre');
        
        if (agentesError) throw agentesError;
        
        console.log('👥 Agentes encontrados:', agentes?.length || 0);
        
        // Cargar targets
        const { data: targets, error: targetsError } = await supabaseClient
            .from('targets_mensuales')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        if (targetsError) throw targetsError;
        
        // Cargar depósitos
        const { data: depositos, error: depositosError } = await supabaseClient
            .from('depositos')
            .select('*')
            .eq('mes', mesActual)
            .eq('anio', anioActual);
        
        if (depositosError) throw depositosError;
        
        console.log('💰 Depósitos encontrados:', depositos?.length || 0);
        
        // Cargar registros (solo para conversión)
        let registros = [];
        if (areaActual === 'conversion') {
            const { data: registrosData, error: registrosError } = await supabaseClient
                .from('registros')
                .select('*')
                .eq('mes', mesActual)
                .eq('anio', anioActual);
            
            if (registrosError) throw registrosError;
            registros = registrosData || [];
            
            console.log('📝 Registros encontrados:', registros.length);
        }
        
        // Procesar datos
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
            
            if (areaActual === 'conversion') {
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
                id: agente.id,
                nombre: agente.nombre,
                target: targetValor,
                actual: actualValor,
                porcentaje: Math.round(porcentaje * 100) / 100,
                cantidadDepositos,
                totalDepositos,
                cantidadRegistros
            };
        });
        
        // Ordenar por total ingresado/cantidad (del más alto al más bajo)
        ranking.sort((a, b) => b.actual - a.actual);
        
        // Calcular total de ingresos
        const totalIngresos = ranking.reduce((sum, agente) => sum + agente.totalDepositos, 0);
        document.getElementById('totalIngresos').textContent = `$${totalIngresos.toFixed(2)}`;
        
        mostrarRanking(ranking, agenteIdNuevo);
        
        // Actualizar última actualización
        const ahora = new Date();
        document.getElementById('ultimaActualizacion').textContent = 
            ahora.toLocaleTimeString('es-ES');
        
    } catch (error) {
        console.error('❌ Error al cargar ranking:', error);
        document.getElementById('rankingContainer').innerHTML = 
            '<div class="empty-state">❌ Error al cargar ranking</div>';
    }
}

function mostrarRanking(ranking, agenteIdNuevo = null) {
    const container = document.getElementById('rankingContainer');
    
    if (!ranking || ranking.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No hay agentes en esta área</div>';
        return;
    }
    
    let html = '<div class="ranking-grid">';
    
    ranking.forEach((agente, index) => {
        const posicion = index + 1;
        let claseTop = '';
        let medal = '';
        
        if (posicion === 1) {
            claseTop = 'top-1';
            medal = '👑';
        } else if (posicion === 2) {
            claseTop = 'top-2';
            medal = '🥈';
        } else if (posicion === 3) {
            claseTop = 'top-3';
            medal = '🥉';
        }
        
        // Agregar clase de nuevo depósito si es el agente que acaba de depositar
        if (agenteIdNuevo && agente.id === agenteIdNuevo) {
            claseTop += ' nuevo-deposito';
        }
        
        let clasePorcentaje = 'bajo';
        if (agente.porcentaje >= 100) clasePorcentaje = 'excelente';
        else if (agente.porcentaje >= 70) clasePorcentaje = 'bueno';
        
        // Iniciales del nombre
        const iniciales = agente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        let targetTexto = '';
        let actualTexto = '';
        
        if (areaActual === 'conversion') {
            targetTexto = `${agente.target}`;
            actualTexto = `${agente.actual} (${agente.totalDepositos > 0 ? `$${agente.totalDepositos.toFixed(0)}` : '$0'})`;
        } else {
            targetTexto = `$${agente.target.toFixed(0)}`;
            actualTexto = `$${agente.actual.toFixed(0)}`;
        }
        
        // Limitar el ancho de la barra de progreso
        const progressWidth = Math.min(agente.porcentaje, 100);
        
        html += `
            <div class="ranking-card ${claseTop}" data-agente-id="${agente.id}">
                ${medal ? `<div class="medal">${medal}</div>` : ''}
                
                <div class="card-header">
                    <div class="posicion-badge ${posicion > 3 ? 'other' : ''}">#${posicion}</div>
                    <div class="avatar">${iniciales}</div>
                    <div class="agente-info">
                        <div class="agente-nombre">${agente.nombre}</div>
                        <div class="agente-stats">
                            ${areaActual === 'conversion' ? 
                                `<span>💰 ${agente.cantidadDepositos} depósitos</span>
                                 <span>📝 ${agente.cantidadRegistros} leads</span>` : 
                                `<span>💰 ${agente.cantidadDepositos} depósitos</span>`
                            }
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">Target</div>
                        <div class="stat-value">${targetTexto}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Actual</div>
                        <div class="stat-value">${actualTexto}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Progreso</div>
                        <div class="stat-value progress-percentage ${clasePorcentaje}">${agente.porcentaje}%</div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill ${clasePorcentaje}" style="width: ${progressWidth}%"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

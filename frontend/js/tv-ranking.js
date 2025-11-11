const { createClient } = supabase;
let supabaseClient;
let areaActual;
let mesActual, anioActual;
let agentesMap = {};
let liderId = null;

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando TV Ranking...');
    
    supabaseClient = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
    
    const urlParams = new URLSearchParams(window.location.search);
    areaActual = urlParams.get('area') || 'conversion';
    liderId = urlParams.get('lider_id');
    
    console.log('📍 Área:', areaActual);
    console.log('👤 Líder ID:', liderId || 'Todos los líderes');
    
    if (!['conversion', 'retencion', 'recovery'].includes(areaActual)) {
        areaActual = 'conversion';
    }
    
    document.body.classList.add(areaActual);
    
    // Aplicar traducciones
    applyTranslations();
    
    // Configurar mes actual
    const now = new Date();
    mesActual = now.getMonth() + 1;
    anioActual = now.getFullYear();
    
    console.log('📅 Mes:', mesActual, 'Año:', anioActual);
    
    const meses = i18n.getMonths();
    document.getElementById('mesActual').textContent = `${meses[mesActual - 1]} ${anioActual}`;
    
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    await cargarAgentesMap();
    await cargarRanking();
    suscribirseACambios();
    
    console.log('✅ TV Ranking inicializado correctamente');
});

function applyTranslations() {
    const titulos = {
        'conversion': `🎯 ${i18n.t('ranking_conversion')}`,
        'retencion': `🔄 ${i18n.t('ranking_retention')}`,
        'recovery': `💰 ${i18n.t('ranking_recovery')}`
    };
    
    let tituloBase = titulos[areaActual];
    document.getElementById('areaTitle').textContent = tituloBase;
    
    document.getElementById('liveText').textContent = i18n.t('live');
    document.getElementById('lastUpdateLabel').textContent = i18n.t('last_update');
}

function actualizarFechaHora() {
    const ahora = new Date();
    document.getElementById('fechaHora').textContent = i18n.formatDate(ahora);
}

async function cargarAgentesMap() {
    try {
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', areaActual)
            .eq('activo', true);
        
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
    
    const canal = supabaseClient.channel('cambios-ranking');
    
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
            
            if (nuevoDeposito.mes === mesActual && nuevoDeposito.anio === anioActual) {
                console.log('✅ Depósito del mes actual');
                
                let queryAgente = supabaseClient
                    .from('agentes')
                    .select('*')
                    .eq('id', nuevoDeposito.agente_id)
                    .eq('area', areaActual);
                
                if (liderId) {
                    queryAgente = queryAgente.eq('lider_id', liderId);
                }
                
                const { data: agente } = await queryAgente.single();
                
                if (agente) {
                    console.log('🎉 Mostrando celebración para:', agente.nombre);
                    mostrarCelebracion(agente.nombre, nuevoDeposito.monto);
                    
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
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-deposito';
    notificacion.innerHTML = `
        <div class="emoji">🎉</div>
        <h2>${i18n.t('new_deposit')}</h2>
        <p>${nombreAgente}</p>
        <div class="monto">$${parseFloat(monto).toFixed(2)}</div>
    `;
    document.body.appendChild(notificacion);
    
    reproducirSonidoCelebracion();
    lanzarConfetti();
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function mostrarCelebracionRegistro(nombreAgente) {
    console.log('📝 Lanzando celebración de registro...');
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-deposito';
    notificacion.innerHTML = `
        <div class="emoji">📝</div>
        <h2>${i18n.t('new_registration')}</h2>
        <p>${nombreAgente}</p>
        <div class="monto">+1 ${i18n.t('lead')}</div>
    `;
    document.body.appendChild(notificacion);
    
    reproducirSonidoCelebracion();
    lanzarConfetti();
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function reproducirSonidoCelebracion() {
    try {
        const audio = new Audio('assets/sounds/celebration.mp3');
        audio.volume = 0.6;
        audio.play().catch(error => {
            console.warn('⚠️ No se pudo reproducir el sonido:', error);
        });
        
        console.log('🔊 Sonido de celebración reproducido desde archivo MP3');
        
    } catch (error) {
        console.warn('⚠️ Error al cargar el archivo de audio:', error);
    }
}

function lanzarConfetti() {
    const duracion = 3000;
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
        
        let query = supabaseClient
            .from('agentes')
            .select('*')
            .eq('area', areaActual)
            .eq('activo', true);
        
        if (liderId) {
            query = query.eq('lider_id', liderId);
        }
        
        const { data: agentes, error: agentesError } = await query.order('nombre');
        
        if (agentesError) throw agentesError;
        
        console.log('👥 Agentes encontrados:', agentes?.length || 0);
        
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
        
        console.log('💰 Depósitos encontrados:', depositos?.length || 0);
        
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
        
        ranking.sort((a, b) => b.actual - a.actual);
        
        console.log('✅ Ranking procesado:', ranking.length, 'agentes');
        
        mostrarRanking(ranking, agenteIdNuevo);
        
        const ahora = new Date();
        document.getElementById('ultimaActualizacion').textContent = 
            ahora.toLocaleTimeString('es-ES');
        
    } catch (error) {
        console.error('❌ Error al cargar ranking:', error);
        document.getElementById('rankingContainer').innerHTML = 
            `<div class="empty-state">❌ ${i18n.t('error_loading')}</div>`;
    }
}

function mostrarRanking(ranking, agenteIdNuevo = null) {
    const container = document.getElementById('rankingContainer');
    
    if (!ranking || ranking.length === 0) {
        container.innerHTML = `<div class="empty-state">📭 ${i18n.t('no_agents')}</div>`;
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
        
        if (agenteIdNuevo && agente.id === agenteIdNuevo) {
            claseTop += ' nuevo-deposito';
        }
        
        let clasePorcentaje = 'bajo';
        if (agente.porcentaje >= 100) clasePorcentaje = 'excelente';
        else if (agente.porcentaje >= 70) clasePorcentaje = 'bueno';
        
        const iniciales = agente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        let targetTexto = '';
        let actualTexto = '';
        
        if (areaActual === 'conversion') {
            targetTexto = `${agente.target}`;
            actualTexto = `${agente.actual}`;
        } else {
            targetTexto = `$${agente.target.toFixed(0)}`;
            actualTexto = `$${agente.actual.toFixed(0)}`;
        }
        
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
                                `<span>💰 ${agente.cantidadDepositos} ${i18n.t('deposits').toLowerCase()}</span>
                                 <span>📝 ${agente.cantidadRegistros} leads</span>` : 
                                `<span>💰 ${agente.cantidadDepositos} ${i18n.t('deposits').toLowerCase()}</span>`
                            }
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">${i18n.t('target')}</div>
                        <div class="stat-value">${targetTexto}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">${i18n.t('current')}</div>
                        <div class="stat-value">${actualTexto}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">${i18n.t('progress')}</div>
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
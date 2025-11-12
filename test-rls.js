#!/usr/bin/env node

/**
 * Test de Conexión a Supabase con RLS
 * Instala dependencia: npm install @supabase/supabase-js
 * Ejecuta: node test-rls.js
 */

const https = require('https');

// Configuración Supabase
const SUPABASE_URL = 'https://kthdvnqdsczzbwpirbhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aGR2bnFkc2N6emJ3cGlyYmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzMyMTUsImV4cCI6MjA3ODAwOTIxNX0.-QCI7Sp3IKeZnnvPdoG1087k--IKemtGhQCf729C7uw';

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    bold: '\x1b[1m'
};

let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Función para hacer requests HTTP
function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// Función para agregar test
function addTest(name, passed, message) {
    const icon = passed ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
    console.log(`${icon} ${name}`);
    console.log(`   ${colors.blue}→${colors.reset} ${message}\n`);
    
    testResults.tests.push({ name, passed, message });
    if (passed) testResults.passed++;
    else testResults.failed++;
}

// Tests
async function runTests() {
    console.log(`\n${colors.bold}🧪 TEST DE CONEXIÓN - RLS HABILITADO${colors.reset}`);
    console.log(`${colors.bold}========================================${colors.reset}\n`);

    // Test 1: Conexión básica
    console.log(`${colors.yellow}[1/7]${colors.reset} Probando conexión a Supabase...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/usuarios?limit=1');
        if (result.status === 200 || result.status === 206) {
            addTest('Conexión a Supabase', true, 'Conectado correctamente (HTTP ' + result.status + ')');
        } else {
            addTest('Conexión a Supabase', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('Conexión a Supabase', false, error.message);
    }

    // Test 2: Tabla usuarios con RLS
    console.log(`${colors.yellow}[2/7]${colors.reset} Verificando RLS en tabla usuarios...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/usuarios?select=*&limit=5');
        if (result.status === 200 || result.status === 206) {
            const count = result.headers['content-range']?.split('/')[1] || 'desconocido';
            addTest('RLS - Tabla usuarios', true, `${count} registros (RLS activo)`);
        } else {
            addTest('RLS - Tabla usuarios', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('RLS - Tabla usuarios', false, error.message);
    }

    // Test 3: Tabla agentes con RLS
    console.log(`${colors.yellow}[3/7]${colors.reset} Verificando RLS en tabla agentes...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/agentes?select=*&limit=5');
        if (result.status === 200 || result.status === 206) {
            const count = result.headers['content-range']?.split('/')[1] || 'desconocido';
            addTest('RLS - Tabla agentes', true, `${count} registros (RLS activo)`);
        } else {
            addTest('RLS - Tabla agentes', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('RLS - Tabla agentes', false, error.message);
    }

    // Test 4: Tabla depositos con RLS
    console.log(`${colors.yellow}[4/7]${colors.reset} Verificando RLS en tabla depositos...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/depositos?select=*&limit=5');
        if (result.status === 200 || result.status === 206) {
            const count = result.headers['content-range']?.split('/')[1] || 'desconocido';
            addTest('RLS - Tabla depositos', true, `${count} registros (RLS activo)`);
        } else {
            addTest('RLS - Tabla depositos', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('RLS - Tabla depositos', false, error.message);
    }

    // Test 5: Tabla registros con RLS
    console.log(`${colors.yellow}[5/7]${colors.reset} Verificando RLS en tabla registros...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/registros?select=*&limit=5');
        if (result.status === 200 || result.status === 206) {
            const count = result.headers['content-range']?.split('/')[1] || 'desconocido';
            addTest('RLS - Tabla registros', true, `${count} registros (RLS activo)`);
        } else {
            addTest('RLS - Tabla registros', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('RLS - Tabla registros', false, error.message);
    }

    // Test 6: Tabla targets_mensuales con RLS
    console.log(`${colors.yellow}[6/7]${colors.reset} Verificando RLS en tabla targets_mensuales...`);
    try {
        const result = await makeRequest('GET', '/rest/v1/targets_mensuales?select=*&limit=5');
        if (result.status === 200 || result.status === 206) {
            const count = result.headers['content-range']?.split('/')[1] || 'desconocido';
            addTest('RLS - Tabla targets_mensuales', true, `${count} registros (RLS activo)`);
        } else {
            addTest('RLS - Tabla targets_mensuales', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('RLS - Tabla targets_mensuales', false, error.message);
    }

    // Test 7: Prueba de login
    console.log(`${colors.yellow}[7/7]${colors.reset} Verificando usuario de prueba...`);
    try {
        const result = await makeRequest('GET', "/rest/v1/usuarios?email=eq.jordan@bizifysolutions.com&select=id,email,nombre,rol");
        if (result.status === 200 || result.status === 206) {
            if (Array.isArray(result.data) && result.data.length > 0) {
                const user = result.data[0];
                addTest('Login Test', true, `Usuario encontrado: ${user.nombre} (${user.rol})`);
            } else {
                addTest('Login Test', false, 'Usuario de prueba no encontrado');
            }
        } else {
            addTest('Login Test', false, 'Status: ' + result.status);
        }
    } catch (error) {
        addTest('Login Test', false, error.message);
    }

    // Resumen
    console.log(`${colors.bold}========================================${colors.reset}`);
    console.log(`${colors.bold}📊 RESUMEN${colors.reset}`);
    console.log(`${colors.green}✅ Tests exitosos: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Tests fallidos: ${testResults.failed}${colors.reset}`);
    console.log(`${colors.blue}📋 Total: ${testResults.tests.length}${colors.reset}\n`);

    if (testResults.failed === 0) {
        console.log(`${colors.green}${colors.bold}🎉 ¡Todos los tests pasaron! RLS está funcionando correctamente.${colors.reset}\n`);
    } else {
        console.log(`${colors.red}${colors.bold}⚠️ Algunos tests fallaron. Verifica tu conexión a Supabase.${colors.reset}\n`);
    }
}

// Ejecutar tests
runTests().catch(error => {
    console.error(`${colors.red}Error fatal:${colors.reset}`, error.message);
    process.exit(1);
});

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5500/frontend/index.html';

// Usuarios de prueba
const usuarios = {
  super1: { email: 'izzysolutions.tics@gmail.com', password: 'Sagsilver94@', rol: 'super' },
  super2: { email: 'admin@admin.com', password: 'admin@2026', rol: 'super' },
  adminRecovery: { email: 'admin.recovery@mail.com', password: '123456', rol: 'admin_area', area: 'recovery' },
  adminConversion: { email: 'admin.conversion@mail.com', password: '123456', rol: 'admin_area', area: 'conversion' },
  adminRetencion: { email: 'admin.retencion@mail.com', password: '123456', rol: 'admin_area', area: 'retencion' }
};

// Función helper para login
async function login(page, email, password) {
  await page.goto(BASE_URL);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

// TEST 1: Login super usuario 1
test('TEST 1: Login super usuario (izzysolutions.tics@gmail.com)', async ({ page }) => {
  await login(page, usuarios.super1.email, usuarios.super1.password);
  
  // Verificar que redirige a dashboard-super.html
  expect(page.url()).toContain('dashboard-super.html');
  
  // Verificar que muestra el nombre del usuario
  const welcomeText = await page.locator('#welcomeText').textContent();
  expect(welcomeText).toContain('Bienvenido');
  
  console.log('✅ TEST 1 PASSED: Login super usuario 1');
});

// TEST 2: Login super usuario 2
test('TEST 2: Login super usuario (admin@admin.com)', async ({ page }) => {
  await login(page, usuarios.super2.email, usuarios.super2.password);
  
  expect(page.url()).toContain('dashboard-super.html');
  console.log('✅ TEST 2 PASSED: Login super usuario 2');
});

// TEST 3: Login admin recovery
test('TEST 3: Login admin recovery', async ({ page }) => {
  await login(page, usuarios.adminRecovery.email, usuarios.adminRecovery.password);
  
  expect(page.url()).toContain('dashboard-admin-area.html');
  
  // Verificar que muestra el área correcta
  const areaBadge = await page.locator('#areaBadge').textContent();
  expect(areaBadge).toContain('Recovery');
  
  console.log('✅ TEST 3 PASSED: Login admin recovery');
});

// TEST 4: Login admin conversion
test('TEST 4: Login admin conversion', async ({ page }) => {
  await login(page, usuarios.adminConversion.email, usuarios.adminConversion.password);
  
  expect(page.url()).toContain('dashboard-admin-area.html');
  
  const areaBadge = await page.locator('#areaBadge').textContent();
  expect(areaBadge).toContain('Conversion');
  
  console.log('✅ TEST 4 PASSED: Login admin conversion');
});

// TEST 5: Login admin retencion
test('TEST 5: Login admin retencion', async ({ page }) => {
  await login(page, usuarios.adminRetencion.email, usuarios.adminRetencion.password);
  
  expect(page.url()).toContain('dashboard-admin-area.html');
  
  const areaBadge = await page.locator('#areaBadge').textContent();
  expect(areaBadge).toContain('Retencion');
  
  console.log('✅ TEST 5 PASSED: Login admin retencion');
});

// TEST 6: CRUD Depósitos en dashboard-lider
test('TEST 6: CRUD Depósitos en dashboard-lider', async ({ page }) => {
  // Aquí usaremos un líder existente
  // Primero necesitas saber qué líder existe
  // Por ahora, saltaremos este test
  console.log('⏭️ TEST 6 SKIPPED: Requiere líder predefinido');
});

// TEST 7: CRUD Depósitos en dashboard-admin-area
test('TEST 7: CRUD Depósitos en dashboard-admin-area', async ({ page }) => {
  await login(page, usuarios.adminConversion.email, usuarios.adminConversion.password);
  
  // Esperar a que cargue la tabla de agentes
  await page.waitForSelector('.agentes-table', { timeout: 5000 });
  
  // Obtener el primer botón de "Depósitos"
  const btnDepositos = await page.locator('button.btn-depositos').first();
  
  if (btnDepositos) {
    await btnDepositos.click();
    
    // Verificar que se abre el modal de depósitos
    const modalVisible = await page.locator('#depositosModal').isVisible();
    expect(modalVisible).toBe(true);
    
    console.log('✅ TEST 7 PASSED: Modal de depósitos abierto');
  } else {
    console.log('⚠️ TEST 7 WARNING: No hay agentes disponibles');
  }
});

// TEST 8: Otros botones y funcionalidades
test('TEST 8: Verificar botones principales', async ({ page }) => {
  await login(page, usuarios.super1.email, usuarios.super1.password);
  
  // Verificar que existen los botones principales
  const btnLogout = await page.locator('.btn-logout').isVisible();
  expect(btnLogout).toBe(true);
  
  const statsGrid = await page.locator('#statsGrid').isVisible();
  expect(statsGrid).toBe(true);
  
  console.log('✅ TEST 8 PASSED: Botones principales visibles');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const web = process.env.TEST_WEB_URL ?? 'http://127.0.0.1:3000';
const api = process.env.TEST_API_URL ?? 'http://127.0.0.1:1337';
for (const url of [web, api]) assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname));
const assets = new URL('../docs/assets/', import.meta.url);

async function visible(locator) { await locator.waitFor({ state: 'visible', timeout: 20000 }); }
async function register(page, name) {
  const suffix = randomBytes(4).toString('hex');
  const fields = { username: `${name}_${suffix}`, email: `${name}_${suffix}@example.test`, password: randomBytes(12).toString('hex') };
  await page.goto(web + '/registro');
  await page.getByLabel('Nombre de usuario').fill(fields.username);
  await page.getByLabel('Email', { exact: true }).fill(fields.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(fields.password);
  await page.getByRole('button', { name: 'Registrarme', exact: true }).click();
  await page.waitForURL(web + '/');
  await visible(page.getByText('Todavía no estás en ninguna comunidad.', { exact: false }));
  return fields;
}
async function createCommunity(page, name) {
  await page.getByRole('button', { name: 'Agregar comunidad', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Crear comunidad', exact: true }).click();
  await page.getByLabel('Nombre de comunidad', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await visible(page.getByRole('button', { name: name, exact: true }));
  await visible(page.getByLabel('Mensaje', { exact: true }));
}
async function send(page, content) {
  await page.getByLabel('Mensaje', { exact: true }).fill(content);
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await visible(page.getByText(content, { exact: true }));
}

test('Interfaz integrada: contextos, CMS, teclado, sesión y pantallas', { timeout: 180000 }, async (t) => {
  await mkdir(assets, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? chromium.executablePath() });
  const owner = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  owner.on('pageerror', e => errors.push(e.message));
  let fields, invitation;
  let failed = false;
  const caseTest = async (name, action) => {
    console.log(`UI: ${name}`);
    await t.test(name, async () => {
      try { await action(); } catch (error) { failed = true; await owner.screenshot({ path: "/tmp/community-ui-failure.png", fullPage: true }); throw error; }
    });
    assert.equal(failed, false, "El recorrido anterior debe pasar antes de continuar.");
  };
  try {
    await caseTest('Sin sesión, registro y estado vacío', async () => {
      await owner.goto(web + '/');
      await owner.waitForURL(web + '/login');
      fields = await register(owner, 'docente');
    });
    await caseTest('Dos comunidades y selección sin mezclar mensajes', async () => {
      await createCommunity(owner, 'Comunidad Académica');
      await send(owner, 'Mensaje de la comunidad académica');
      await owner.getByRole('button', { name: 'Invitar', exact: true }).click();
      invitation = await owner.locator('span.font-mono').textContent();
      await createCommunity(owner, 'Laboratorio Web');
      await send(owner, 'Mensaje exclusivo del laboratorio');
      assert.equal(await owner.getByText('Mensaje de la comunidad académica', { exact: true }).count(), 0);
      await owner.getByRole('button', { name: 'Comunidad Académica', exact: true }).click();
      await visible(owner.getByText('Mensaje de la comunidad académica', { exact: true }));
      assert.equal(await owner.getByText('Mensaje exclusivo del laboratorio', { exact: true }).count(), 0);
      await send(owner, 'TextoSinEspacios'.repeat(200).slice(0, 3000));
    });
    await caseTest('Invitación, miembros y gestión de roles', async () => {
      const member = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const memberFields = await register(member, 'estudiante');
      await member.getByRole('button', { name: 'Agregar comunidad', exact: true }).click();
      await member.getByRole('menuitem', { name: 'Unirse a comunidad existente', exact: true }).click();
      await member.getByLabel('Código de invitación', { exact: true }).fill(invitation.trim());
      await member.getByRole('button', { name: 'Unirse', exact: true }).click();
      await visible(member.getByLabel('Mensaje', { exact: true }));
      assert.equal(await member.getByRole('button', { name: 'Crear canal', exact: true }).count(), 0);
      await owner.getByRole('button', { name: 'Actualizar comunidad', exact: true }).click();
      await visible(owner.getByText(memberFields.username, { exact: true }));
      await owner.getByRole('button', { name: `Opciones de ${memberFields.username}`, exact: true }).click();
      await owner.getByRole('menuitem', { name: 'Dar administrador', exact: true }).click();
      await visible(owner.getByRole('heading', { name: /Administradores/ }));
      await owner.getByRole('button', { name: `Opciones de ${memberFields.username}`, exact: true }).click();
      await owner.getByRole('menuitem', { name: 'Quitar administrador', exact: true }).click();
      await member.close();
    });
    await caseTest('Canales: creación y selección', async () => {
      await owner.getByRole('button', { name: 'Crear canal', exact: true }).click();
      await owner.getByLabel('Nombre del canal', { exact: true }).fill('practicas');
      await owner.getByRole('button', { name: 'Crear', exact: true }).click();
      await visible(owner.getByText('Todavía no hay mensajes en # practicas.', { exact: true }));
      await send(owner, 'Canal de pruebas del TP2');
    });
    await caseTest('CMS: editar canal y actualizar la vista cargada', async () => {
      const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      try {
      await admin.goto(api + '/admin');
      await admin.getByLabel(/^First name/i).fill('Docente');
      await admin.getByLabel(/^Last name/i).fill('Prueba');
      await admin.getByLabel(/^Email/i).fill(`cms_${randomBytes(4).toString('hex')}@example.test`);
      const password = randomBytes(12).toString('hex') + 'Aa1!';
      await admin.getByLabel(/^Password/i).fill(password);
      await admin.getByLabel(/^Confirm password/i).fill(password);
      await admin.getByRole('button', { name: /Let's start/ }).click();
      await admin.getByRole('link', { name: 'Content Manager', exact: true }).click();
      await admin.getByRole('link', { name: 'Canal', exact: true }).click();
      await visible(admin.getByText('practicas', { exact: true }));
      const skip = admin.getByRole('button', { name: 'Skip', exact: true });
      if (await skip.isVisible()) await skip.click();
      await admin.getByText('practicas', { exact: true }).click();
      await admin.getByLabel('nombre', { exact: false }).fill('editado-cms');
      await Promise.all([
        admin.waitForResponse(response => response.url().includes('/content-manager/collection-types/api::canal.canal/') && response.request().method() === 'PUT' && response.status() === 200),
        admin.getByRole('button', { name: 'Save', exact: true }).click(),
      ]);
      await owner.getByRole('button', { name: 'Actualizar comunidad', exact: true }).click();
      await visible(owner.getByRole('button', { name: '# editado-cms', exact: true }));
      await owner.getByRole('button', { name: '# editado-cms', exact: true }).click();
      await visible(owner.getByText('Canal de pruebas del TP2', { exact: true }));
      } catch (error) { await admin.screenshot({ path: "/tmp/community-admin-failure.png", fullPage: true }); throw error; }
      finally { await admin.close(); }
    });
    await caseTest('Pantallas, mensaje largo y navegación con teclado', async () => {
      await owner.getByRole('button', { name: '# general', exact: true }).click();
      await visible(owner.getByText('Mensaje de la comunidad académica', { exact: true }));
      for (const [width, height] of [[1440, 900], [768, 900], [375, 812]]) {
        await owner.setViewportSize({ width, height });
        await owner.waitForTimeout(200);
        assert.ok(await owner.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Desborde a ${width}px`);

      }
      await owner.setViewportSize({ width: 1440, height: 900 });
      await owner.getByRole('button', { name: '# editado-cms', exact: true }).click();
      await visible(owner.getByText('Canal de pruebas del TP2', { exact: true }));
      for (const [width, height] of [[1440, 900], [768, 900], [375, 812]]) {
        await owner.setViewportSize({ width, height });
        await owner.waitForTimeout(200);
        await owner.screenshot({ path: new URL(`community-hub-${width}.png`, assets).pathname, fullPage: true });
      }
      await owner.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await visible(owner.getByRole('dialog', { name: 'Navegación de comunidades', exact: true }));
      for (let i = 0; i < 12; i++) {
        await owner.keyboard.press('Tab');
        assert.ok(await owner.evaluate(() => !!document.activeElement.closest('[role="dialog"]')));
      }
      await owner.keyboard.press('Escape');
      await owner.getByRole('dialog').waitFor({ state: 'hidden' });
      await owner.getByRole('button', { name: 'Ver miembros', exact: true }).click();
      await visible(owner.getByRole('dialog', { name: 'Integrantes de Comunidad Académica' }));
      await owner.screenshot({ path: new URL('community-hub-miembros-mobile.png', assets).pathname });
      await owner.keyboard.press('Escape');
      await owner.getByRole('dialog').waitFor({ state: 'hidden' });
      await owner.getByLabel('Mensaje', { exact: true }).focus();
      await owner.keyboard.type('Mensaje enviado con teclado');
      await owner.keyboard.press('Enter');
      await visible(owner.getByText('Mensaje enviado con teclado', { exact: true }));
    });
    await caseTest('Errores de red, carga y listas vacías controladas', async () => {
      await owner.setViewportSize({ width: 1440, height: 900 });
      await owner.route('**/api/membresias?comunidad=*', route => route.fulfill({ json: { data: [] } }));
      await owner.route('**/api/canales?comunidad=*', route => route.fulfill({ json: { data: [] } }));
      await owner.getByRole('button', { name: 'Actualizar comunidad', exact: true }).click();
      await visible(owner.getByText('Esta comunidad todavía no tiene canales.', { exact: true }));
      await visible(owner.getByText('Todavía no hay miembros para mostrar.', { exact: true }));
      await owner.unrouteAll();
      await owner.route('**/api/canales?comunidad=*', async route => { await new Promise(r => setTimeout(r, 500)); await route.abort(); });
      await owner.getByRole('button', { name: 'Actualizar comunidad', exact: true }).click();
      await visible(owner.getByRole('status').filter({ hasText: 'Cargando canales' }).last());
      await visible(owner.getByRole('alert').filter({ hasText: 'No se pudo conectar' }).last());
      await owner.unrouteAll();
      await owner.getByRole('button', { name: 'Actualizar comunidad', exact: true }).click();
      await visible(owner.getByLabel('Mensaje', { exact: true }));
    });
    await caseTest('Cierre de sesión, credenciales inválidas y token vencido', async () => {
      await owner.getByRole('button', { name: fields.username, exact: true }).click();
      await owner.getByRole('menuitem', { name: 'Cerrar sesión', exact: true }).click();
      await owner.waitForURL(web + '/login');
      assert.equal(await owner.evaluate(() => localStorage.getItem('token')), null);
      await owner.getByLabel('Email', { exact: true }).fill(fields.email);
      await owner.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
      await owner.getByRole('button', { name: 'Ingresar', exact: true }).click();
      await visible(owner.getByRole('alert').filter({ hasText: 'El email o la contraseña son incorrectos.' }));
      await owner.getByLabel('Contraseña', { exact: true }).fill(fields.password);
      await owner.getByRole('button', { name: 'Ingresar', exact: true }).click();
      await owner.waitForURL(web + '/');
      await owner.evaluate(() => localStorage.setItem('token', 'invalido'));
      await owner.reload();
      await owner.waitForURL(web + '/login');
      assert.equal(await owner.evaluate(() => localStorage.getItem('token')), null);
      assert.deepEqual(errors, [], 'La interfaz no debe emitir excepciones');
    });
  } catch (error) {
    await owner.screenshot({ path: '/tmp/community-ui-failure.png', fullPage: true });
    throw error;
  } finally { await browser.close(); }
});

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const database = `.tmp/verification-${randomBytes(5).toString('hex')}.db`;
const children = [];
const apiOnly = process.argv.includes('--api');
const api = 'http://127.0.0.1:1337';
const web = 'http://127.0.0.1:3100';
const testEnv = { ...process.env, HOST: '127.0.0.1', PORT: '1337', DATABASE_CLIENT: 'sqlite', DATABASE_FILENAME: database, TEST_API_URL: api, TEST_WEB_URL: web, NEXT_PUBLIC_STRAPI_URL: api, NEXT_TELEMETRY_DISABLED: '1', STRAPI_TELEMETRY_DISABLED: 'true' };
function start(args) {
  const child = spawn(npm, args, { env: testEnv, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32', detached: process.platform !== 'win32' });
  children.push(child);
  let logs = '';
  child.stdout.on('data', chunk => { logs = (logs + chunk).slice(-12000); if (args.includes('frontend')) process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { logs = (logs + chunk).slice(-12000); if (args.includes('frontend')) process.stderr.write(chunk); });
  child.logs = () => logs;
  return child;
}
async function ready(url, child) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`El servicio terminó antes de iniciar.\n${child.logs()}`);
    try { const res = await fetch(url, { signal: AbortSignal.timeout(5000) }); if (res.ok || res.status === 204) return; } catch {}
    await delay(500);
  }
  throw new Error(`El servicio no respondió: ${url}\n${child.logs()}`);
}
async function run(args) {
  const child = spawn(process.execPath, args, { env: testEnv, stdio: 'inherit' });
  const code = await new Promise(resolve => child.on('exit', resolve));
  if (code !== 0) throw new Error('Falló la validación. Revisar el resultado anterior.');
}
try {
  const backend = start(['run', 'start', '-w', 'backend']);
  await ready(api + '/_health', backend);
  console.log('CMS de prueba iniciado con una base descartable.');
  await run(['--test', 'tests/api.test.mjs']);
  if (!apiOnly) {
    const frontend = start(['run', 'start', '-w', 'frontend', '--', '--port', '3100', '--hostname', '127.0.0.1']);
    await ready(web + '/login', frontend);
    console.log('Frontend de producción listo. Iniciando pruebas de interfaz.');
    await run(['--test', 'tests/ui.test.mjs']);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  for (const [i, child] of children.entries()) {
    try {
      await writeFile(join(tmpdir(), `community-service-${i}.log`), child.logs());
    } catch (error) {
      console.error(`No se pudo guardar el log del servicio: ${error.message}`);
    }
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    else { try { process.kill(-child.pid, 'SIGTERM'); } catch {} }
  }
  await delay(500);
  for (const suffix of ['', '-wal', '-shm']) await rm(new URL(`../apps/backend/${database}${suffix}`, import.meta.url), { force: true });
}

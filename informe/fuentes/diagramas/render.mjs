/**
 * Renderiza los diagramas HTML del informe a PNG con Chromium (Playwright).
 * Uso: node render.mjs <carpeta-salida>
 * Si Playwright no está instalado en esta carpeta, se toma de PLAYWRIGHT_DIR.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const requerir = createRequire(process.env.PLAYWRIGHT_DIR ? join(process.env.PLAYWRIGHT_DIR, 'package.json') : import.meta.url);
const { chromium } = requerir('playwright');

const salida = resolve(process.argv[2] ?? join(aqui, '..', '..', 'img', 'diagramas'));
mkdirSync(salida, { recursive: true });

const PIEZAS = [
  ['arbol.html?modo=problemas', 'arbol_problemas', 1880],
  ['arbol.html?modo=objetivos', 'arbol_objetivos', 1880],
  ['arquitectura.html', 'arquitectura', 1500],
  ['navegacion.html', 'navegacion', 1600],
  ['flexbox.html', 'flexbox', 1500],
  ['mockups.html?hoja=1', 'mockups_estudiante', 1500],
  ['mockups.html?hoja=2', 'mockups_docente_admin', 1500],
];
const MOCKUPS = ['login', 'dashboard', 'catalogo', 'detalle', 'ficha', 'horario', 'panel', 'nomina', 'escaner', 'laboratorios', 'configuracion', 'perfil'];

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ deviceScaleFactor: 2, viewport: { width: 1500, height: 900 } });

async function capturar(url, nombre, ancho, selector = '#lienzo') {
  await pagina.setViewportSize({ width: ancho, height: 900 });
  await pagina.goto(pathToFileURL(join(aqui, url.split('?')[0])).href + (url.includes('?') ? '?' + url.split('?')[1] : ''));
  await pagina.waitForSelector('body[data-listo="1"]');
  await pagina.locator(selector).screenshot({ path: join(salida, `${nombre}.png`) });
  console.log('diagrama', nombre);
}

for (const [url, nombre, ancho] of PIEZAS) await capturar(url, nombre, ancho);
for (const m of MOCKUPS) await capturar(`mockups.html?solo=${m}`, `mockup_${m}`, 520);
await navegador.close();

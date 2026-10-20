/**
 * Recorre la app en un emulador Android y guarda una captura de cada interfaz.
 * Localiza los controles por su accessibilityLabel (content-desc) o texto visible con
 * `uiautomator dump`, así el recorrido no depende de coordenadas fijas.
 *
 * Uso: node herramientas/capturas-android.mjs <carpeta-destino> [--oscuro]
 * Requisitos: emulador encendido y Metro sirviendo la app (npx expo start). EXP_URL apunta al servidor.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ADB = process.env.ADB ?? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const destino = process.argv[2] ?? 'capturas';
mkdirSync(destino, { recursive: true });

// MSYS_NO_PATHCONV evita que Git Bash convierta rutas del dispositivo como /sdcard.
const adb = (...args) => execFileSync(ADB, args, { maxBuffer: 64 * 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function nodos() {
  adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml');
  const xml = adb('shell', 'cat', '/sdcard/ui.xml').toString('utf8');
  return [...xml.matchAll(/<node [^>]*?>/g)].map(([n]) => {
    const attr = (k) => (n.match(new RegExp(`${k}="([^"]*)"`)) ?? [])[1] ?? '';
    const [x1, y1, x2, y2] = attr('bounds').match(/\d+/g)?.map(Number) ?? [0, 0, 0, 0];
    return { texto: attr('text'), desc: attr('content-desc'), x: (x1 + x2) / 2, y: (y1 + y2) / 2, alto: y2 - y1 };
  });
}

async function buscar(etiqueta, { exacto = true, intentos = 20, desplazar = false } = {}) {
  for (let i = 0; i < intentos; i++) {
    const lista = nodos();
    const coincide = (v) => (exacto ? v === etiqueta : v.includes(etiqueta));
    // Primero la etiqueta de accesibilidad (el control) y luego el texto visible (p. ej. un rótulo).
    const n = lista.find((x) => coincide(x.desc)) ?? lista.find((x) => coincide(x.texto));
    if (n && n.y > 0 && n.y < 2380) return n;
    if (desplazar) adb('shell', 'input', 'swipe', '540', '1700', '540', '800', '350');
    await dormir(700);
  }
  throw new Error(`No se encontró «${etiqueta}» en pantalla`);
}

async function tocar(etiqueta, opciones) {
  const n = await buscar(etiqueta, opciones);
  adb('shell', 'input', 'tap', String(Math.round(n.x)), String(Math.round(n.y)));
  await dormir(1200);
}

async function deslizar(desdeY, hastaY) {
  adb('shell', 'input', 'swipe', '540', String(desdeY), '540', String(hastaY), '400');
  await dormir(900);
}

/** Escribe en el campo y pulsa Enter: el TextInput de una línea pierde el foco y cierra el teclado. */
async function escribir(etiqueta, texto) {
  await tocar(etiqueta);
  adb('shell', 'input', 'text', texto.replace(/ /g, '%s'));
  await dormir(500);
  adb('shell', 'input', 'keyevent', 'KEYCODE_ENTER');
  await dormir(900);
}

async function reiniciarApp() {
  const url = `${process.env.EXP_URL ?? 'exp://192.168.1.2:8081'}?__expo_disable_fab=1&__expo_disable_onboarding=1`;
  adb('shell', 'am', 'force-stop', 'host.exp.exponent');
  await dormir(1500);
  adb('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', `'${url}'`, 'host.exp.exponent');
  await buscar('Ingresar', { intentos: 60 });
  await dormir(1500);
  // Expo Go puede abrir su menú de desarrollo al iniciar: se cierra para que no tape la app.
  if (nodos().some((n) => n.texto === 'Go home')) {
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
    await dormir(1000);
  }
}

async function captura(nombre) {
  await dormir(900);
  writeFileSync(join(destino, `${nombre}.png`), adb('exec-out', 'screencap', '-p'));
  console.log('captura', nombre);
}

const atras = async () => { adb('shell', 'input', 'keyevent', 'KEYCODE_BACK'); await dormir(1000); };

// ---------------- recorrido ----------------
await reiniciarApp();
await captura('01_login');
await escribir('Correo institucional', 'correo@gmail.com');
await escribir('Contraseña', 'abc12345');
await buscar('Usa tu correo institucional @unsa.edu.pe.');
await captura('01b_login_error');

await tocar('Demo estudiante');
await buscar('Mis laboratorios');
await captura('02_dashboard');

await tocar('Catálogo');
await buscar('Buscar en el catálogo');
await captura('03_catalogo');
await tocar('Sin cruce de horario');
await captura('03b_catalogo_filtro');
await tocar('Todos');

await tocar('Grupo PE-C');
await buscar('Puestos del laboratorio');
await captura('04b_detalle_cruce');
await atras();
await tocar('Grupo PE-B');
await buscar('Puestos del laboratorio');
await captura('04_detalle_grupo');
await tocar('Confirmar matrícula');
await buscar('Código de verificación', { intentos: 30 });
await captura('05_ficha_qr');
await atras();

await tocar('Horario');
await buscar('Semana');
await captura('06_horario');
await tocar('Lista');
await captura('06b_horario_lista');

await tocar('Perfil');
await buscar('Apariencia');
await captura('12_perfil');
await tocar('Oscuro');
await tocar('Inicio');
await captura('02b_dashboard_oscuro');
await tocar('Perfil');
await tocar('Claro');
await tocar('Cerrar sesión', { desplazar: true });

await tocar('Demo docente');
await buscar('Mis grupos de laboratorio');
await captura('07_panel_docente');
await deslizar(1900, 900);
await tocar('Nómina PE-B');
await buscar('presentes en la sesión de hoy', { exacto: false });
await tocar('Asistencia de Lopez Arela, Ower Frank');
await tocar('Asistencia de Apaza Mamani, Lucía Fernanda').catch(() => {});
await captura('08_nomina');
await atras();
await tocar('Escáner');
await buscar('Ingreso manual');
// Expo Go concede la cámara por aplicación: se acepta el diálogo del sistema si aparece.
if (nodos().some((n) => n.desc === 'Permitir cámara')) {
  await tocar('Permitir cámara');
  for (let i = 0; i < 6; i++) {
    const boton = nodos().find((n) => ['While using the app', 'Only this time', 'Allow', 'ALLOW', 'Mientras la app está en uso', 'Permitir'].includes(n.texto));
    if (boton) { adb('shell', 'input', 'tap', String(Math.round(boton.x)), String(Math.round(boton.y))); await dormir(1500); }
    else await dormir(800);
  }
}
await dormir(2500);
await captura('09_escaner');
// Código de verificación del pase emitido en la matrícula del estudiante (pantalla 05).
await escribir('Código de verificación', process.env.CODIGO_PASE ?? '25E350D3');
await tocar('Validar código');
await buscar('Asistencia registrada', { exacto: false });
await captura('09b_escaner_validado');

await tocar('Perfil');
await tocar('Cerrar sesión', { desplazar: true });
await tocar('Demo admin');
await buscar('Capacidad (PC)', { exacto: false });
await captura('10_laboratorios');
await tocar('Editar Laboratorio 1');
await captura('10b_laboratorio_modal');
await atras();
await tocar('Matrícula');
await buscar('Ventana de matrícula');
await captura('11_configuracion');

// Orientación horizontal: useWindowDimensions entrega ~915 dp de ancho y la lista pasa a 2 columnas.
adb('shell', 'settings', 'put', 'system', 'accelerometer_rotation', '0');
adb('shell', 'settings', 'put', 'system', 'user_rotation', '1');
await dormir(2500);
await tocar('Laboratorios');
await captura('13_laboratorios_horizontal');
adb('shell', 'settings', 'put', 'system', 'user_rotation', '0');
await dormir(2000);
console.log('recorrido completo');

"""Compone las figuras de cada interfaz: mockup de baja fidelidad junto a las capturas reales en Android.

Uso: python componer_figuras.py
Lee img/diagramas/mockup_*.png e img/capturas/*.png y escribe img/figuras/fig_iNN.png.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
IMG = RAIZ / "img"
SALIDA = IMG / "figuras"
ALTO = 1600
SEP = 70
PIE = 110
FUENTE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)

FIGURAS = {
    "i01": ["mockup_login", "01_login", "01b_login_error", "e01_login_teclado"],
    "i02": ["mockup_dashboard", "02_dashboard", "02b_dashboard_oscuro"],
    "i03": ["mockup_catalogo", "03_catalogo", "03b_catalogo_filtro"],
    "i04": ["mockup_detalle", "04_detalle_grupo", "04b_detalle_cruce", "e05_detalle_agotado"],
    "i05": ["mockup_ficha", "05_ficha_qr", "e07_pase_compartir"],
    "i06": ["mockup_horario", "06_horario", "06b_horario_lista", "e10_horario_con_pe"],
    "i07": ["mockup_panel", "07_panel_docente", "e18_panel_docente_asistencia"],
    "i08": ["mockup_nomina", "08_nomina"],
    "i09": ["mockup_escaner", "09_escaner", "09b_escaner_validado", "e17_escaner_rechazado"],
    "i10": ["mockup_laboratorios", "10_laboratorios", "10b_laboratorio_modal", "e20_laboratorio_deshabilitado"],
    "i11": ["mockup_configuracion", "11_configuracion"],
    "i12": ["mockup_perfil", "12_perfil", "e19_perfil_docente"],
    "web": ["web_login", "web_dashboard", "web_catalogo"],
    # Estados adicionales que necesitan una figura propia.
    "x02": ["e08_panel_dos_laboratorios", "e09_panel_anular_dialogo"],
    "x03": ["e02_catalogo_busqueda", "e03_catalogo_sin_resultados", "e04_catalogo_con_vacantes"],
    "x08": ["e15_nomina_busqueda", "e16_nomina_exportar_csv"],
    "x11": ["e21_configuracion_error", "e22_configuracion_guardada", "e23_configuracion_agotados"],
    "oscuro": ["02b_dashboard_oscuro", "e12_catalogo_oscuro", "e13_detalle_oscuro", "e14_horario_oscuro"],
}
ROTULOS = {
    "i01": ["(a) Mockup", "(b) Android", "(c) Error", "(d) Teclado"],
    "i02": ["(a) Mockup", "(b) Tema claro", "(c) Tema oscuro"],
    "i03": ["(a) Mockup", "(b) Todos", "(c) Sin cruce"],
    "i04": ["(a) Mockup", "(b) Disponible", "(c) Cruce", "(d) Agotado"],
    "i05": ["(a) Mockup", "(b) Pase", "(c) Compartir"],
    "i06": ["(a) Mockup", "(b) Semana", "(c) Lista", "(d) Con PE-B"],
    "i07": ["(a) Mockup", "(b) Android", "(c) Asistencia"],
    "i08": ["(a) Mockup", "(b) Android"],
    "i09": ["(a) Mockup", "(b) Cámara", "(c) Validado", "(d) Rechazado"],
    "i10": ["(a) Mockup", "(b) Lista", "(c) Edición", "(d) Inhabilitado"],
    "i11": ["(a) Mockup", "(b) Android"],
    "i12": ["(a) Mockup", "(b) Estudiante", "(c) Docente"],
    "web": ["(a) Inicio de sesión", "(b) Panel", "(c) Catálogo"],
    "x02": ["(a) Dos matrículas", "(b) Alert nativo"],
    "x03": ["(a) Búsqueda", "(b) Sin resultados", "(c) Con vacantes"],
    "x08": ["(a) Búsqueda", "(b) Exportar CSV"],
    "x11": ["(a) Fecha inválida", "(b) Guardado", "(c) Agotados"],
    "oscuro": ["(a) Panel", "(b) Catálogo", "(c) Detalle", "(d) Horario"],
}


def cargar(nombre):
    if nombre.startswith("mockup_"):
        im = Image.open(IMG / "diagramas" / f"{nombre}.png").convert("RGB")
        # Recorta el margen blanco del lienzo para que el teléfono quede del mismo alto que la captura.
        fondo = Image.new("RGB", im.size, (255, 255, 255))
        from PIL import ImageChops
        caja = ImageChops.difference(im, fondo).getbbox()
        im = im.crop(caja)
    else:
        im = Image.open(IMG / "capturas" / f"{nombre}.png").convert("RGB")
    ancho = round(im.width * ALTO / im.height)
    im = im.resize((ancho, ALTO), Image.LANCZOS)
    if not nombre.startswith("mockup_"):
        marco = Image.new("RGB", (ancho + 6, ALTO + 6), (43, 61, 82))
        marco.paste(im, (3, 3))
        im = marco
    return im


def componer(clave, piezas):
    imagenes = [cargar(p) for p in piezas]
    ancho = sum(i.width for i in imagenes) + SEP * (len(imagenes) - 1)
    alto = max(i.height for i in imagenes) + PIE
    lienzo = Image.new("RGB", (ancho, alto), (255, 255, 255))
    d = ImageDraw.Draw(lienzo)
    x = 0
    for k, (im, nombre) in enumerate(zip(imagenes, piezas)):
        lienzo.paste(im, (x, (alto - PIE - im.height) // 2))
        texto = ROTULOS[clave][k] if clave in ROTULOS else f"({'abc'[k]}) " + ("Mockup" if nombre.startswith("mockup_") else "Android" if k == 1 else "Variante")
        w = d.textlength(texto, font=FUENTE)
        d.text((x + (im.width - w) / 2, alto - PIE + 30), texto, fill=(25, 55, 90), font=FUENTE)
        x += im.width + SEP
    lienzo.save(SALIDA / f"fig_{clave}.png", optimize=True)
    print("figura", clave, lienzo.size)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    for clave, piezas in FIGURAS.items():
        componer(clave, piezas)


# ---------- figuras con capturas que no son de teléfono vertical ----------
def _marco(im, borde=3):
    m = Image.new("RGB", (im.width + 2 * borde, im.height + 2 * borde), (43, 61, 82))
    m.paste(im, (borde, borde))
    return m


def _escalar(im, alto=None, ancho=None):
    if alto:
        return im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)
    return im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)


def _rotulo(lienzo, texto, x, ancho, y):
    d = ImageDraw.Draw(lienzo)
    w = d.textlength(texto, font=FUENTE)
    d.text((x + (ancho - w) / 2, y), texto, fill=(25, 55, 90), font=FUENTE)


def fila(piezas, rotulos, alto):
    ims = [_marco(_escalar(Image.open(r).convert("RGB"), alto=alto)) for r in piezas]
    ancho = sum(i.width for i in ims) + SEP * (len(ims) - 1)
    lienzo = Image.new("RGB", (ancho, alto + 6 + PIE), (255, 255, 255))
    x = 0
    for im, r in zip(ims, rotulos):
        lienzo.paste(im, (x, 0))
        _rotulo(lienzo, r, x, im.width, alto + 6 + 30)
        x += im.width + SEP
    return lienzo


def columna(filas):
    ancho = max(f.width for f in filas)
    lienzo = Image.new("RGB", (ancho, sum(f.height for f in filas) + SEP * (len(filas) - 1)), (255, 255, 255))
    y = 0
    for f in filas:
        lienzo.paste(f, ((ancho - f.width) // 2, y))
        y += f.height + SEP
    return lienzo


def especiales():
    cap, proc = IMG / "capturas", IMG / "proceso"
    fila([proc / "03_expo_go_inicio.png", proc / "02_expo_go_menu.png"], ["(a) Servidor detectado", "(b) Menú de desarrollo"], 1600).save(SALIDA / "fig_entorno.png", optimize=True)
    columna([fila([cap / "13_laboratorios_horizontal.png"], ["(a) Laboratorios en dos columnas"], 900),
             fila([cap / "e11_horario_horizontal.png"], ["(b) Horario semanal"], 900)]).save(SALIDA / "fig_horizontal.png", optimize=True)
    arriba = fila([cap / "web_laboratorios_ancho.png"], ["(a) 1366 px: tres columnas"], 1000)
    abajo = fila([cap / "web_laboratorios_medio.png", cap / "web_login_ancho.png"], ["(b) 820 px: dos columnas", "(c) Inicio de sesión"], 760)
    columna([arriba, abajo]).save(SALIDA / "fig_web_ancha.png", optimize=True)
    print("figuras especiales")


if __name__ == "__main__":
    especiales()

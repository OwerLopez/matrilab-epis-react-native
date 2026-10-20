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
    "i01": ["mockup_login", "01_login", "01b_login_error"],
    "i02": ["mockup_dashboard", "02_dashboard", "02b_dashboard_oscuro"],
    "i03": ["mockup_catalogo", "03_catalogo", "03b_catalogo_filtro"],
    "i04": ["mockup_detalle", "04_detalle_grupo", "04b_detalle_cruce"],
    "i05": ["mockup_ficha", "05_ficha_qr"],
    "i06": ["mockup_horario", "06_horario", "06b_horario_lista"],
    "i07": ["mockup_panel", "07_panel_docente"],
    "i08": ["mockup_nomina", "08_nomina"],
    "i09": ["mockup_escaner", "09_escaner", "09b_escaner_validado"],
    "i10": ["mockup_laboratorios", "10_laboratorios", "10b_laboratorio_modal"],
    "i11": ["mockup_configuracion", "11_configuracion"],
    "i12": ["mockup_perfil", "12_perfil"],
    "web": ["web_login", "web_dashboard", "web_catalogo"],
}
ROTULOS = {"web": ["(a) Inicio de sesión", "(b) Panel", "(c) Catálogo"]}


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

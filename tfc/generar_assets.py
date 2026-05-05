"""
Genera los assets necesarios para el TFC:
- logo_header.png  (logo "La Otra FP | PRO2" para esquina superior derecha)
- logo_corner.png  (cuadraditos decorativos para esquina superior izquierda)
- logo_portada.png (logo grande centrado para la portada)
"""

from PIL import Image, ImageDraw, ImageFont
import os

ASSETS = r"C:\Users\r.aguado\TFC_Rubén_Aguado\tfc\assets"
os.makedirs(ASSETS, exist_ok=True)

# Colores corporativos La Otra FP / PRO2
GOLD = (205, 173, 76)
BLACK = (15, 15, 20)
WHITE = (255, 255, 255)


def get_font(size, bold=True):
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


# ─────────────────────────────────────────────────────────────────────────────
# Logo header (esquina superior derecha) - "La Otra FP | PRO2"
# ─────────────────────────────────────────────────────────────────────────────
def make_header_logo():
    # Tamaño compacto para header
    W, H = 200, 100
    img = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)

    # Cuadrado izquierdo (negro con texto "La Otra FP")
    d.rounded_rectangle([(0, 0), (95, H)], radius=8, fill=BLACK)
    f_la = get_font(20, bold=True)
    f_otra = get_font(20, bold=True)
    f_fp = get_font(20, bold=True)
    d.text((10, 10), "La", fill=WHITE, font=f_la)
    d.text((10, 35), "Otra", fill=WHITE, font=f_otra)
    d.text((10, 60), "FP", fill=GOLD, font=f_fp)

    # Cuadrado derecho (negro con texto "PRO2")
    d.rounded_rectangle([(100, 0), (W, H)], radius=8, fill=BLACK)
    # PRO girado verticalmente
    f_pro = get_font(36, bold=True)
    d.text((110, 28), "PRO", fill=GOLD, font=f_pro)
    f_2 = get_font(40, bold=True)
    d.text((175, 22), "2", fill=GOLD, font=f_2)

    img.save(os.path.join(ASSETS, "logo_header.png"))
    print("OK logo_header.png")


# ─────────────────────────────────────────────────────────────────────────────
# Cuadraditos decorativos esquina superior izquierda
# ─────────────────────────────────────────────────────────────────────────────
def make_corner_decoration():
    W, H = 90, 90
    img = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    # Tres cuadraditos en patrón (dos dorados, uno negro)
    d.rectangle([(0, 0), (28, 28)], fill=GOLD)
    d.rectangle([(35, 35), (63, 63)], fill=BLACK)
    d.rectangle([(0, 60), (28, 88)], fill=GOLD)
    img.save(os.path.join(ASSETS, "logo_corner.png"))
    print("OK logo_corner.png")


# ─────────────────────────────────────────────────────────────────────────────
# Logo grande para portada
# ─────────────────────────────────────────────────────────────────────────────
def make_portada_logo():
    W, H = 500, 250
    img = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)

    # Cuadrado izquierdo grande
    d.rounded_rectangle([(0, 0), (240, H)], radius=20, fill=BLACK)
    f_big = get_font(54, bold=True)
    d.text((25, 30), "La", fill=WHITE, font=f_big)
    d.text((25, 95), "Otra", fill=WHITE, font=f_big)
    d.text((25, 160), "FP", fill=GOLD, font=f_big)

    # Cuadrado derecho con PRO2
    d.rounded_rectangle([(255, 0), (W, H)], radius=20, fill=BLACK)
    f_pro = get_font(90, bold=True)
    d.text((280, 70), "PRO", fill=GOLD, font=f_pro)
    f_2 = get_font(100, bold=True)
    d.text((440, 50), "2", fill=GOLD, font=f_2)

    img.save(os.path.join(ASSETS, "logo_portada.png"))
    print("OK logo_portada.png")


if __name__ == "__main__":
    make_header_logo()
    make_corner_decoration()
    make_portada_logo()
    print("\nAssets generados en:", ASSETS)

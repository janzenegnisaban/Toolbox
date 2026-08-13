"""Renders the Toolbox isometric-box mark to PNG/ICO from the same geometry as favicon.svg."""

from PIL import Image, ImageDraw

BG = (20, 24, 29, 255)
FG = (255, 255, 255, 255)
SS = 8  # supersample factor for clean edges

FACES = [
    [(19, 38.5), (50, 54), (50, 89), (19, 74)],
    [(50, 54), (81, 38.5), (81, 74), (50, 89)],
    [(15, 28), (50, 45.5), (50, 52.5), (15, 35)],
    [(50, 45.5), (85, 28), (85, 35), (50, 52.5)],
    [(50, 10.5), (85, 28), (50, 45.5), (15, 28)],
]


def render(size, radius_ratio=0.22, background=True):
    canvas = size * SS
    scale = canvas / 100
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if background:
        draw.rounded_rectangle(
            [0, 0, canvas - 1, canvas - 1], radius=int(canvas * radius_ratio), fill=BG
        )

    line = max(1, int(2 * scale))
    for face in FACES:
        points = [(x * scale, y * scale) for x, y in face]
        draw.polygon(points, fill=FG, outline=BG if background else None, width=line)

    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    render(512).save("icon-512.png")
    render(180).save("apple-touch-icon.png")
    render(192).save("icon-192.png")
    render(256).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("icons written")

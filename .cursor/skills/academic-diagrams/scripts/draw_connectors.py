"""PIL 正交接线：箭头停在框边，禁止穿填充。GenerateImage 细粒度连通性失败时用这个。"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CHARCOAL = (44, 62, 80)
WHITE = (255, 255, 255)
OFFWHITE = (252, 252, 250)
GREEN_F = (212, 237, 218)
GREEN_S = (45, 106, 79)
BLUE_F = (214, 234, 248)
BLUE_S = (26, 82, 118)
YELLOW_F = (252, 243, 207)
YELLOW_S = (183, 149, 11)
ORANGE_F = (250, 215, 160)
ORANGE_S = (185, 119, 14)
PURPLE_F = (232, 218, 239)
PURPLE_S = (108, 52, 131)
GRAY_F = (234, 236, 240)
GRAY_S = (84, 110, 122)
RED = (176, 58, 46)
OK_GREEN = (39, 122, 71)

WIN_FONTS = Path(r"C:\Windows\Fonts")


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = (
        ("segoeuib.ttf", "segoeui.ttf") if bold else ("segoeui.ttf", "calibri.ttf", "arial.ttf")
    )
    for name in names:
        path = WIN_FONTS / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def rounded_box(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    fill: tuple[int, int, int],
    outline: tuple[int, int, int],
    radius: int = 14,
    width: int = 2,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def text_center(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int] = CHARCOAL,
) -> None:
    x0, y0, x1, y1 = xy
    bbox = draw.multiline_textbbox((0, 0), text, font=font, align="center")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.multiline_text(
        ((x0 + x1 - tw) / 2, (y0 + y1 - th) / 2 - 2),
        text,
        font=font,
        fill=fill,
        align="center",
        spacing=4,
    )


def _unit(dx: float, dy: float) -> tuple[float, float]:
    n = (dx * dx + dy * dy) ** 0.5
    if n < 1e-6:
        return (0.0, 0.0)
    return (dx / n, dy / n)


def arrowhead(
    draw: ImageDraw.ImageDraw,
    tip: tuple[float, float],
    direction: tuple[float, float],
    size: int = 11,
    fill: tuple[int, int, int] = CHARCOAL,
) -> tuple[float, float]:
    """三角尖在 tip（框边上）。返回箭杆应停住的点（三角底边中点）。"""
    ux, uy = _unit(*direction)
    px, py = -uy, ux
    base_x = tip[0] - ux * size
    base_y = tip[1] - uy * size
    half = size * 0.45
    pts = [
        tip,
        (base_x + px * half, base_y + py * half),
        (base_x - px * half, base_y - py * half),
    ]
    draw.polygon(pts, fill=fill)
    return (base_x, base_y)


def line_solid(
    draw: ImageDraw.ImageDraw,
    a: tuple[float, float],
    b: tuple[float, float],
    width: int = 2,
    fill: tuple[int, int, int] = CHARCOAL,
) -> None:
    draw.line([a, b], fill=fill, width=width)


def line_dashed(
    draw: ImageDraw.ImageDraw,
    a: tuple[float, float],
    b: tuple[float, float],
    width: int = 2,
    fill: tuple[int, int, int] = CHARCOAL,
    dash: int = 7,
    gap: int = 5,
) -> None:
    x0, y0 = a
    x1, y1 = b
    dx, dy = x1 - x0, y1 - y0
    length = (dx * dx + dy * dy) ** 0.5
    if length < 1:
        return
    ux, uy = dx / length, dy / length
    t = 0.0
    on = True
    while t < length:
        step = dash if on else gap
        t2 = min(length, t + step)
        if on:
            draw.line(
                [(x0 + ux * t, y0 + uy * t), (x0 + ux * t2, y0 + uy * t2)],
                fill=fill,
                width=width,
            )
        t = t2
        on = not on


def arrow_segment(
    draw: ImageDraw.ImageDraw,
    start: tuple[float, float],
    tip: tuple[float, float],
    *,
    dashed: bool = False,
    width: int = 2,
    head: int = 11,
    fill: tuple[int, int, int] = CHARCOAL,
) -> None:
    dx, dy = tip[0] - start[0], tip[1] - start[1]
    shaft_end = arrowhead(draw, tip, (dx, dy), size=head, fill=fill)
    (line_dashed if dashed else line_solid)(draw, start, shaft_end, width=width, fill=fill)


def polyline_arrow(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[float, float]],
    *,
    dashed: bool = False,
    width: int = 2,
    head: int = 11,
    fill: tuple[int, int, int] = CHARCOAL,
) -> None:
    """正交折线，箭头只在最后一段终点（必须是目标框边）。"""
    assert len(points) >= 2
    for a, b in zip(points[:-2], points[1:-1]):
        (line_dashed if dashed else line_solid)(draw, a, b, width=width, fill=fill)
    arrow_segment(
        draw,
        points[-2],
        points[-1],
        dashed=dashed,
        width=width,
        head=head,
        fill=fill,
    )


class Box:
    def __init__(self, x0: int, y0: int, x1: int, y1: int) -> None:
        self.x0, self.y0, self.x1, self.y1 = x0, y0, x1, y1

    @property
    def cx(self) -> float:
        return (self.x0 + self.x1) / 2

    @property
    def cy(self) -> float:
        return (self.y0 + self.y1) / 2

    def top(self, t: float = 0.5) -> tuple[float, float]:
        return (self.x0 + (self.x1 - self.x0) * t, float(self.y0))

    def bottom(self, t: float = 0.5) -> tuple[float, float]:
        return (self.x0 + (self.x1 - self.x0) * t, float(self.y1))

    def left(self, t: float = 0.5) -> tuple[float, float]:
        return (float(self.x0), self.y0 + (self.y1 - self.y0) * t)

    def right(self, t: float = 0.5) -> tuple[float, float]:
        return (float(self.x1), self.y0 + (self.y1 - self.y0) * t)

    def xy(self) -> tuple[int, int, int, int]:
        return (self.x0, self.y0, self.x1, self.y1)

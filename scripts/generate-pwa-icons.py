import os
from PIL import Image, ImageDraw, ImageFont

ICONS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

# Brand colors
DEEP_TEAL = (14, 56, 53)       # #0e3835
MINT_TEAL = (13, 148, 136)     # #0d9488
BRIGHT_MINT = (20, 184, 166)   # #14b8a6
WHITE = (255, 255, 255)
OFF_WHITE = (251, 251, 250)

def draw_book_icon(draw, center_x, center_y, scale, color=WHITE):
    """Draw a clean, elegant open book symbol matching Lucide BookOpenText"""
    w = 40 * scale
    h = 30 * scale
    spine_x = center_x
    spine_y = center_y + 4 * scale

    line_w = max(2, int(3 * scale))

    # Left page outline
    left_top_outer = (spine_x - w, center_y - h)
    left_top_inner = (spine_x, center_y - h * 0.7)
    left_bottom_outer = (spine_x - w, center_y + h * 0.7)
    left_bottom_inner = (spine_x, center_y + h)

    # Right page outline
    right_top_inner = (spine_x, center_y - h * 0.7)
    right_top_outer = (spine_x + w, center_y - h)
    right_bottom_inner = (spine_x, center_y + h)
    right_bottom_outer = (spine_x + w, center_y + h * 0.7)

    # Left page curve
    draw.polygon([left_top_inner, left_top_outer, left_bottom_outer, left_bottom_inner], fill=None, outline=color, width=line_w)
    # Right page curve
    draw.polygon([right_top_inner, right_top_outer, right_bottom_outer, right_bottom_inner], fill=None, outline=color, width=line_w)

    # Spine line
    draw.line([(spine_x, center_y - h * 0.7), (spine_x, center_y + h)], fill=color, width=line_w)

    # Text lines on left page
    for offset_y in [-h * 0.3, 0, h * 0.3]:
        lx1 = spine_x - w * 0.8
        lx2 = spine_x - w * 0.2
        ly = center_y + offset_y
        draw.line([(lx1, ly), (lx2, ly)], fill=BRIGHT_MINT, width=max(1, int(2.2 * scale)))

    # Text lines on right page
    for offset_y in [-h * 0.3, 0, h * 0.3]:
        rx1 = spine_x + w * 0.2
        rx2 = spine_x + w * 0.8
        ry = center_y + offset_y
        draw.line([(rx1, ry), (rx2, ry)], fill=BRIGHT_MINT, width=max(1, int(2.2 * scale)))

def create_icon(size, is_maskable=False):
    # Render at 2x for antialiasing then downsample
    render_size = size * 2
    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = 0 if is_maskable else int(render_size * 0.05)
    corner_radius = 0 if is_maskable else int(render_size * 0.22)

    # Background
    if is_maskable:
        draw.rectangle([0, 0, render_size, render_size], fill=DEEP_TEAL)
    else:
        draw.rounded_rectangle([margin, margin, render_size - margin, render_size - margin], radius=corner_radius, fill=DEEP_TEAL)

    # Subtle inner accent border
    if not is_maskable:
        draw.rounded_rectangle([margin, margin, render_size - margin, render_size - margin], radius=corner_radius, outline=MINT_TEAL, width=max(2, int(render_size * 0.015)))

    # Book symbol in center
    scale = (render_size / 240.0) * (0.65 if is_maskable else 0.78)
    draw_book_icon(draw, render_size // 2, render_size // 2, scale)

    # Downsample with high quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate all standard icons
icons = [
    ("icon-192.png", 192, False),
    ("icon-512.png", 512, False),
    ("icon-maskable-512.png", 512, True),
    ("apple-touch-icon.png", 180, False),
    ("icon-180.png", 180, False),
]

for filename, size, maskable in icons:
    path = os.path.join(ICONS_DIR, filename)
    img = create_icon(size, maskable)
    img.save(path, "PNG")
    print(f"Generated {filename} ({size}x{size})")

# Also write SVG icon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#0E3835"/>
  <rect x="12" y="12" width="488" height="488" rx="100" stroke="#0D9488" stroke-width="8" stroke-opacity="0.4"/>
  <g transform="translate(116, 146)">
    <!-- Book Left -->
    <path d="M140 190 C70 170 30 185 0 200 L0 30 C30 15 70 0 140 20 Z" fill="#0D9488" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
    <!-- Book Right -->
    <path d="M140 190 C210 170 250 185 280 200 L280 30 C250 15 210 0 140 20 Z" fill="#0D9488" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
    <!-- Spine -->
    <line x1="140" y1="20" x2="140" y2="190" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>
    <!-- Lines left -->
    <line x1="30" y1="75" x2="110" y2="75" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
    <line x1="30" y1="115" x2="110" y2="115" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
    <line x1="30" y1="155" x2="90" y2="155" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
    <!-- Lines right -->
    <line x1="170" y1="75" x2="250" y2="75" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
    <line x1="170" y1="115" x2="250" y2="115" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
    <line x1="170" y1="155" x2="230" y2="155" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
  </g>
</svg>'''

with open(os.path.join(ICONS_DIR, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)
print("Generated icon.svg")

# Write favicon.svg to public/
with open(os.path.join(os.path.dirname(__file__), "..", "public", "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)
print("Generated favicon.svg")

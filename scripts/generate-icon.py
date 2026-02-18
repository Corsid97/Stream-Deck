"""Generate DeckForge app icon in multiple formats."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZES = [16, 32, 48, 64, 128, 256, 512]
RESOURCES_DIR = os.path.join(os.path.dirname(__file__), '..', 'resources')
os.makedirs(RESOURCES_DIR, exist_ok=True)

def create_icon(size):
    """Create a DeckForge icon at the given size."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background - rounded rectangle (dark blue)
    margin = max(1, size // 16)
    radius = max(2, size // 6)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        fill=(15, 23, 42),       # slate-900
        outline=(99, 102, 241),  # indigo-500
        width=max(1, size // 32)
    )

    # Draw 3x3 grid of small squares (representing the deck buttons)
    grid_margin = size // 4
    grid_size = size - 2 * grid_margin
    cell_size = grid_size // 3
    gap = max(1, cell_size // 6)

    colors = [
        (99, 102, 241),   # indigo
        (139, 92, 246),   # violet
        (236, 72, 153),   # pink
        (245, 158, 11),   # amber
        (16, 185, 129),   # emerald
        (59, 130, 246),   # blue
        (168, 85, 247),   # purple
        (239, 68, 68),    # red
        (34, 197, 94),    # green
    ]

    for row in range(3):
        for col in range(3):
            idx = row * 3 + col
            x = grid_margin + col * cell_size + gap
            y = grid_margin + row * cell_size + gap
            btn_size = cell_size - 2 * gap
            btn_radius = max(1, btn_size // 4)
            draw.rounded_rectangle(
                [x, y, x + btn_size, y + btn_size],
                radius=btn_radius,
                fill=colors[idx],
            )

    return img


# Generate PNG at 512px
icon_512 = create_icon(512)
icon_512.save(os.path.join(RESOURCES_DIR, 'icon.png'))
print('Created icon.png (512x512)')

# Generate .ico with multiple sizes for Windows
ico_images = [create_icon(s) for s in [16, 32, 48, 64, 128, 256]]
ico_images[0].save(
    os.path.join(RESOURCES_DIR, 'icon.ico'),
    format='ICO',
    sizes=[(s, s) for s in [16, 32, 48, 64, 128, 256]],
    append_images=ico_images[1:]
)
print('Created icon.ico (multi-size)')

# Generate 1024px PNG for macOS .icns (electron-builder converts it)
icon_1024 = create_icon(1024)
icon_1024.save(os.path.join(RESOURCES_DIR, 'icon-1024.png'))
print('Created icon-1024.png (1024x1024)')

print('Done! Icons saved to resources/')

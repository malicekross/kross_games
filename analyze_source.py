import os
from PIL import Image, ImageDraw

OUT_DIR = 'public/shelter_war/assets'
SOURCE_PATH = os.path.join(OUT_DIR, 'source.png')

def analyze():
    if not os.path.exists(SOURCE_PATH):
        print("Source not found")
        return

    img = Image.open(SOURCE_PATH)
    print(f"Image Dimensions: {img.width}x{img.height}")
    
    # Sample background colors (Top-Left, Top-Right, etc.)
    samples = [
        (0, 0),
        (img.width - 1, 0),
        (0, img.height - 1),
        (10, 10) # Just inside
    ]
    
    print("--- Color Samples ---")
    img_rgb = img.convert("RGB")
    for x, y in samples:
        r, g, b = img_rgb.getpixel((x, y))
        print(f"Pixel ({x}, {y}): R={r}, G={g}, B={b}")

    # Draw a 32x32 grid on a copy and save it for inspection (optional, but good for me to "see" via file size/logs)
    # Actually, I can't see the image. But I can print if the grid aligns with non-magenta pixels.
    
    # Let's check the first few rows of pixels to see where the "content" starts.
    # Scan diagonal
    print("--- Content Scan ---")
    found_content = False
    for i in range(100):
        r, g, b = img_rgb.getpixel((i, i))
        # Assuming Magenta is roughly 255, 0, 255
        if not (r > 200 and g < 50 and b > 200):
            print(f"Potential content found at {i},{i}: {r},{g},{b}")
            found_content = True
            break
            
    if not found_content:
        print("No content found in first 100px diagonal (or it's all magenta/background)")

if __name__ == "__main__":
    analyze()

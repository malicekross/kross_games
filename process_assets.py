import os
from PIL import Image, ImageDraw
import sys

# Increase recursion depth for floodfill
sys.setrecursionlimit(100000)

OUT_DIR = 'public/shelter_war/assets'
SOURCE_PATH = os.path.join(OUT_DIR, 'source.png')
EXTRA_PATH = os.path.join(OUT_DIR, 'source_extra.png')

# Expected Grid Dimensions
# Source 1: 12 cols * 32 = 384px. 13 rows * 32 = 416px.
TARGET_SIZE_1 = (384, 416)
# Source 2: 12 cols * 32 = 384px. 7 rows * 32 = 224px.
TARGET_SIZE_2 = (384, 224)

def remove_background_floodfill(img, tolerance=40):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Start from corners
    seeds = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    # Visited set
    visited = set()
    
    # Queue for BFS
    queue = []
    
    # Validate seeds and add to queue
    for x, y in seeds:
        r, g, b, a = pixels[x, y]
        # Check if seed is "magenta-ish" (R > B, R > G, etc.) or just assume corners are BG
        # Given the analysis: R=199, G=5, B=200. High R and B, Low G.
        if r > 150 and b > 150 and g < 100:
            queue.append((x, y))
            visited.add((x, y))
    
    if not queue:
        print("Warning: Corners do not look like magenta background. Using color key fallback.")
        return remove_background_colorkey(img)

    # BFS Flood Fill
    while queue:
        x, y = queue.pop(0)
        r, g, b, a = pixels[x, y]
        
        # Set to transparent
        pixels[x, y] = (0, 0, 0, 0)
        
        # Check neighbors
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                nr, ng, nb, na = pixels[nx, ny]
                
                # Check similarity to current pixel (or base magenta)
                # Let's check if it's "magenta-ish"
                # R and B should be high, G low.
                # Distance from a "pure" magenta or the seed?
                # Let's use a loose check: High R/B, Low G.
                
                is_magenta = (nr > 100 and nb > 100 and ng < 100)
                
                if is_magenta:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                    
    return img

def remove_background_colorkey(img, tolerance=60):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    
    # Target: Magenta-ish
    # Analysis showed R~200-255, B~200-255, G~0-80
    
    for item in datas:
        r, g, b, a = item
        # Check for Magenta range
        if r > 150 and b > 150 and g < 100:
             new_data.append((0, 0, 0, 0))
        else:
             new_data.append(item)
             
    img.putdata(new_data)
    return img

def crop_to_content(img):
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def process_image(path, target_size, output_name_base):
    if not os.path.exists(path):
        return None

    print(f"Processing {path}...")
    img = Image.open(path)
    
    # 1. Remove Background
    # Use color key with broad range since flood fill might be slow/complex in Python without C++
    # The "massive amounts of magenta" implies my previous key was too strict.
    clean_img = remove_background_colorkey(img)
    
    # 2. Crop to content (remove empty margins)
    cropped_img = crop_to_content(clean_img)
    
    # 3. Resize to Target Grid
    # Use NEAREST to keep pixel art look
    final_img = cropped_img.resize(target_size, Image.Resampling.NEAREST)
    
    return final_img

def extract(img, name, x, y, w, h):
    crop = img.crop((x, y, x + w, y + h))
    crop.save(os.path.join(OUT_DIR, name))
    print(f"Generated {name}")

def main():
    # --- SOURCE 1 ---
    img1 = process_image(SOURCE_PATH, TARGET_SIZE_1, 'source')
    
    if img1:
        # 1. Dwellers (Rows 1-5) -> 0-160px
        extract(img1, 'dwellers.png', 0, 0, 384, 160)
        
        # 2. Tiles (Rows 6-9) -> 160-288px
        # Wait, prompt said Rows 6-9.
        # Row 6: Dirt (y=160)
        # Row 7: Rock (y=192)
        # Row 8: Bedrock (y=224)
        # Row 9: Wall (y=256)
        # Total Height: 4 rows * 32 = 128px.
        extract(img1, 'tiles.png', 0, 160, 384, 128) # Note: Taking full width 384, though prompt said 5 variants (160px). Taking all is safer.
        
        # 3. Enemies (Rows 10-12) -> 288-384px
        # Row 10: Radroach (y=288)
        # Row 11: Mole Rat (y=320)
        # Row 12: Power Armor (y=352)
        # Height: 3 rows * 32 = 96px.
        # We will extract this for combining later.
        
        # 4. Misc (Row 13) -> 384-416px
        # Mr Handy (Cols 1-4 -> 0-128px)
        extract(img1, 'mr_handy.png', 0, 384, 128, 32)
        # UI/Rooms (Cols 5-8 -> 128-256px)
        extract(img1, 'ui.png', 128, 384, 128, 32)
        extract(img1, 'rooms.png', 128, 384, 128, 32)
        
        # Combat Units (Power Armor - Row 12)
        extract(img1, 'combat_units.png', 0, 352, 384, 32)

    # --- SOURCE 2 ---
    img2 = process_image(EXTRA_PATH, TARGET_SIZE_2, 'source_extra')
    
    # --- COMBINE ENEMIES ---
    print("Combining Enemies...")
    enemies_w, enemies_h = 384, 256 # Increased height for safety
    enemies_img = Image.new("RGBA", (enemies_w, enemies_h), (0, 0, 0, 0))
    
    if img1:
        # Source 1 Enemies (Radroach, Mole Rat) - Rows 10, 11
        # y=288. Height 64px.
        s1_enemies = img1.crop((0, 288, 384, 288+64))
        enemies_img.paste(s1_enemies, (0, 0)) # Row 0-1 in enemies.png
        
    if img2:
        # Source 2 Enemies (Rows 1-5)
        # y=0. Height 160px.
        s2_enemies = img2.crop((0, 0, 384, 160))
        enemies_img.paste(s2_enemies, (0, 64)) # Row 2-6 in enemies.png
        
        # Pets (Row 6) -> y=160
        extract(img2, 'pets.png', 0, 160, 384, 32)
        
    enemies_img.save(os.path.join(OUT_DIR, 'enemies.png'))
    print("Generated enemies.png (Combined)")

if __name__ == "__main__":
    main()

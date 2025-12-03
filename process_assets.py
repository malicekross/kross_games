import os
from PIL import Image
import math

OUT_DIR = 'public/shelter_war/assets'
SOURCE_PATH = os.path.join(OUT_DIR, 'source.png')
EXTRA_PATH = os.path.join(OUT_DIR, 'source_extra.png')

def remove_background(img, tolerance=30):
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    
    # Target colors (Grey checkerboard)
    # Based on previous analysis: ~149 and ~204/255
    # Let's define a list of target colors to key out
    targets = [
        (149, 149, 149),
        (204, 204, 204),
        (255, 255, 255) # Sometimes white
    ]
    
    for item in datas:
        r, g, b, a = item
        
        is_transparent = False
        for target in targets:
            tr, tg, tb = target
            dist = math.sqrt((r - tr)**2 + (g - tg)**2 + (b - tb)**2)
            if dist < tolerance:
                is_transparent = True
                break
        
        if is_transparent:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    return img

def extract(img, name, x, y, w, h):
    # Crop
    crop = img.crop((x, y, x + w, y + h))
    # Remove background
    clean = remove_background(crop)
    clean.save(os.path.join(OUT_DIR, name))
    print(f"Generated {name}")

def process():
    if not os.path.exists(SOURCE_PATH):
        print("Source not found")
        return

    print("Processing Source 1...")
    img1 = Image.open(SOURCE_PATH)
    
    # 1. Dwellers
    extract(img1, 'dwellers.png', 0, 0, 384, 160)
    
    # 2. Tiles
    extract(img1, 'tiles.png', 384, 0, 160, 128)
    
    # 3. Mr Handy
    extract(img1, 'mr_handy.png', 384, 224, 128, 32)
    
    # 4. UI / Rooms
    extract(img1, 'ui.png', 512, 224, 128, 32)
    extract(img1, 'rooms.png', 512, 224, 128, 32)
    
    # 5. Combat Units (Power Armor)
    extract(img1, 'combat_units.png', 384, 192, 384, 32)
    
    # --- COMBINED ENEMIES ---
    print("Combining Enemies...")
    enemies_w, enemies_h = 384, 224
    enemies_img = Image.new("RGBA", (enemies_w, enemies_h), (0, 0, 0, 0))
    
    # Source 1 Enemies (Radroach, Mole Rat) - Rows 10, 11
    # x=384, y=128, w=384, h=64
    s1_enemies = img1.crop((384, 128, 384+384, 128+64))
    s1_enemies = remove_background(s1_enemies)
    enemies_img.paste(s1_enemies, (0, 0))
    
    if os.path.exists(EXTRA_PATH):
        print("Processing Source 2...")
        img2 = Image.open(EXTRA_PATH)
        
        # Source 2 Enemies (Rows 1-5)
        # x=0, y=0, w=384, h=160
        s2_enemies = img2.crop((0, 0, 384, 160))
        s2_enemies = remove_background(s2_enemies)
        
        # Paste at y=64
        enemies_img.paste(s2_enemies, (0, 64))
        
        # Pets (Row 7 -> y=192)
        extract(img2, 'pets.png', 0, 192, 384, 32)
        
    enemies_img.save(os.path.join(OUT_DIR, 'enemies.png'))
    print("Generated enemies.png (Combined)")

if __name__ == "__main__":
    process()

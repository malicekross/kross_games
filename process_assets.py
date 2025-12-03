import os
from PIL import Image
import colorsys
import math

OUT_DIR = 'public/shelter_war/assets'
SOURCE_PATH = os.path.join(OUT_DIR, 'source.png')
EXTRA_PATH = os.path.join(OUT_DIR, 'source_extra.png')

# Target Width is fixed (12 cols * 32px = 384px)
TARGET_WIDTH = 384

def is_magenta(r, g, b):
    # Convert to float 0-1
    rf, gf, bf = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(rf, gf, bf)
    
    # Magenta Hue is 300 degrees (0.833)
    # Range: 280-320 degrees -> 0.77 - 0.89
    # Saturation should be high (> 0.5)
    # Value should be high (> 0.5)
    
    if 0.75 <= h <= 0.92 and s > 0.4 and v > 0.4:
        return True
        
    # Fallback for "white-ish" magenta or dark artifacts
    # High R, High B, Low G
    if r > 150 and b > 150 and g < 100:
        return True
        
    return False

def remove_background_hsv(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    
    count = 0
    for item in datas:
        r, g, b, a = item
        if is_magenta(r, g, b):
            new_data.append((0, 0, 0, 0))
            count += 1
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    print(f"Removed {count} magenta pixels.")
    return img

def crop_to_content(img):
    bbox = img.getbbox()
    if bbox:
        print(f"Cropping to {bbox}")
        return img.crop(bbox)
    return img

def smart_resize(img, target_width):
    w, h = img.size
    scale = target_width / w
    new_h = int(h * scale)
    print(f"Resizing from {w}x{h} to {target_width}x{new_h} (Scale: {scale:.2f})")
    return img.resize((target_width, new_h), Image.Resampling.NEAREST)

def verify_clean(img, name):
    # Check for remaining magenta
    datas = img.getdata()
    magenta_count = 0
    for item in datas:
        if len(item) > 3 and item[3] == 0: continue # Skip transparent
        r, g, b = item[:3]
        if is_magenta(r, g, b):
            magenta_count += 1
            
    if magenta_count > 0:
        print(f"WARNING: {name} still has {magenta_count} magenta pixels!")
    else:
        print(f"Verification Passed: {name} is clean.")

def extract(img, name, x, y, w, h):
    # Ensure we don't go out of bounds
    img_w, img_h = img.size
    if x + w > img_w or y + h > img_h:
        print(f"WARNING: Extract {name} out of bounds! Image is {img_w}x{img_h}, trying to get {x},{y} to {x+w},{y+h}")
        # Pad with transparent if needed? Or just crop what we can.
        # For now, let's crop what we can.
        crop = img.crop((x, y, min(x + w, img_w), min(y + h, img_h)))
    else:
        crop = img.crop((x, y, x + w, y + h))
        
    verify_clean(crop, name)
    crop.save(os.path.join(OUT_DIR, name))
    print(f"Generated {name}")

def process_file(path, name_base):
    if not os.path.exists(path):
        return None
        
    print(f"--- Processing {name_base} ---")
    img = Image.open(path)
    
    # 1. Remove Background
    clean_img = remove_background_hsv(img)
    
    # 2. Crop
    cropped_img = crop_to_content(clean_img)
    
    # 3. Resize (Width based)
    final_img = smart_resize(cropped_img, TARGET_WIDTH)
    
    return final_img

def main():
    # --- SOURCE 1 ---
    img1 = process_file(SOURCE_PATH, 'source')
    
    if img1:
        # 1. Dwellers (Rows 1-5) -> 0-160px
        extract(img1, 'dwellers.png', 0, 0, 384, 160)
        
        # 2. Tiles (Rows 6-9) -> 160-288px
        extract(img1, 'tiles.png', 0, 160, 384, 128)
        
        # 3. Misc (Row 13) -> 384-416px
        # Mr Handy (Cols 1-4 -> 0-128px)
        extract(img1, 'mr_handy.png', 0, 384, 128, 32)
        # UI/Rooms (Cols 5-8 -> 128-256px)
        extract(img1, 'ui.png', 128, 384, 128, 32)
        extract(img1, 'rooms.png', 128, 384, 128, 32)
        
        # Combat Units (Power Armor - Row 12) -> y=352
        extract(img1, 'combat_units.png', 0, 352, 384, 32)

    # --- SOURCE 2 ---
    img2 = process_file(EXTRA_PATH, 'source_extra')
    
    # --- COMBINE ENEMIES ---
    print("Combining Enemies...")
    # Target Height: 7 rows (Radroach, Mole Rat, Ghoul, Raider, Psycho, Mutant, Deathclaw) * 32 = 224px
    enemies_w, enemies_h = 384, 224
    enemies_img = Image.new("RGBA", (enemies_w, enemies_h), (0, 0, 0, 0))
    
    if img1:
        # Source 1 Enemies (Radroach, Mole Rat) - Rows 10, 11
        # y=288. Height 64px.
        s1_enemies = img1.crop((0, 288, 384, 288+64))
        enemies_img.paste(s1_enemies, (0, 0)) # Row 0-1
        
    if img2:
        # Source 2 Enemies (Rows 1-5)
        # y=0. Height 160px.
        s2_enemies = img2.crop((0, 0, 384, 160))
        enemies_img.paste(s2_enemies, (0, 64)) # Row 2-6
        
        # Pets (Row 6) -> y=160
        extract(img2, 'pets.png', 0, 160, 384, 32)
        
    verify_clean(enemies_img, 'enemies.png')
    enemies_img.save(os.path.join(OUT_DIR, 'enemies.png'))
    print("Generated enemies.png (Combined)")

if __name__ == "__main__":
    main()

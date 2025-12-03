import os
from PIL import Image
import colorsys
import numpy as np

OUT_DIR = 'public/shelter_war/assets'
SOURCE_PATH = os.path.join(OUT_DIR, 'source.png')
EXTRA_PATH = os.path.join(OUT_DIR, 'source_extra.png')

TARGET_CELL_SIZE = 32

def is_magenta(r, g, b):
    # HSV check
    rf, gf, bf = r/255.0, g/255.0, b/255.0
    h, s, v = colorsys.rgb_to_hsv(rf, gf, bf)
    if 0.75 <= h <= 0.92 and s > 0.4 and v > 0.4: return True
    if r > 150 and b > 150 and g < 100: return True
    return False

def remove_background(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if is_magenta(r, g, b):
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

def find_intervals(histogram, threshold=0):
    # Find start and end indices of continuous blocks > threshold
    intervals = []
    start = None
    for i, val in enumerate(histogram):
        if val > threshold:
            if start is None:
                start = i
        else:
            if start is not None:
                intervals.append((start, i))
                start = None
    if start is not None:
        intervals.append((start, len(histogram)))
    return intervals

def smart_slice(img, expected_cols, expected_rows):
    # 1. Get Alpha Channel / Non-Transparent Mask
    alpha = np.array(img.split()[-1])
    
    # 2. Project to Y axis (Row detection)
    row_hist = np.sum(alpha, axis=1)
    rows = find_intervals(row_hist)
    
    # Fix Merged Rows
    # If a row is > 1.5x target size, split it
    new_rows = []
    for start, end in rows:
        height = end - start
        if height > TARGET_CELL_SIZE * 1.5:
            # How many rows fit?
            count = round(height / TARGET_CELL_SIZE)
            print(f"Splitting merged row of height {height} into {count} rows")
            step = height / count
            for i in range(count):
                s = start + int(i * step)
                e = start + int((i + 1) * step)
                new_rows.append((s, e))
        else:
            new_rows.append((start, end))
    rows = new_rows

    # 3. Project to X axis (Column detection)
    col_hist = np.sum(alpha, axis=0)
    cols = find_intervals(col_hist)
    
    # Fix Merged Cols
    new_cols = []
    for start, end in cols:
        width = end - start
        if width > TARGET_CELL_SIZE * 1.5:
            count = round(width / TARGET_CELL_SIZE)
            print(f"Splitting merged col of width {width} into {count} cols")
            step = width / count
            for i in range(count):
                s = start + int(i * step)
                e = start + int((i + 1) * step)
                new_cols.append((s, e))
        else:
            new_cols.append((start, end))
    cols = new_cols
    
    print(f"Detected {len(cols)} columns and {len(rows)} rows.")
    
    # Extract cells
    cells = []
    for r_start, r_end in rows:
        row_cells = []
        for c_start, c_end in cols:
            cell = img.crop((c_start, r_start, c_end, r_end))
            row_cells.append(cell)
        cells.append(row_cells)
        
    return cells

def resize_and_center(img, target_size):
    # Resize preserving aspect ratio
    w, h = img.size
    if w == 0 or h == 0: return Image.new("RGBA", (target_size, target_size), (0,0,0,0))
    
    ratio = min(target_size / w, target_size / h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    
    resized = img.resize((new_w, new_h), Image.Resampling.NEAREST)
    
    # Center
    final = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2
    final.paste(resized, (offset_x, offset_y))
    return final

def process_sheet(path, expected_cols, expected_rows):
    if not os.path.exists(path): return None
    
    print(f"Processing {path}...")
    img = Image.open(path)
    img = remove_background(img)
    
    # Slice
    raw_cells = smart_slice(img, expected_cols, expected_rows)
    
    # Reassemble into Target Grid (32x32)
    # If we detected fewer rows/cols, we fill what we have.
    # If we detected more, we take the first N.
    
    out_w = expected_cols * TARGET_CELL_SIZE
    out_h = expected_rows * TARGET_CELL_SIZE
    out_img = Image.new("RGBA", (out_w, out_h), (0, 0, 0, 0))
    
    for r, row_cells in enumerate(raw_cells):
        if r >= expected_rows: break
        for c, cell in enumerate(row_cells):
            if c >= expected_cols: break
            
            # Process Cell
            final_cell = resize_and_center(cell, TARGET_CELL_SIZE)
            
            # Paste
            x = c * TARGET_CELL_SIZE
            y = r * TARGET_CELL_SIZE
            out_img.paste(final_cell, (x, y))
            
    return out_img

def extract_from_sheet(sheet, name, r_start, r_count, c_start, c_count):
    x = c_start * TARGET_CELL_SIZE
    y = r_start * TARGET_CELL_SIZE
    w = c_count * TARGET_CELL_SIZE
    h = r_count * TARGET_CELL_SIZE
    
    crop = sheet.crop((x, y, x+w, y+h))
    crop.save(os.path.join(OUT_DIR, name))
    print(f"Saved {name}")

def main():
    # Source 1: 12 Cols, 13 Rows
    sheet1 = process_sheet(SOURCE_PATH, 12, 13)
    
    if sheet1:
        # Dwellers: Rows 0-4 (5 rows)
        extract_from_sheet(sheet1, 'dwellers.png', 0, 5, 0, 12)
        # Tiles: Rows 5-8 (4 rows)
        extract_from_sheet(sheet1, 'tiles.png', 5, 4, 0, 12) # Taking full width
        # Enemies (Part 1): Rows 9-11 (3 rows) -> Radroach, Mole Rat, Power Armor
        # Wait, prompt said: Row 10, 11, 12. (0-indexed: 9, 10, 11)
        # Let's extract them for combining.
        
        # Misc: Row 12 (1 row)
        # Mr Handy: Cols 0-3
        extract_from_sheet(sheet1, 'mr_handy.png', 12, 1, 0, 4)
        # UI/Rooms: Cols 4-7
        extract_from_sheet(sheet1, 'ui.png', 12, 1, 4, 4)
        extract_from_sheet(sheet1, 'rooms.png', 12, 1, 4, 4)
        
        # Combat Units (Power Armor): Row 11
        extract_from_sheet(sheet1, 'combat_units.png', 11, 1, 0, 12)

    # Source 2: 12 Cols, 7 Rows
    sheet2 = process_sheet(EXTRA_PATH, 12, 7)
    
    # Combine Enemies
    # Target: 7 Rows
    # Row 0: Radroach (Source 1, Row 9)
    # Row 1: Mole Rat (Source 1, Row 10)
    # Row 2: Ghoul (Source 2, Row 0)
    # Row 3: Raider (Source 2, Row 1)
    # Row 4: Psycho (Source 2, Row 2)
    # Row 5: Mutant (Source 2, Row 3)
    # Row 6: Deathclaw (Source 2, Row 4)
    
    enemies_img = Image.new("RGBA", (384, 224), (0,0,0,0))
    
    if sheet1:
        # Radroach
        r = sheet1.crop((0, 9*32, 384, 10*32))
        enemies_img.paste(r, (0, 0))
        # Mole Rat
        m = sheet1.crop((0, 10*32, 384, 11*32))
        enemies_img.paste(m, (0, 32))
        
    if sheet2:
        # Rows 0-4
        others = sheet2.crop((0, 0, 384, 5*32))
        enemies_img.paste(others, (0, 64))
        
        # Pets: Row 5 (Index 5)
        extract_from_sheet(sheet2, 'pets.png', 5, 1, 0, 12)
        
    enemies_img.save(os.path.join(OUT_DIR, 'enemies.png'))
    print("Saved enemies.png")

if __name__ == "__main__":
    main()

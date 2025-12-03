import os
from PIL import Image

OUT_DIR = 'public/shelter_war/assets'

def process_lpc_character(path, out_name):
    if not os.path.exists(path): return
    
    img = Image.open(path)
    # LPC Standard: 64x64 cells.
    # Walk Right is usually Row 11 (index 11, 0-based).
    # Wait, let's verify standard.
    # Rows:
    # 0-3: Spellcast
    # 4-7: Thrust
    # 8-11: Walk (Up, Left, Down, Right)
    # 12-15: Slash
    # 16-19: Shoot
    # 20: Hurt
    
    # We want Walk Right (Row 11) or Walk Left (Row 9).
    # Side view game -> Walk Right or Left.
    # Let's take Row 11 (Walk Right).
    
    cell_w, cell_h = 64, 64
    row = 11
    
    # Extract the 9 frames of walking
    # 832 width / 64 = 13 cols.
    # Walk animation is usually 9 frames.
    
    frames = []
    for col in range(9):
        x = col * cell_w
        y = row * cell_h
        frame = img.crop((x, y, x+cell_w, y+cell_h))
        # Resize to 32x32 for our game?
        # Our game expects 32x32.
        frame = frame.resize((32, 32), Image.Resampling.NEAREST)
        frames.append(frame)
        
    # Create a strip for the game
    # Game expects: 1 row per variant?
    # Current dwellers.png has 5 rows (variants).
    # We only have 1 variant (Dark Male).
    # Let's repeat it 5 times for now.
    
    out_w = 32 * 9 # 9 frames
    out_h = 32 * 5 # 5 rows
    out_img = Image.new("RGBA", (out_w, out_h), (0,0,0,0))
    
    for r in range(5):
        for c, frame in enumerate(frames):
            out_img.paste(frame, (c * 32, r * 32))
            
    out_img.save(os.path.join(OUT_DIR, out_name))
    print(f"Generated {out_name}")

def process_tiles(path, out_name):
    if not os.path.exists(path): return
    img = Image.open(path)
    # Just resize/crop to fit generic tile slots for now
    # Or just use as is?
    # Game expects 32x32 tiles in a row.
    # Let's just crop some 32x32 chunks from the mockup.
    
    out_img = Image.new("RGBA", (384, 128), (0,0,0,0))
    
    # Crop 4 random 32x32 chunks
    for i in range(4):
        x = (i * 64) % img.width
        y = (i * 32) % img.height
        crop = img.crop((x, y, x+32, y+32))
        out_img.paste(crop, (0, i*32)) # 1st col, different rows
        
    out_img.save(os.path.join(OUT_DIR, out_name))
    print(f"Generated {out_name}")

def main():
    process_lpc_character(os.path.join(OUT_DIR, 'darkmale.png'), 'dwellers.png')
    process_lpc_character(os.path.join(OUT_DIR, 'maleorcfullsheet.png'), 'enemies.png')
    process_tiles(os.path.join(OUT_DIR, 'downloaded_pack/Post-Apocalyptic-Set.png'), 'tiles.png')

if __name__ == "__main__":
    main()

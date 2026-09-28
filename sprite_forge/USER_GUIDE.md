# Sprite Forge AI - User Guide

## Getting Started

### 1. API Key Setup
To use Sprite Forge AI, you need a Google Gemini API Key.
1.  Get your key from [Google AI Studio](https://aistudio.google.com/).
2.  Open Sprite Forge AI.
3.  Click the **Settings Gear** (top right).
4.  Enter your API Key. It is saved locally in your browser.

---

## Generating Sprites

1.  **Enter Prompt**: Describe your character (e.g., "A pixel art knight in golden armor walking").
2.  **Select Style**: Choose "Pixel Art" for best results.
3.  **Click Generate**: The AI will create a sprite sheet.
    *   **Note**: The AI is instructed to generate a **Solid Magenta Background**. This is normal and used for transparent removal.

---

## Editor Features

### Remove Background (Magic Wand)
The background removal tool is optimized for pixel art.
1.  Click **"Remove Background"**.
2.  The application uses a **Logic-Based Chroma Filter**.
    *   It detects any pixel that is "more purple than green".
    *   This instantly removes the Magenta background and any dark purple edges.
    *   Your sprite's colors (Blue, Yellow, Red, etc.) are safe.

### Download Asset
1.  Click **"Download Asset"**.
2.  The sprite is saved as a high-quality PNG with transparency.

---

## Troubleshooting

### "I see white boxes around my sprite"
*   Sometimes the AI tries to be helpful by adding frames.
*   **Fix**: Try adding "NO FRAMES" or "SOLID BACKGROUND" to your prompt description, although the system automatically adds these instructions.

### "My sprite generated with a white background"
*   If the AI ignores the Magenta instruction, the "Remove Background" tool might not work perfectly (it looks for purple).
*   **Fix**: Click Generate again. The prompt is randomized slightly and usually corrects itself.

### "My character has purple eyes/clothes"
*   If your character *is* purple, the background remover might accidentally delete parts of them.
*   **Fix**: In the prompt, ask for a "Green Background" instead, or manually edit the image in an external tool like Photoshop/Aseprite.

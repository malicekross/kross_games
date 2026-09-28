# Sprite Forge AI

Sprite Forge AI is a modern React application designed for game developers to generate high-resolution video game sprite sheets using Google's Gemini 3 Pro model.

![App Screenshot](https://raw.githubusercontent.com/malicekross/sprite-forge-ai/main/public/screenshot-placeholder.png) 
*(Note: You can replace this link with a real screenshot later)*

## Features

- **Forge Sprites**: Generate game assets with sophisticated prompts.
- **Smart Prompting**: Automatically ensures "Solid Magenta" backgrounds and enforces negative constraints ("No White Boxes") for optimal parsing.
- **Intelligent Background Removal**:
    - Uses a **Logic-Based Chroma Filter** optimized for pixel art.
    - Instantly removes Magenta backgrounds and dark purple fringes.
    - Preserves internal sprite colors better than standard chroma keying.
- **Download Asset**: Export your creations as transparent PNGs ready for game engines.
- **Gemini Integration**: Built to work with Google's Gemini API for high-quality generation.
- **Auto-Versioning**: Automatic version incrementing on every deployment.

## User Guide
See [USER_GUIDE.md](./USER_GUIDE.md) for detailed instructions on getting started, prompting strategies, and troubleshooting.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/malicekross/sprite-forge-ai.git
   cd sprite-forge-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Workflow

1. **Enter API Key**: On the first visit, enter your Gemini API Key in the settings or generation page.
2. **Generate**: Describe your sprite (e.g., "A warrior in gold armor, side view") and pick a style.
3. **Edit**: Review the result in the Editor.
4. **Deploy**:
   ```bash
   npm run deploy
   ```
   This command builds the app, increments the patch version, and pushes to the `gh-pages` branch.

## License

MIT

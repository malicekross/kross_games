# Hacking Wars (v1.0)

A real-time strategy "hacking" game built with **PixiJS** and **Vite**.

## 🛠 Technology Stack
-   **Engine:** [PixiJS (v8)](https://pixijs.com/) - High-performance 2D rendering.
-   **Build Tool:** [Vite](https://vitejs.dev/) - Fast development server and bundler.
-   **Language:** JavaScript (ES Modules).
-   **Deployment:** GitHub Pages (via `gh-pages`).

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+ recommended)
-   npm

### Installation
```bash
npm install
```

### Development
Run the local development server:
```bash
npm run dev
```
Open `http://localhost:5173` (or the port shown in terminal).

### Building for Production
Build the project to the `dist` folder:
```bash
npm run build
```

### Deployment
Deploy the `dist` folder to GitHub Pages:
```bash
npm run deploy
```

## 📂 Project Structure
```
src/
├── hacking/
│   ├── assets/          # Sprites and textures
│   ├── Game.js          # Main game loop, input, and AI logic
│   ├── Node.js          # Node entity (generation, upgrades, rendering)
│   ├── Connection.js    # Wire entity (packet transfer, visualization)
│   └── Unit.js          # Packet entity (movement, collision)
├── index.html           # Entry point
└── main.js              # Bootstrapper
```

## ⚙️ Configuration
-   **Canvas Size:** Automatically scales to window size. On mobile (<768px), it uses 90% of screen width/height.
-   **Game Loop:** Runs on PixiJS `app.ticker`.
-   **Assets:** SVGs loaded via Pixi `Assets.load`.

## 🐛 Debugging
-   Console logs are enabled for AI behavior and connection logic.
-   Check `Game.js` -> `updateAI()` for AI decision logs.

import { Application, Assets, Sprite, Container, Graphics } from 'pixi.js';
import spritesUrl from './assets/sprites.svg';
import wireUrl from './assets/wire.svg';
import { Node } from './Node.js';
import { Connection } from './Connection.js';

/**
 * Main Game Class
 * Handles the game loop, input, AI, and rendering.
 */
export class Game {
    constructor() {
        this.app = new Application();
        this.nodes = [];
        this.units = [];
        this.connections = [];

        // Input handling state
        this.isDragging = false;
        this.isCutting = false;
        this.dragStartNode = null;
        this.cutStart = { x: 0, y: 0 };
        this.mouseX = 0;
        this.mouseY = 0;

        // UI Elements Cache
        this.ui = {
            playerScore: document.getElementById('player-score'),
            enemyScore: document.getElementById('enemy-score'),
            scoreBarFill: document.getElementById('score-bar-fill'),
            victoryScreen: document.getElementById('victory-screen')
        };
        this.lastPlayerScore = -1;
        this.lastEnemyScore = -1;

        // Game Over State
        this.gameOverTriggered = false;
        this.gameOverTimer = 0;
        this.paused = false;
    }

    /**
     * Initialize PixiJS Application
     * @param {HTMLCanvasElement} canvas 
     */
    async init(canvas) {
        const isMobile = window.innerWidth < 768;
        const initOptions = {
            canvas: canvas,
            backgroundColor: 0x050510,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        };

        // Mobile optimization: Use 90% of screen
        if (isMobile) {
            initOptions.width = window.innerWidth * 0.9;
            initOptions.height = window.innerHeight * 0.9;
        } else {
            initOptions.resizeTo = window;
        }

        await this.app.init(initOptions);

        // Load Assets
        this.spritesTexture = await Assets.load(spritesUrl);
        this.wireTexture = await Assets.load(wireUrl);

        // Layers (Order matters!)
        this.connectionLayer = new Container();
        this.nodeLayer = new Container();
        this.unitLayer = new Container();
        this.uiLayer = new Container();

        this.app.stage.addChild(this.connectionLayer);
        this.app.stage.addChild(this.unitLayer);
        this.app.stage.addChild(this.nodeLayer);
        this.app.stage.addChild(this.uiLayer);

        // Input Events
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointerdown', (e) => this.handleInputStart(e));
        this.app.stage.on('pointermove', (e) => this.handleInputMove(e));
        this.app.stage.on('pointerup', (e) => this.handleInputEnd(e));
        this.app.stage.on('pointerupoutside', (e) => this.handleInputEnd(e));

        // Drag Visuals
        this.dragGraphics = new Graphics();
        this.uiLayer.addChild(this.dragGraphics);

        console.log('Game initialized with PixiJS');

        // Start Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime / 60);
        });
    }

    /**
     * Generate a random level
     */
    generateLevel() {
        // Cleanup existing entities
        this.nodes.forEach(n => n.destroy());
        this.units.forEach(u => u.destroy());
        this.connections.forEach(c => c.destroy());

        this.nodes = [];
        this.units = [];
        this.connections = [];
        this.gameOverTriggered = false;
        this.gameOverTimer = 0;
        this.paused = false;

        const isMobile = this.app.screen.width < 768;
        const nodeCount = Math.floor(Math.random() * 6) + 5;

        const padding = isMobile ? 50 : 100;
        const minDistance = isMobile ? 100 : 150;

        const width = this.app.screen.width;
        const height = this.app.screen.height;

        console.log(`Target Node Count: ${nodeCount}, Canvas: ${width}x${height}, Mobile: ${isMobile}`);

        // Place nodes with distance check
        for (let i = 0; i < nodeCount; i++) {
            let valid = false;
            let x, y;
            let attempts = 0;

            while (!valid && attempts < 100) {
                x = padding + Math.random() * (width - padding * 2);
                y = padding + Math.random() * (height - padding * 2);

                valid = true;
                for (const node of this.nodes) {
                    const dx = node.x - x;
                    const dy = node.y - y;
                    if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                        valid = false;
                        break;
                    }
                }
                attempts++;
            }

            if (valid) {
                let owner = 'neutral';
                if (i === 0) owner = 'player';
                if (i === 1) owner = 'enemy';

                const node = new Node(x, y, owner, this.spritesTexture);
                if (owner === 'player' || owner === 'enemy') {
                    node.value = Math.floor(Math.random() * 11) + 20;
                }

                if (isMobile) {
                    node.container.scale.set(0.75);
                }

                this.nodes.push(node);
                this.nodeLayer.addChild(node.container);
            } else {
                console.warn('Failed to place node after 100 attempts');
            }
        }
    }

    /**
     * Main Update Loop
     * @param {number} deltaTime - Time in seconds
     */
    update(deltaTime) {
        if (this.paused) return;

        this.nodes.forEach(node => {
            // Check for owner switch (Player <-> Enemy) using persistent state
            if (node.owner !== node.lastOwner) {
                if ((node.lastOwner === 'player' && node.owner === 'enemy') ||
                    (node.lastOwner === 'enemy' && node.owner === 'player')) {

                    // Cut ONLY outgoing wires from this node
                    for (let i = this.connections.length - 1; i >= 0; i--) {
                        const conn = this.connections[i];
                        if (conn.from === node) {
                            conn.destroy();
                            this.connections.splice(i, 1);
                        }
                    }
                }
                // Update tracker
                node.lastOwner = node.owner;
            }

            const outgoingCount = this.connections.filter(c => c.from === node).length;
            node.update(deltaTime, outgoingCount);
        });
        this.connections.forEach(conn => conn.update(deltaTime, this));
        this.units.forEach(unit => unit.update(deltaTime, this));

        this.updateAI(deltaTime);

        // Cleanup inactive units
        for (let i = this.units.length - 1; i >= 0; i--) {
            if (!this.units[i].active) {
                this.units[i].destroy();
                this.units.splice(i, 1);
            }
        }

        // Cleanup neutral connections (shouldn't happen often but safe to keep)
        for (let i = this.connections.length - 1; i >= 0; i--) {
            if (this.connections[i].from.owner === 'neutral') {
                this.connections[i].destroy();
                this.connections.splice(i, 1);
            }
        }

        this.updateScoreUI();
        this.checkWinCondition(deltaTime);
        this.drawDragUI();
    }

    drawDragUI() {
        this.dragGraphics.clear();

        if (this.isDragging && this.dragStartNode) {
            // Draw connection preview
            this.dragGraphics.moveTo(this.dragStartNode.x, this.dragStartNode.y);
            this.dragGraphics.lineTo(this.mouseX, this.mouseY);
            this.dragGraphics.stroke({ width: 2, color: 0xffffff, alpha: 0.5, dash: [5, 5] });
        } else if (this.isCutting) {
            // Draw cut line
            this.dragGraphics.moveTo(this.cutStart.x, this.cutStart.y);
            this.dragGraphics.lineTo(this.mouseX, this.mouseY);
            this.dragGraphics.stroke({ width: 2, color: 0xff0000 });
        }
    }

    checkWinCondition(deltaTime) {
        if (this.gameOverTriggered) {
            this.gameOverTimer += deltaTime;
            if (this.gameOverTimer > 5.0) {
                this.paused = true;
            }
            return;
        }

        let enemyScore = 0;
        let playerScore = 0;
        this.nodes.forEach(node => {
            if (node.owner === 'enemy') enemyScore += Math.floor(node.value);
            if (node.owner === 'player') playerScore += Math.floor(node.value);
        });
        this.units.forEach(unit => {
            if (unit.owner === 'enemy') enemyScore++;
            if (unit.owner === 'player') playerScore++;
        });

        if (enemyScore === 0) {
            this.gameOverTriggered = true;
            if (this.ui.victoryScreen) this.ui.victoryScreen.style.display = 'flex';
        } else if (playerScore === 0) {
            this.gameOverTriggered = true;
            const defeatScreen = document.getElementById('defeat-screen');
            if (defeatScreen) defeatScreen.style.display = 'flex';
        }
    }

    updateScoreUI() {
        let playerScore = 0;
        let enemyScore = 0;

        // Count nodes
        this.nodes.forEach(node => {
            if (node.owner === 'player') playerScore += Math.floor(node.value);
            if (node.owner === 'enemy') enemyScore += Math.floor(node.value);
        });

        // Count units
        this.units.forEach(unit => {
            if (unit.owner === 'player') playerScore++;
            if (unit.owner === 'enemy') enemyScore++;
        });

        // Only update DOM if values changed
        if (playerScore !== this.lastPlayerScore || enemyScore !== this.lastEnemyScore) {
            this.lastPlayerScore = playerScore;
            this.lastEnemyScore = enemyScore;

            if (this.ui.playerScore) this.ui.playerScore.innerText = playerScore;
            if (this.ui.enemyScore) this.ui.enemyScore.innerText = enemyScore;

            if (this.ui.scoreBarFill) {
                const total = playerScore + enemyScore;
                const playerPercent = total > 0 ? (playerScore / total) * 100 : 50;
                this.ui.scoreBarFill.style.width = `${playerPercent}%`;
            }
        }
    }

    handleInputStart(e) {
        const x = e.global.x;
        const y = e.global.y;

        const clickedNode = this.nodes.find(node => node.contains(x, y));

        if (clickedNode && clickedNode.owner === 'player') {
            this.isDragging = true;
            this.dragStartNode = clickedNode;
        } else {
            // Start cutting
            this.isCutting = true;
            this.cutStart = { x, y };
            this.mouseX = x;
            this.mouseY = y;
        }
    }

    handleInputMove(e) {
        this.mouseX = e.global.x;
        this.mouseY = e.global.y;
    }

    handleInputEnd(e) {
        const x = e.global.x;
        const y = e.global.y;

        if (this.isDragging && this.dragStartNode) {
            const targetNode = this.nodes.find(node => node.contains(x, y));
            if (targetNode) {
                if (targetNode !== this.dragStartNode) {
                    this.createConnection(this.dragStartNode, targetNode);
                }
            }
        } else if (this.isCutting) {
            // Check for intersections with connections
            const connectionsToCut = this.connections.filter(conn => {
                // Prevent cutting enemy wires
                if (conn.from.owner === 'enemy') return false;

                return this.linesIntersect(
                    this.cutStart, { x: this.mouseX, y: this.mouseY },
                    conn.from, conn.to
                );
            });

            // Remove connections
            connectionsToCut.forEach(conn => {
                // Instant transfer units on cut wires
                this.units.forEach(unit => {
                    if (unit.source === conn.from && unit.target === conn.to && unit.active) {
                        unit.hitTarget(); // Instantly arrive
                    }
                });

                // Destroy connection
                conn.destroy();
                const index = this.connections.indexOf(conn);
                if (index > -1) this.connections.splice(index, 1);
            });
        }

        this.isDragging = false;
        this.isCutting = false;
        this.dragStartNode = null;
    }

    createConnection(from, to) {
        // Check if connection already exists (A -> B)
        const existing = this.connections.find(c => c.from === from && c.to === to);
        if (existing) {
            console.log("Connection rejected: Already exists");
            return;
        }

        // Check if reverse connection exists (B -> A)
        const reverse = this.connections.find(c => c.from === to && c.to === from);

        // Check limits for 'from' node
        const outgoingCount = this.connections.filter(c => c.from === from).length;
        if (outgoingCount >= from.maxConnections) {
            console.log(`Connection rejected: Max connections reached (${outgoingCount}/${from.maxConnections})`);
            return;
        }

        // Conditional Tug of War Logic
        if (reverse) {
            // If owners are the SAME (Player <-> Player OR Enemy <-> Enemy), FLIP IT
            // This prevents "Tug of War" between friendly nodes, allowing re-routing instead.
            if (from.owner === to.owner) {
                reverse.destroy();
                this.connections = this.connections.filter(c => c !== reverse);
            }
            // If owners are DIFFERENT (Player <-> Enemy), ALLOW IT (Tug of War)
        }

        // Create new connection
        const conn = new Connection(from, to, this.wireTexture);
        this.connections.push(conn);
        this.connectionLayer.addChild(conn.container);
    }

    // Helper: Line Segment Intersection
    linesIntersect(a, b, c, d) {
        const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
        if (det === 0) return false;
        const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
        const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

    updateAI(deltaTime) {
        this.aiTimer = (this.aiTimer || 0) + deltaTime;
        if (this.aiTimer < 3.0) return; // Run every 3 seconds
        this.aiTimer = 0;

        const enemyNodes = this.nodes.filter(n => n.owner === 'enemy');
        // console.log(`AI Update: Found ${enemyNodes.length} enemy nodes.`); // Commented out to reduce spam

        enemyNodes.forEach(source => {
            // Check active connections
            const activeConnections = this.connections.filter(c => c.from === source).length;
            if (activeConnections >= source.maxConnections) return;

            // Find potential targets
            // Priority 1: Neutral nodes (Expand)
            // Priority 2: Player nodes (Attack if stronger)
            // Priority 3: Weak Enemy nodes (Reinforce - optional, maybe skip for simple AI)

            let targets = this.nodes.filter(n => n !== source);

            // Filter targets that are already connected FROM this source
            targets = targets.filter(t => !this.connections.some(c => c.from === source && c.to === t));

            let bestTarget = null;

            // 1. Try to find a neutral node
            const neutralTargets = targets.filter(n => n.owner === 'neutral');
            if (neutralTargets.length > 0) {
                // Pick closest or random? Random is less predictable.
                bestTarget = neutralTargets[Math.floor(Math.random() * neutralTargets.length)];
            }

            // 2. If no neutral, try to attack player (Aggressive)
            if (!bestTarget) {
                const playerTargets = targets.filter(n => n.owner === 'player');
                // Balanced: Attack only if we have MORE units
                // Was: source.value > n.value * 0.8
                // Now: source.value > n.value
                const vulnerableTargets = playerTargets.filter(n => source.value > n.value);

                if (vulnerableTargets.length > 0) {
                    bestTarget = vulnerableTargets[Math.floor(Math.random() * vulnerableTargets.length)];
                }
            }

            if (bestTarget) {
                this.createConnection(source, bestTarget);
            }
        });
    }
}

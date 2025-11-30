import spritesUrl from './assets/sprites.svg';
import wireUrl from './assets/wire.svg';
import { Node } from './Node.js';
import { Connection } from './Connection.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.units = [];
        this.connections = [];
        this.lastTime = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input handling
        this.isDragging = false;
        this.isCutting = false;
        this.dragStartNode = null;
        this.cutStart = { x: 0, y: 0 };
        this.mouseX = 0;
        this.mouseY = 0;

        this.canvas.addEventListener('mousedown', (e) => this.handleInputStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleInputMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleInputEnd(e));

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleInputStart(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.handleInputMove(e.touches[0]); }, { passive: false });
        this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.handleInputEnd(e.changedTouches[0]); }, { passive: false });

        // Load sprites
        this.sprites = new Image();
        this.sprites.src = spritesUrl;
        this.spritesLoaded = false;
        this.sprites.onload = () => { this.spritesLoaded = true; };
        this.sprites.onerror = (e) => { console.error('Error loading sprites'); };

        // Load wire sprite
        this.wireSprite = new Image();
        this.wireSprite.src = wireUrl;
        this.wireSpriteLoaded = false;
        this.wireSprite.onload = () => { this.wireSpriteLoaded = true; };
        this.wireSprite.onerror = (e) => { console.error('Error loading wire sprite'); };

        // UI Cache
        this.ui = {
            playerScore: document.getElementById('player-score'),
            enemyScore: document.getElementById('enemy-score'),
            scoreBarFill: document.getElementById('score-bar-fill'),
            victoryScreen: document.getElementById('victory-screen')
        };
        this.lastPlayerScore = -1;
        this.lastEnemyScore = -1;

        console.log('Game initialized');
    }

    generateLevel() {
        this.nodes = [];
        this.units = [];
        this.connections = [];

        const nodeCount = Math.floor(Math.random() * 6) + 5; // 5 to 10
        const padding = 100;
        const minDistance = 150;

        console.log(`Target Node Count: ${nodeCount}, Canvas: ${this.canvas.width}x${this.canvas.height}`);

        for (let i = 0; i < nodeCount; i++) {
            let valid = false;
            let x, y;
            let attempts = 0;

            while (!valid && attempts < 100) {
                x = padding + Math.random() * (this.canvas.width - padding * 2);
                y = padding + Math.random() * (this.canvas.height - padding * 2);

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

                const node = new Node(x, y, owner);
                if (owner === 'player') node.value = 10;
                this.nodes.push(node);
            } else {
                console.warn('Failed to place node after 100 attempts');
            }
        }
        console.log(`Total Nodes: ${this.nodes.length}`);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log(`Resized Canvas to ${this.canvas.width}x${this.canvas.height}`);
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        let deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Cap deltaTime to prevent physics explosions on tab switch
        if (deltaTime > 0.1) deltaTime = 0.1;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(deltaTime) {
        this.nodes.forEach(node => node.update(deltaTime));
        this.connections.forEach(conn => conn.update(deltaTime, this)); // Update connections
        this.units.forEach(unit => unit.update(deltaTime, this));

        // Cleanup dead units
        this.units = this.units.filter(unit => unit.active);

        // Cleanup invalid connections (if owner changes)
        this.connections = this.connections.filter(conn => conn.from.owner === 'player');

        this.updateScoreUI();
        this.checkWinCondition();
    }

    checkWinCondition() {
        let enemyScore = 0;
        this.nodes.forEach(node => { if (node.owner === 'enemy') enemyScore += Math.floor(node.value); });
        this.units.forEach(unit => { if (unit.owner === 'enemy') enemyScore++; });

        if (enemyScore === 0) {
            if (this.ui.victoryScreen) this.ui.victoryScreen.style.display = 'flex';
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

    draw() {
        this.ctx.fillStyle = '#050510'; // Fallback background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.connections.forEach(conn => conn.draw(this.ctx, this));

        // Draw drag line (Connection)
        if (this.isDragging && this.dragStartNode) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.moveTo(this.dragStartNode.x, this.dragStartNode.y);
            this.ctx.lineTo(this.mouseX, this.mouseY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw cut line
        if (this.isCutting) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(this.cutStart.x, this.cutStart.y);
            this.ctx.lineTo(this.mouseX, this.mouseY);
            this.ctx.stroke();
        }

        this.nodes.forEach(node => {
            // Count outgoing connections for this node
            const count = this.connections.filter(c => c.from === node).length;
            node.draw(this.ctx, this.sprites, this.spritesLoaded, count);
        });
        this.units.forEach(unit => unit.draw(this.ctx, this.sprites, this.spritesLoaded));
    }

    handleInputStart(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

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
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    handleInputEnd(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

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
                return this.linesIntersect(
                    this.cutStart, { x: this.mouseX, y: this.mouseY },
                    conn.from, conn.to
                );
            });

            // Remove connections
            this.connections = this.connections.filter(conn => !connectionsToCut.includes(conn));

            // Instant transfer units on cut wires
            connectionsToCut.forEach(conn => {
                this.units.forEach(unit => {
                    if (unit.source === conn.from && unit.target === conn.to && unit.active) {
                        unit.hitTarget(); // Instantly arrive
                    }
                });
            });
        }

        this.isDragging = false;
        this.isCutting = false;
        this.dragStartNode = null;
    }

    createConnection(from, to) {
        // Check if connection already exists (A -> B)
        const existing = this.connections.find(c => c.from === from && c.to === to);
        if (existing) return;

        // Check if reverse connection exists (B -> A)
        const reverse = this.connections.find(c => c.from === to && c.to === from);

        // Check limits for 'from' node
        const outgoingCount = this.connections.filter(c => c.from === from).length;
        if (outgoingCount >= from.maxConnections) return;

        // If reverse exists, remove it (Swap direction)
        if (reverse) {
            this.connections = this.connections.filter(c => c !== reverse);
        }

        // Create new connection
        this.connections.push(new Connection(from, to));
    }

    // Helper: Line Segment Intersection
    linesIntersect(a, b, c, d) {
        const det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
        if (det === 0) return false;
        const lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
        const gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

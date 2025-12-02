import { GRID_COLS, GRID_ROWS } from '../constants.js';
import { TILE_TYPES } from './GridSystem.js';

export class Pathfinder {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
    }

    findPath(startX, startY, endX, endY) {
        // Simple A* implementation
        const startNode = { x: startX, y: startY, g: 0, h: 0, f: 0, parent: null };
        const endNode = { x: endX, y: endY };

        const openList = [startNode];
        const closedList = [];

        while (openList.length > 0) {
            // Get node with lowest f score
            let currentNode = openList[0];
            let currentIndex = 0;

            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < currentNode.f) {
                    currentNode = openList[i];
                    currentIndex = i;
                }
            }

            // Remove current from open, add to closed
            openList.splice(currentIndex, 1);
            closedList.push(currentNode);

            // Found destination
            if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
                const path = [];
                let current = currentNode;
                while (current !== null) {
                    path.push({ x: current.x, y: current.y });
                    current = current.parent;
                }
                return path.reverse();
            }

            // Generate children
            const neighbors = [
                { x: 0, y: -1 }, // Up
                { x: 0, y: 1 },  // Down
                { x: -1, y: 0 }, // Left
                { x: 1, y: 0 }   // Right
            ];

            for (const neighbor of neighbors) {
                const neighborX = currentNode.x + neighbor.x;
                const neighborY = currentNode.y + neighbor.y;

                // Check bounds
                if (neighborX < 0 || neighborX >= GRID_COLS || neighborY < 0 || neighborY >= GRID_ROWS) {
                    continue;
                }

                // UI Restrictions (Top 2 rows, Bottom 2 rows)
                if (neighborY < 2 || neighborY >= GRID_ROWS - 2) {
                    continue;
                }

                // Check walkable (Empty or Room) OR if it is the destination
                const tile = this.gridSystem.getTile(neighborX, neighborY);
                const isDestination = neighborX === endX && neighborY === endY;

                if (!tile || (!isDestination && tile.type !== TILE_TYPES.EMPTY && tile.type !== TILE_TYPES.ROOM)) {
                    continue;
                }

                // Check if in closed list
                if (closedList.find(node => node.x === neighborX && node.y === neighborY)) {
                    continue;
                }

                // Create new node
                const gScore = currentNode.g + 1;
                const hScore = Math.abs(neighborX - endNode.x) + Math.abs(neighborY - endNode.y); // Manhattan distance
                const fScore = gScore + hScore;

                const newNode = {
                    x: neighborX,
                    y: neighborY,
                    g: gScore,
                    h: hScore,
                    f: fScore,
                    parent: currentNode
                };

                // Check if in open list with lower g score
                const openNode = openList.find(node => node.x === neighborX && node.y === neighborY);
                if (openNode && gScore > openNode.g) {
                    continue;
                }

                openList.push(newNode);
            }
        }

        return null; // No path found
    }
}

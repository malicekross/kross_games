import { Game } from './Game.js';

const canvas = document.getElementById('game-canvas');
const game = new Game();
game.init(canvas).catch(console.error);

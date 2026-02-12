/**
 * HIGHWAY RUSH - Core Game Script
 * Mission: Enhance reflexes and quick decision-making [cite: 2]
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GAME OBJECT DEFINITION
    const game = {
        active: false,
        score: 0,
        enemies: [],
        speed: 5,
        playerX: 175,
        lastSpawn: 0,
        spawnRate: 1200,

        start() {
            ui.hideAll();
            this.score = 0;
            this.speed = 5;
            this.spawnRate = 1200;
            this.playerX = 175;
            this.enemies.forEach(e => e.remove());
            this.enemies = [];
            this.active = true;
            this.updateScoreUI();
            this.updatePlayerPosition();
            requestAnimationFrame((t) => this.loop(t));
        },

        loop(timestamp) {
            if (!this.active) return;

            // Mission: Dodge incoming cars without crashing [cite: 3]
            if (timestamp - this.lastSpawn > this.spawnRate) {
                this.spawnEnemy();
                this.lastSpawn = timestamp;
                // Increase intensity as time passes [cite: 36]
                if (this.spawnRate > 500) this.spawnRate -= 15;
                this.speed += 0.05;
            }

            this.moveEnemies();
            requestAnimationFrame((t) => this.loop(t));
        },

        spawnEnemy() {
            const el = document.createElement('div');
            el.className = 'car enemy-car';
            // Random lanes for enemy cars [cite: 35]
            el.style.left = `${Math.random() * 330}px`;
            el.style.top = '-100px';
            document.getElementById('road').appendChild(el);
            this.enemies.push(el);
        },

        moveEnemies() {
            const playerEl = document.getElementById('player');
            this.enemies.forEach((en, i) => {
                let top = parseFloat(en.style.top);
                top += this.speed;
                en.style.top = `${top}px`;

                // Collision Detection [cite: 33, 53]
                if (this.checkCollision(playerEl, en)) {
                    this.gameOver();
                }

                // Scoring: +1 Point for every enemy car successfully avoided [cite: 31, 51]
                if (top > 600) {
                    en.remove();
                    this.enemies.splice(i, 1);
                    this.score++;
                    this.updateScoreUI();
                }
            });
        },

        checkCollision(a, b) {
            const r1 = a.getBoundingClientRect();
            const r2 = b.getBoundingClientRect();
            return !(r1.top > r2.bottom || r1.bottom < r2.top || 
                     r1.right < r2.left || r1.left > r2.right);
        },

        updateScoreUI() {
            document.getElementById('score-display').innerText = `SCORE: ${this.score}`;
        },

        updatePlayerPosition() {
            document.getElementById('player').style.left = `${this.playerX}px`;
        },

        gameOver() {
            this.active = false;
            document.getElementById('final-score-text').innerText = `YOUR TOTAL SCORE IS ${this.score}`; [cite: 46]
            ui.showGameOver();
        }
    };

    // 2. UI MANAGEMENT
    const ui = {
        hideAll: () => document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')),
        showMenu: () => { ui.hideAll(); document.getElementById('main-menu').classList.remove('hidden'); },
        showInstructions: () => { ui.hideAll(); document.getElementById('instructions-screen').classList.remove('hidden'); },
        showGameOver: () => { document.getElementById('game-over-screen').classList.remove('hidden'); }
    };

    // 3. ATTACH BUTTON LISTENERS (Manual override for HTML onclick)
    // Selection based on button text/position as per Storyboard [cite: 9, 10, 47]
    const buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach(btn => {
        const txt = btn.innerText.toUpperCase();
        if (txt.includes('START') || txt.includes('RESTART')) {
            btn.onclick = () => game.start();
        } else if (txt.includes('INSTRUCTION')) {
            btn.onclick = () => ui.showInstructions();
        } else if (txt.includes('EXIT') || txt.includes('QUIT')) {
            btn.onclick = () => ui.showMenu();
        }
    });

    // 4. CONTROLS (Desktop & Mobile)
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (game.active) {
            if (key === 'a' && game.playerX > 10) game.playerX -= 30; // Move Left [cite: 27]
            if (key === 'd' && game.playerX < 340) game.playerX += 30; // Move Right [cite: 28]
            if (e.key === 'Escape') ui.showMenu(); // Exit Game [cite: 29]
            game.updatePlayerPosition();
        } else {
            // Return to menu on any key from Instructions [cite: 37]
            if (!document.getElementById('instructions-screen').classList.contains('hidden')) {
                ui.showMenu();
            }
        }
    });

    let touchStartX = 0;
    const gameContainer = document.getElementById('game-container');
    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gameContainer.addEventListener('touchend', (e) => {
        if (!game.active) return;
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            game.playerX += (diff > 0) ? 50 : -50;
            if (game.playerX < 0) game.playerX = 0;
            if (game.playerX > 340) game.playerX = 340;
            game.updatePlayerPosition();
        }
    }, { passive: true });
});

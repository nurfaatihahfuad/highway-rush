/**
 * HIGHWAY RUSH - Core Game Script
 * Mission: Enhance reflexes and quick decision-making [cite: 2]
 */

// Use an IIFE or window.onload to ensure the DOM is ready
window.onload = () => {
    
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

            // Spawn enemy cars from top to bottom [cite: 13]
            if (timestamp - this.lastSpawn > this.spawnRate) {
                this.spawnEnemy();
                this.lastSpawn = timestamp;
                // Intensity increases the longer you survive [cite: 36]
                if (this.spawnRate > 500) this.spawnRate -= 15;
                this.speed += 0.05;
            }

            this.moveEnemies();
            requestAnimationFrame((t) => this.loop(t));
        },

        spawnEnemy() {
            const el = document.createElement('div');
            el.className = 'car enemy-car';
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

                // Collision Detection: Game ends if car overlaps with another [cite: 33, 44]
                if (this.checkCollision(playerEl, en)) {
                    this.gameOver();
                }

                // Scoring: +1 Point for every car successfully avoided [cite: 31, 51]
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
            document.getElementById('final-score-text').innerText = `YOUR TOTAL SCORE IS ${this.score}`; // [cite: 17, 46]
            ui.showGameOver();
        }
    };

    const ui = {
        hideAll: () => document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')),
        showMenu: () => { ui.hideAll(); document.getElementById('main-menu').classList.remove('hidden'); },
        showInstructions: () => { ui.hideAll(); document.getElementById('instructions-screen').classList.remove('hidden'); },
        showGameOver: () => { document.getElementById('game-over-screen').classList.remove('hidden'); }
    };

    // Attach to window so HTML onclick can find them
    window.game = game;
    window.ui = ui;

    // Controls: A key for Left, D key for Right [cite: 27, 28]
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (game.active) {
            if (key === 'a' && game.playerX > 10) game.playerX -= 30;
            if (key === 'd' && game.playerX < 340) game.playerX += 30;
            if (e.key === 'Escape') game.gameOver(); // [cite: 29]
            game.updatePlayerPosition();
        } else if (!document.getElementById('instructions-screen').classList.contains('hidden')) {
            ui.showMenu(); // Press any key to return to menu [cite: 37]
        }
    });

    // Mobile Swipe Controls
    let touchStartX = 0;
    const gameContainer = document.getElementById('game-container');

    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gameContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 40;
        
        if (game.active) {
            if (touchEndX < touchStartX - swipeThreshold && game.playerX > 10) {
                game.playerX -= 50; // Swipe Left
            } else if (touchEndX > touchStartX + swipeThreshold && game.playerX < 340) {
                game.playerX += 50; // Swipe Right
            }
            game.updatePlayerPosition();
        }
    }, { passive: true });
};

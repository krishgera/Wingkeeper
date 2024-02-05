document.addEventListener('DOMContentLoaded', () => {
    const bird = document.getElementById('bird');
    const startButton = document.getElementById('startButton');
    const resumeButton = document.getElementById('resumeButton');
    const restartButtonGameOver = document.getElementById('restartButtonGameOver');
    const exitButton = document.getElementById('exitButton');
    const exitButtonGameOver = document.getElementById('exitButtonGameOver');
    const mainMenu = document.getElementById('mainMenu');
    const gameOverMenu = document.getElementById('gameOverMenu');
    const pauseMenu = document.getElementById('pauseMenu');
    const scoreboard = document.getElementById('scoreboard');
    const gameField = document.getElementById('gameField');
    let gameActive = false;
    let balls = [];
    let goalsConceded = 0;
    let lastBallSpawnTime = 0;
    let ballSpeed = 2;
    let playerSpeed = 2;
    let ballSize = 35; 
    let keysPressed = {};
    let gameStartTime;
    let speedIncreaseInterval = 30000; 
    let maxSpeedIncreaseTime = 180000; 

    function toggleDisplay(element, show) {
        element.style.display = show ? 'block' : 'none';
    }

    function startGame() {
        toggleDisplay(mainMenu, false);
        toggleDisplay(gameOverMenu, false);
        toggleDisplay(gameField, true);
        toggleDisplay(scoreboard, true);
        gameActive = true;
        gameStartTime = Date.now();
        lastBallSpawnTime = Date.now();
        goalsConceded = 0;
        ballSpeed = 2; 
        updateScoreboard();
        requestAnimationFrame(gameLoop);
    }

    function spawnBall() {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.left = `${gameField.offsetWidth}px`;
        ball.style.top = `${Math.random() * (gameField.offsetHeight - ballSize)}px`;
        gameField.appendChild(ball);
        balls.push({ element: ball, x: gameField.offsetWidth, speed: ballSpeed });
    }

    function updateBallSpeed() {
        const elapsedTime = Date.now() - gameStartTime;
        if (elapsedTime < maxSpeedIncreaseTime && elapsedTime > speedIncreaseInterval) {
            ballSpeed += 0.5;
            gameStartTime += speedIncreaseInterval;
        }
    }

    function movePlayer() {
        let top = parseFloat(bird.style.top) || gameField.offsetHeight / 2;
        let left = parseFloat(bird.style.left) || gameField.offsetWidth * 0.2; 
        if (keysPressed['w'] && top > 0) top -= playerSpeed;
        if (keysPressed['s'] && top < gameField.offsetHeight - bird.offsetHeight) top += playerSpeed;
        if (keysPressed['a'] && left > 0) left -= playerSpeed;
        if (keysPressed['d'] && left < gameField.offsetWidth / 2 - bird.offsetWidth) left += playerSpeed;
        bird.style.top = `${top}px`;
        bird.style.left = `${left}px`;
    }

    function moveBalls() {
        balls.forEach((ball, index) => {
            ball.x -= ball.speed;
            ball.element.style.left = `${ball.x}px`;
            if (ball.x + ballSize < 0) {
                balls.splice(index, 1);
                ball.element.remove();
                goalsConceded++;
                updateScoreboard();
            }
        });
    }

    function checkCollisions() {
        balls.forEach((ball, index) => {
            if (isCollision(bird, ball.element)) {
                balls.splice(index, 1);
                ball.element.remove();
            }
        });
    }

    function isCollision(bird, ball) {
        const birdRect = bird.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        return !(birdRect.right < ballRect.left || birdRect.left > ballRect.right ||
                 birdRect.bottom < ballRect.top || birdRect.top > ballRect.bottom);
    }

    function updateScoreboard() {
        scoreboard.textContent = `Goals Conceded: ${goalsConceded}`;
    }

    function pauseGame() {
        gameActive = !gameActive;
        toggleDisplay(pauseMenu, !gameActive);
        if (gameActive) {
            requestAnimationFrame(gameLoop);
        }
    }
    function gameOver() {
        gameActive = false;
        toggleDisplay(gameOverMenu, true);
        toggleDisplay(gameField, false);
        toggleDisplay(scoreboard, false);
        balls.forEach(ball => ball.element.remove());
        balls = [];
    }

    function gameLoop(timestamp) {
        if (!gameActive) return;

        const currentTime = Date.now();
        if (currentTime - lastBallSpawnTime > 2000) {
            spawnBall();
            lastBallSpawnTime = currentTime;
        }       
        movePlayer();
        moveBalls();
        checkCollisions();
        updateBallSpeed();

        if (goalsConceded >= 10) {
            gameOver();
        } else {
            requestAnimationFrame(gameLoop);
        }
    }

    startButton.addEventListener('click', startGame);
    
    resumeButton.addEventListener('click', pauseGame);

    exitButton.addEventListener('click', () => {
        toggleDisplay(pauseMenu, false);
        toggleDisplay(mainMenu, true);
        resetGame();
    });

    restartButtonGameOver.addEventListener('click', startGame);

    exitButtonGameOver.addEventListener('click', () => {
        toggleDisplay(gameOverMenu, false);
        toggleDisplay(mainMenu, true);
    });

    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        if (e.key === 'Escape') {
            if (!mainMenu.style.display || mainMenu.style.display === 'none') {
                pauseGame();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;
    });
});

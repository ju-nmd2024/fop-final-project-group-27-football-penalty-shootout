class Ball {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.speed = createVector(random(-5, 5), -6);
        this.radius = 10;
    }

    move() {
        this.position.add(this.speed);

        // Boundary collision detection
        if (this.position.x < 0 || this.position.x > width) {
            this.speed.x *= -1; // Bounce horizontally
        }
    }

    // Check if the ball is out of bounds
    checkOutOfBounds() {
        if (this.position.y < 0 || this.position.y > height) {
            return true;
        }
        return false;
    }

    // Reset the ball's position and speed
    reset(x, y) {
        this.position.set(x, y);
        this.speed.set(random(-5, 5), -6);
    }

    draw() {
        fill(255, 255, 0);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }

    // Check collision with the goalkeeper
    checkCollisionWithGoalkeeper(goalkeeper) {
        let d = dist(this.position.x, this.position.y, goalkeeper.position.x, goalkeeper.position.y);
        return d < this.radius + goalkeeper.radius;
    }

    // Check collision with obstacles
    checkCollisionWithObstacle(obstacle) {
        let d = dist(this.position.x, this.position.y, obstacle.position.x, obstacle.position.y);
        return d < this.radius + obstacle.radius;
    }

    // Check collision with the player
    checkCollisionWithPlayer(playerX) {
        let playerY = height - 30;
        let playerWidth = 50;
        let playerHeight = 10;

        // Check if the ball hits the player's rectangle area
        if (
            this.position.x > playerX - playerWidth / 2 &&
            this.position.x < playerX + playerWidth / 2 &&
            this.position.y + this.radius > playerY - playerHeight / 2 &&
            this.position.y + this.radius < playerY + playerHeight / 2
        ) {
            this.speed.y *= -1; // Bounce vertically
            this.position.y = playerY - this.radius; // Ensure the ball is above the player
        }
    }
}

class Goalkeeper {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.speed = 2; // Speed of the goalkeeper
        this.radius = 15;
        this.direction = 1; // 1 for right, -1 for left
    }

    move() {
        // Move the goalkeeper left and right
        this.position.x += this.speed * this.direction;

        // Reverse direction upon reaching boundaries
        if (this.position.x < width / 4 || this.position.x > width / 4 + width / 2) {
            this.direction *= -1;
        }
    }

    draw() {
        fill(0, 255, 0);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}

class Obstacle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.radius = 10;
    }

    draw() {
        fill(255, 0, 0); // Red obstacle
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}

class GameManager {
    constructor() {
        this.playerX = width / 2;
        this.lives = 3;
        this.score = 0;
        this.gameState = "playing"; // Game states: "playing", "paused", "gameOver"
        this.ball = new Ball(width / 2, height - 50);
        this.goalkeeper = new Goalkeeper(width / 2, 60); // Goalkeeper's position
        this.obstacles = this.createObstacles(); // Initialize obstacles
    }

    // Create obstacles and position them on both sides of the goal
    createObstacles() {
        let obstacles = [];
        // 5 obstacles on the left
        let xOffsetLeft = width / 4 - 40;
        let yOffsetLeft = 120;
        for (let i = 0; i < 5; i++) {
            let x = xOffsetLeft - i * 25;
            let y = yOffsetLeft + i * 20;
            obstacles.push(new Obstacle(x, y));
        }
        // 5 obstacles on the right
        let xOffsetRight = width / 4 + width / 2 + 20;
        let yOffsetRight = 120;
        for (let i = 0; i < 5; i++) {
            let x = xOffsetRight + i * 25;
            let y = yOffsetRight + i * 20;
            obstacles.push(new Obstacle(x, y));
        }
        return obstacles;
    }

    updateGameState() {
        if (this.lives <= 0) {
            this.gameState = "gameOver";
            noLoop(); // Stop updating
        }
    }

    checkGoal() {
        // Check if the ball enters the goal
        if (
            this.ball.position.y < 60 &&
            this.ball.position.x > width / 4 &&
            this.ball.position.x < width / 4 + width / 2
        ) {
            this.score++;
            this.pauseGame();
        }
    }

    handleOutOfBounds() {
        // Detect if the ball goes out of bounds
        if (this.ball.checkOutOfBounds()) {
            this.lives--;
            this.pauseGame();
        }
    }

    handleCollisions() {
        // Check collisions with the goalkeeper and obstacles
        if (this.ball.checkCollisionWithGoalkeeper(this.goalkeeper)) {
            this.ball.speed.y *= -1; // Bounce
        }

        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.ball.checkCollisionWithObstacle(this.obstacles[i])) {
                this.ball.speed.x *= -1; // Bounce
                // Remove obstacle
                this.obstacles.splice(i, 1);
                break;
            }
        }

        // Check collision with the player
        this.ball.checkCollisionWithPlayer(this.playerX);
    }

    pauseGame() {
        if (this.lives > 0) {
            this.gameState = "paused";
            noLoop(); // Pause game
        } else {
            this.gameState = "gameOver";
            noLoop(); // Stop game
        }
    }

    resumeGame() {
        this.ball.reset(width / 2, height - 50);
        this.gameState = "playing";
        loop(); // Resume game loop
    }

    restartGame() {
        this.lives = 3;
        this.score = 0;
        this.ball.reset(width / 2, height - 50);
        this.obstacles = this.createObstacles(); // Recreate obstacles
        this.gameState = "playing";
        loop(); // Resume game loop
    }

    displayScoreAndLives() {
        fill(255);
        textSize(20);
        text(`Score: ${this.score}`, 10, 30);
        text(`Lives: ${this.lives}`, width - 100, 30);
    }

    drawPlayer() {
        fill(255, 0, 0);
        rect(this.playerX - 25, height - 30, 50, 10);
    }
}

// Global variable
let game;

// Set up the canvas size
function setup() {
    createCanvas(600, 620);
    game = new GameManager();
    textFont('Arial');
    textSize(20);
}

// Draw grass background
function draw() {
    background(50, 200, 50);
    drawGoal();

    if (game.gameState === "playing") {
        game.ball.move();
        game.ball.draw();
        game.goalkeeper.move();
        game.goalkeeper.draw();
        game.handleCollisions();
        game.checkGoal();
        game.handleOutOfBounds();
    }

    game.displayScoreAndLives();
    game.drawPlayer();
    for (let i = 0; i < game.obstacles.length; i++) {
        game.obstacles[i].draw(); // Draw obstacles
    }
}

// Draw the goal width
function drawGoal() {
    fill(255);
    rect(width / 4, 50, width / 2 + 40, 15);
}

// Resume the game when paused by clicking the screen
function mousePressed() {
    if (game.gameState === "paused") {
        game.resumeGame();
    }
}

// Keyboard controls: Press R to reset the game and use arrow keys to move the player
function keyPressed() {
    let keyLower = key.toLowerCase(); // Ignore case
    if (game.gameState === "gameOver" && keyLower === "r") {
        game.restartGame(); // Press R to restart the game
    }
    if (keyCode === LEFT_ARROW) {
        game.playerX = max(game.playerX - 20, 25);
    } else if (keyCode === RIGHT_ARROW) {
        game.playerX = min(game.playerX + 20, width - 25);
    }
}

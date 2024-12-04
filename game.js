// Ball launch state variables
let ballLaunched = false;

// Ball
class Ball {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.speed = createVector(0, 0); // initial speed = 0
        this.radius = 10;
    }

    move(game) {
        this.position.add(this.speed);

        // Detection of touching left and right boundaries
        if (this.position.x < 0 || this.position.x > width) {
            game.lives--; // lost a live
            game.resetBall(); // reset the position of the ball
        }

        // Detect hitting upper and lower boundaries (if necessary)
        if (this.position.y < 0 || this.position.y > height) {
            game.lives--; // lost a live
            game.resetBall(); // reset the position of the ball
        }
    }

    reset(x, y) {
        this.position.set(x, y);
        this.speed.set(0, 0); // Reset speed = 0
    }

    launch(targetX, targetY) {
        // Calculate the velocity vector towards the mouse position and normalize
        let direction = createVector(targetX - this.position.x, targetY - this.position.y);
        direction.normalize();
        this.speed.set(direction.mult(6)); // Set the speed
    }

    draw() {
        fill(255, 255, 0);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
    checkOutOfBounds() {
        return (
            this.position.x < 0 ||
            this.position.x > width ||
            this.position.y < 0 ||
            this.position.y > height
        );
    }
    

// The collision between football and shooter
handleCollisions() {
    // Detecting collisions with players
    if (this.ball.checkCollisionWithShooter(this.shooter)) {
        this.ball.speed.y *= -1; // rebound
        this.ball.position.y = this.shooter.position.y - this.shooter.height / 2 - this.ball.radius; // change the position
        this.shooter.kickBall(); // Trigger kick animation
    }

    //Detect collision with the green ball (obstacle)
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
        let obstacle = this.obstacles[i];
        if (this.ball.checkCollisionWithObstacle(obstacle)) {
            this.ball.speed.x *= -1; // refraction
            this.ball.speed.y *= -1;
            this.obstacles.splice(i, 1); // Remove obstacles
        }
    }
}
checkCollisionWithShooter(shooter) {
    let topEdge = shooter.position.y - shooter.height / 2;
    let leftEdge = shooter.position.x - shooter.width / 2;
    let rightEdge = shooter.position.x + shooter.width / 2;

    return (
        this.position.y + this.radius >= topEdge &&
        this.position.x >= leftEdge &&
        this.position.x <= rightEdge &&
        this.speed.y > 0 // Make sure the ball hits from above
    );
}

    checkCollisionWithObstacle(obstacle) {
        let d = dist(this.position.x, this.position.y, obstacle.position.x, obstacle.position.y);
        return d < this.radius + obstacle.radius;
    }
}

// Obstacle（small green ball）
class Obstacle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.radius = 13; // Reduce the ball radius
    }

    draw() {
        fill(5, 255, 0); // green
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}

// The Goalkeeper
class Goalkeeper {  // Goalkeeper's movement
    constructor(x, y) {
        this.position = createVector(x, y);
        this.speed = 2; // Goalkeeper's speed
        this.radius = 15;
        this.direction = 1; // Direction: 1 for right, -1 for left
    }
    
    move() {
        this.position.x += this.speed * this.direction;

        //Limit the goalkeeper's range of movement in the penalty area (penalty area)
        if (this.position.x < 150 + this.radius || this.position.x > 450 - this.radius) {
            this.direction *= -1; // Reverse Direction
        }
    }

    // Draw the Goalkeeper
    draw() { 
        fill(0,0,0);
        ellipse(this.position.x, this.position.y, this.radius * 2);
    }
}

// Shooter（ shoot platform ）
// Shooter（Shooting platform, replaced with player model）
class Shooter {
    constructor() {
        this.position = createVector(width / 2, height - 30); // initial position
        this.width = 80; // Player width (same as goalkeeper)
        this.height = 10; // Player height
        this.speed = 5; // Player movement speed
        this.kick = false; // Playing status
        this.kickFrame = 0; // Kick animation frames
    }

    move(direction) {
        this.position.x += direction * this.speed;
        this.position.x = constrain(this.position.x, this.width / 2, width - this.width / 2);
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // Darw the jersey with blue and white stripes
        for (let i = -20; i < 20; i += 10) {
            fill(i % 20 === 255 ? 0 : 255, 0, i % 20 === 0 ? 0 :0); // blue and white stripes
            rect(i, -40, 10, 40); // width=10，height=40
        }

        // head
        fill(0, 0, 0);
        ellipse(0, -60, 30, 30);

        // legs
        fill(0, 0, 0);
        if (this.kick) {
            // kick animation
            if (this.kickFrame < 10) {
                rect(-15, 0, 10, 30); // Still leg
                rect(5, 10 - this.kickFrame, 10, 30); // Move leg
            } else {
                this.kick = false; // Action completed, reset
                this.kickFrame = 0;
            }
            this.kickFrame++;
        } else {
            rect(-15, 0, 10, 30); // left leg
            rect(5, 0, 10, 30); // right leg
        }
        pop();
    }

    kickBall() {
        this.kick = true;
    }
}



// GameManager
class GameManager {
    constructor() {
        this.lives = 3;
        this.score = 0;
        this.gameState = "start";
        this.ball = new Ball(width / 2, height - 40); // Create a new Ball object
        this.goalkeeper = new Goalkeeper(width / 2, 60);
        this.shooter = new Shooter();
        this.obstacles = this.createObstacles();
    }
    

    showStartScreen() {
        fill(255);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("Football Penalty Shootout", width / 2, height / 2 - 40);
        textSize(20);
        text("Press SPACE to Start", width / 2, height / 2 + 20);
    }

    createObstacles() {
        let obstacles = [];
        while (obstacles.length < 10) {
            let x = random(50, width - 50);
            let y = random(150, 350); // Limit the Y coordinate to the range 150-350
            let valid = true;

            // Check if it is too close to other obstacles
            for (let obstacle of obstacles) {
                let d = dist(x, y, obstacle.position.x, obstacle.position.y);
                if (d < 18) { // The interval is the diameter of the green ball (8*2 + interval 10)
                    valid = false;
                    break;
                }
            }

            if (valid) { 
                obstacles.push(new Obstacle(x, y));
            }
        }
        return obstacles;
    }

    updateGameState() {
        if (this.lives <= 0) {
            this.gameState = "gameOver";
            this.showGameOver(); // Game over prompt
        }
    }

    showGameOver() {
        noLoop(); // Stop the game loop
        fill(255, 100, 0);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("Game Over", width / 2, height / 2);
        textSize(20);
        text("Press 'R' to Restart", width / 2, height / 2 + 50);
    }
    checkGoal() {
        if (
            this.ball.position.y < 60 &&
            this.ball.position.x > width / 4 &&
            this.ball.position.x < width / 4 + width / 2
        ) {
            this.score++;
            this.resetBall();
        }
    }

    handleOutOfBounds() {
        if (this.ball.checkOutOfBounds()) { // Check if the ball is out of bounds
            this.lives--; // decrease lives
            this.resetBall(); //reset the position of the ball
        }
    }
    

    handleCollisions() {
        // Detecting collisions with players
        if (this.ball.checkCollisionWithShooter(this.shooter)) {
            this.ball.speed.y *= -1; // Ball bounce
            this.ball.position.y = this.shooter.position.y - this.shooter.height / 2 - this.ball.radius; // change the position of the ball
            this.shooter.kickBall(); //Trigger the player's kicking action
        }
    
        // Detect collision with the green ball (obstacle)
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obstacle = this.obstacles[i];
            if (this.ball.checkCollisionWithObstacle(obstacle)) {
                this.ball.speed.x *= -1; // refraction
                this.ball.speed.y *= -1;
                this.obstacles.splice(i, 1); // Remove obstacles
            }
        }
    }
   

    resetBall() {
        this.ball.reset(this.shooter.position.x, this.shooter.position.y - 15);
        ballLaunched = false; // Reset the shoot state
    }

    displayScoreAndLives() {  // Display the score and lives
        fill(255);
        textSize(20);
        text(`Score: ${this.score}`, width / 4 - 50, 30);
        text(`Lives: ${this.lives}`, 3 * width / 4 + 50, 30);
    }

    drawObstacles() {
        for (let obstacle of this.obstacles) {
            obstacle.draw();
        }
    }
}

let game;

function setup() {
    createCanvas(600, 700);
    game = new GameManager();
    textFont('Arial');
    textSize(20);
}

function draw() {
    background(0, 120, 60); // green background
    drawField();

    if (game.gameState === "start") {
        game.showStartScreen();
        return;
    }

    if (game.gameState === "playing") {
        if (keyIsDown(37)) { // left arrow
            game.shooter.move(-1);
        }
        if (keyIsDown(39)) { // right arrow
            game.shooter.move(1);
        }

        if (!ballLaunched) {
            game.ball.reset(game.shooter.position.x, game.shooter.position.y - 15);
        }

        game.goalkeeper.move();
        game.goalkeeper.draw();
        game.shooter.draw();
        game.displayScoreAndLives();
        game.drawObstacles();
        if (ballLaunched) {
            game.ball.move(game); // Passing the game object
        }
        game.ball.draw();
        game.handleCollisions();
        game.checkGoal();   
        game.handleOutOfBounds(); // Check if the ball is out of bounds
        game.updateGameState();
    }
}



function drawField() {
    background(0, 120, 60); // Green grass
      
    // Draw the football field
    push();
    fill(0,100,50);
    noStroke();
    rect(0,0,600,80);
    rect(0,160,600,80);
    rect(0,320,600,80);
    rect(0,480,600,80);
    rect(0,620,600,80);
    pop();
  
    // Draw the line
    fill(0,100,50);
    stroke(255);
    strokeWeight(5);
    ellipse(300,350,140,140);
  
    // Draw the field spot
    fill(255);
    ellipse(300,600,5,5);
    ellipse(300,100,5,5);
    ellipse(300,350,5,5);
    
    // Draw the penalty area
    fill(255);
    rect(0,350,600,0);
    rect(150,560,300,0);
    rect(150,560,0,140);
    rect(450,560,0,140);
    rect(150,0,0,140);
    rect(450,0,0,140);
    rect(150,140,300,0);
    
    // Draw the door
    fill(201,147,121);
    noStroke();
    rect(220,10,150, 20); // up door rectangle
    rect(230,670,150, 20); // bottom door rectangle
}

function mousePressed() {
    if (!ballLaunched && game.gameState === "playing") {
        ballLaunched = true;
        game.ball.launch(mouseX, mouseY); //Play the ball
        game.shooter.kickBall(); //Trigger kick action
    }
}


function keyPressed() {
    if (game.gameState === "start" && key === " ") {
        // Press the spacebar to start the game
        game.gameState = "playing";
    }

    if (game.gameState === "gameOver" && key.toLowerCase() === "r") {
        // Press R to restart
        game = new GameManager();
        loop();
    }
}

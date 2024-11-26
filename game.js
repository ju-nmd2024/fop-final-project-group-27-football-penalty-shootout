class Ball {
    constructor(x, y) {
      this.position = createVector(x, y);
      this.speed = createVector(random(-5, 5), -6);  
      this.radius = 10;
    }
  
    move() {
      this.position.add(this.speed);
  
      // 边界碰撞检测
      if (this.position.x < 0 || this.position.x > width) {
        this.speed.x *= -1; // 水平方向反弹
      }
    }
    // 检测是否出界
    checkOutOfBounds() {
      if (this.position.y < 0 || this.position.y > height) {
        return true;
      }
      return false;
    }
    // 重置球的位置和速度
    reset(x, y) {
      this.position.set(x, y);
      this.speed.set(random(-5, 5), -6); 
    }
  
    draw() {
      fill(255, 255, 0);
      ellipse(this.position.x, this.position.y, this.radius * 2);
    }
    // 检测与守门员的碰撞
    checkCollisionWithGoalkeeper(goalkeeper) {
      let d = dist(this.position.x, this.position.y, goalkeeper.position.x, goalkeeper.position.y);
      return d < this.radius + goalkeeper.radius;
    }
    
  }
  
  class Goalkeeper {
    constructor(x, y) {
      this.position = createVector(x, y);
      this.speed = 2; // 守门员的速度
      this.radius = 15;
      this.direction = 1; // 1表示向右，-1表示向左
    }
  
    move() {
      // 守门员左右移动
      this.position.x += this.speed * this.direction;
  
      // 到达边界时反向
      if (this.position.x < width / 4 || this.position.x > width / 4 + width / 2) {
        this.direction *= -1;
      }
    }
  
    draw() {
      fill(0, 255, 0);
      ellipse(this.position.x, this.position.y, this.radius * 2);
    }
  }
  
  
  class GameManager {
    constructor() {
      this.playerX = width / 2;
      this.lives = 3;
      this.score = 0;
      this.gameState = "playing"; // 游戏状态： "playing", "paused", "gameOver"
      this.ball = new Ball(width / 2, height - 50);
      this.goalkeeper = new Goalkeeper(width / 2, 60); // 守门员位置
    }
  
  
    updateGameState() {
      if (this.lives <= 0) {
        this.gameState = "gameOver";
        noLoop(); // 停止更新
      }
    }
  
    checkGoal() {
      // 检查球是否进球
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
      // 检测球是否出界
      if (this.ball.checkOutOfBounds()) {
        this.lives--;
        this.pauseGame();
      }
    }
  
    handleCollisions() {
      // 检测与守门员和障碍物的碰撞
      if (this.ball.checkCollisionWithGoalkeeper(this.goalkeeper)) {
        this.ball.speed.y *= -1; // 反弹
      }
      
    }
  
    pauseGame() {
      if (this.lives > 0) {
        this.gameState = "paused";
        noLoop(); // 暂停游戏
      } else {
        this.gameState = "gameOver";
        noLoop(); // 停止游戏
      }
    }
  
    resumeGame() {
      this.ball.reset(width / 2, height - 50);
      this.gameState = "playing";
      loop(); // 恢复游戏循环
    }
  
    restartGame() {
      this.lives = 3;
      this.score = 0;
      this.ball.reset(width / 2, height - 50);
      this.gameState = "playing";
      loop(); // 恢复游戏循环
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
  
  // 全局变量
  let game;
   
  // 画布尺寸设置
  function setup() {
    createCanvas(600, 620);
    game = new GameManager();
    textFont('Arial');
    textSize(20);
  }
  
  // 草坪背景
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
    
  }
  
  // 球门宽度
  function drawGoal() {
    fill(255);
    rect(width / 4, 50, width / 2 + 40, 10); 
  }
  
  // 在暂停状态下点击屏幕恢复游戏
  function mousePressed() {
    if (game.gameState === "paused") {
      game.resumeGame();
    }
  }
  
  //键盘控制，R键重设游戏并使用方向键控制球员
  function keyPressed() {
    let keyLower = key.toLowerCase(); // 忽略大小写
    if (game.gameState === "gameOver" && keyLower === "r") {
      game.restartGame(); // 按 R 键重新开始游戏
    }
    if (keyCode === LEFT_ARROW) {
      game.playerX = max(game.playerX - 20, 25);
    } else if (keyCode === RIGHT_ARROW) {
      game.playerX = min(game.playerX + 20, width - 25);
    }
  }
  

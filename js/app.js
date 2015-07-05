// ADDED
// Global Variables
var menu;
var gameState; // 1 if playing 0 if game over
var hud; //player hud
var player; //player variable
var allEnemies; // variable for enemey array
var enemyResetX; // x position to reset enemy to after they are out of bounds
var playerReset; // player spawn position
var level;

/*
 ADDED:
 This Menu function handles the games intermediary screens such as the main menu, win, and lose screens.
 In the main menu it adds the ability to choose a playable character.
 */
var Menu = function(){
    this.x = 0;
    this.y = 100;
    this.selected = 0;
    this.sprite = 'images/Selector.png';
    this.bg = 'images/stone-block.png';

    this.characters = ['images/char-boy.png', 'images/char-cat-girl.png', 'images/char-horn-girl.png',
        'images/char-pink-girl.png', 'images/char-princess-girl.png'];
    this.width = Resources.get(this.sprite).width;
    this.height = Resources.get(this.sprite).height;
};

Menu.prototype.render = function(){
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 48px sans-serif";

    if(gameState === 'menu') {
        for (character in this.characters) {
            ctx.drawImage(Resources.get(this.bg), this.width * character, this.y + 40);

        }
        ctx.drawImage(Resources.get(this.sprite), this.width * this.selected, this.y);
        for (character in this.characters) {
            ctx.drawImage(Resources.get(this.characters[character]), this.width * character,
                (this.selected == character ? this.y - 20 : this.y));
        }

        ctx.fillText('STAR GAME', ctx.canvas.width / 2, ctx.canvas.height / 5);
        ctx.font = "24px sans-serif";
        ctx.fillText('Press Left and Right Arrow to Choose.', ctx.canvas.width / 2, ctx.canvas.height / 6 * 5);
    }

    if(gameState === 'lose'){
        ctx.fillText('GAME OVER', ctx.canvas.width/2, ctx.canvas.height/5);
    }
    else if(gameState === 'win'){
        ctx.fillText('LEVEL ' + level +  ' COMPLETE', ctx.canvas.width/2, ctx.canvas.height/5);
    }
    ctx.font = "24px sans-serif";
    ctx.fillText('Press Up Arrow to Continue.', ctx.canvas.width/2, ctx.canvas.height/6*5 + 30);
};

Menu.prototype.handleInput = function(key){
    switch(key){
        case 'left':
            if(menu.selected - 1 >= 0){
                menu.selected--;
            }
            break;
        case 'right':
            if(menu.selected + 1 < menu.characters.length){
                menu.selected++;
                console.log(menu.selected);

            }
            break;
        case 'up':
            console.log("up");
            if(gameState === 'menu') {
                gameState = 'waiting';
            }
            else if(gameState === 'lose'){
                gameState = 'restart';
            }
            else if(gameState === 'win'){
                gameState = 'continue';
            }
            break;
    }
};


/*
 ADDED:
 This is the game objective that the player has to reach to beat the level
 */
var Star = function(x, y){
    this.x = x;
    this.y = y;
    this.sprite = 'images/Star.png';

    this.width = Resources.get(this.sprite).width;
    this.height = Resources.get(this.sprite).height;
    this.bounds = getBounds(this);


};

Star.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

};


/*
 ADDED:
 This function adds a hud that displays remaining lives and current level the player is on
 */
var Hud = function(lives){
    this.x = 5;
    this.y = -10;
    this.MAX_LIVES = lives;
    this.lives = lives;
    this.sprite = 'images/Heart.png';
    this.width = Resources.get(this.sprite).width * .4;
    this.height = Resources.get(this.sprite).height * .4;
};

Hud.prototype.render = function(){
    for(i = 0; i < this.lives; i++){
        ctx.drawImage(Resources.get(this.sprite), this.x + i*this.width, this.y, this.width, this.height);
    }
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = 'black';
    ctx.fillText('LEVEL ' + level, ctx.canvas.width -75, 35);
};

/*
 MODIFIED:
 This function creates an enemy that the player must avoid. Keeps track of positions, speed, size.
 */
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.y = y;
    this.x = x;
    this.speed = speed;
    this.reset = false; // flag to reset unit to original position if unit becomes out of bounds
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    this.width = Resources.get(this.sprite).width;
    this.height = Resources.get(this.sprite).height;
    this.bounds = getBounds(this);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed*dt;
    this.bounds = getBounds(this);
    // set reset flag for when unit is no longer on screen
    if(!this.reset && isColliding(this.bounds[0], this.bounds[1], 0, ctx.canvas.clientWidth)){
        this.reset = true;
    }
    // reset when unit is off screen
    else if(this.reset && !isColliding(this.bounds[0], this.bounds[1], 0, ctx.canvas.clientWidth)){
        this.x = enemyResetX - getRandomInt(0, ctx.canvas.clientWidth);
        this.reset = false;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
 ADDED:
 This is the player class that creates a playable character for the user, creates character based on one chosen at menu.
 */
var Player = function(x, y){
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x;
    this.y = y;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = menu.characters[menu.selected];
    this.width = Resources.get(this.sprite).width;
    this.height = Resources.get(this.sprite).height;
    this.bounds = getBounds(this);
};

Player.prototype.update = function(dt){
    this.bounds = getBounds(player);
};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

};

Player.prototype.handleInput = function(key){
    //switch input
    if(gameState === 'playing'){
        switch(key){
            case 'left':
                if(player.x - 101 >= 0){
                    this.x -= 101;
                }
                break;
            case 'right':
                if(player.x + 101 < ctx.canvas.clientWidth){
                    this.x += 101;
                }
                break;
            case 'up':
                if(player.y -83 >= -40){
                    this.y -= 83;
                }
                break;
            case 'down':
                if(player.y + player.height + 83 < ctx.canvas.clientHeight){
                    this.y += 83;
                }
                break;
        }
    }

};

/*
 ADDED:
 This function creates the games menu object
 */
var initGraphics = function(){
    gameState = 'menu';
    menu = new Menu();
};

/*
 ADDED:
 This function initializes the level with required components
 */
var game = function(enemiesPerRow, speedSeed, lives, level){
    gameState = 'playing';
    this.level = level;
    hud = new Hud(lives);
    tileSize = [ctx.canvas.clientWidth/101, enemiesPerRow.length];
    star = new Star(101 * getRandomInt(1, tileSize[0]), -10);
    enemyResetX = -101;
    playerReset = [101 * Math.floor(tileSize[0]/2),83*(enemiesPerRow.length - 1) - 40]; // calculate bottom center
    player = new Player(playerReset[0], playerReset[1]); // each y level offset by 83 with initial -40
    allEnemies = []; // initialize allEnemy array
    for(row in enemiesPerRow){ // iterate through object passed in
        var ypos = -20 + 83 * row;
        var speed = (speedSeed - speedSeed * row / enemiesPerRow.length) + (level - 1) * 50; //speed is clamped based on how high the row is
        for(i = 0; i < enemiesPerRow[row]; i++){ // create enemies based on value in array
            var startpos = 101 * (i + 1) - 404 + getRandomInt(0,ctx.canvas.clientWidth); // initial spawn point
            allEnemies.push(new Enemy(startpos, ypos, speed));
        }
    }
    //allEnemies.push(new Enemy(-101,-20,100)); // -20 offset for enemies y
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    if(gameState === 'playing'){
        player.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        menu.handleInput(allowedKeys[e.keyCode]);
    }
});

/*
 ADDED:
 Function to check collision bounds for screen and unit collision, checks whether
 a unit violates an upper or lower bound. Useful for detecting if a unit goes off screen.
 Is only able to detect collision on one axis. To check collision between two units, there
 must be a separate function call to check x axis and y axis violations.
 */
var isColliding = function(unitLower, unitUpper, boundLower, boundUpper){
    return ((unitLower >= boundLower) && (unitLower <= boundUpper)) ||
        ((unitUpper >= boundLower) && (unitUpper <= boundUpper));
};

/*
 ADDED:
 This function checks unit collision. It first detects if a player is colliding with the objective which leads to win.
 It then checks to see if the player is colliding with any enemy
 */
var checkCollisions = function(){
    if(isColliding(player.bounds[0], player.bounds[1], star.bounds[0], star.bounds[1])
        && isColliding(player.bounds[2], player.bounds[3], star.bounds[2], star.bounds[3])){
        gameState = 'win';
    }
    for(enemy in allEnemies){
        if(isColliding(player.bounds[0], player.bounds[1], allEnemies[enemy].bounds[0], allEnemies[enemy].bounds[1])
            && isColliding(player.bounds[2], player.bounds[3], allEnemies[enemy].bounds[2], allEnemies[enemy].bounds[3])){
            player.x = playerReset[0];
            player.y = playerReset[1];
            hud.lives--;
            if(hud.lives === 0){
                gameState = 'lose';
            }
        }
    }
}

/*
 ADDED:
 This function is used to calculate the bounds of a unit. This acts as a sort of trigger box for which to check
 collisions on. Returns an array of calculated lower and upper bounds for both x and y axis.
 */
var getBounds = function(unit){
    return [unit.x + 15, unit.x + unit.width - 15, unit.y + 100, unit.y + unit.height - 25]; //shrink bounds
};
/*
 ADDED:
 Function to generate a random in range of min to max - 1
 */
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
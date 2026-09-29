const canvas =
    document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");


/* =========================
   CANVAS
========================= */

const WIDTH = 600;
const HEIGHT = 700;

canvas.width = WIDTH;
canvas.height = HEIGHT;


/* =========================
   GAME STATE
========================= */

let gameRunning = false;
let paused = false;

let score = 0;
let lives = 3;

let speed = 5;

let roadOffset = 0;

let enemyTimer = 0;
let coinTimer = 0;

let animationId;


/* =========================
   PLAYER
========================= */

const player = {

    x: WIDTH / 2 - 25,

    y: HEIGHT - 130,

    width: 50,

    height: 85,

    speed: 7,

    color: "#ff304f"

};


/* =========================
   OBJECTS
========================= */

let enemies = [];
let coins = [];


/* =========================
   CONTROLS
========================= */

const keys = {

    left: false,
    right: false

};


document.addEventListener("keydown", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        keys.left = true;
    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        keys.right = true;
    }

    if (event.key === " " && gameRunning) {

        togglePause();

    }

});


document.addEventListener("keyup", event => {

    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        keys.left = false;
    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        keys.right = false;
    }

});


/* MOBILE */

function holdButton(button, direction) {

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            keys[direction] = true;

        }
    );

    button.addEventListener(
        "pointerup",
        () => {

            keys[direction] = false;

        }
    );

    button.addEventListener(
        "pointerleave",
        () => {

            keys[direction] = false;

        }
    );

}


holdButton(
    document.getElementById("leftBtn"),
    "left"
);

holdButton(
    document.getElementById("rightBtn"),
    "right"
);


/* =========================
   ROAD
========================= */

function drawRoad() {

    /* GRASS */

    ctx.fillStyle = "#1d6b3c";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /* ROAD */

    ctx.fillStyle = "#30343a";

    ctx.fillRect(
        100,
        0,
        400,
        HEIGHT
    );


    /* ROAD EDGES */

    ctx.fillStyle = "#eeeeee";

    ctx.fillRect(
        95,
        0,
        5,
        HEIGHT
    );

    ctx.fillRect(
        500,
        0,
        5,
        HEIGHT
    );


    /* LANE LINES */

    ctx.fillStyle = "#f4f4f4";

    const laneWidth = 133;

    for (
        let lane = 1;
        lane < 3;
        lane++
    ) {

        const x =
            100 + lane * laneWidth;

        for (
            let y = -80 + roadOffset;
            y < HEIGHT;
            y += 120
        ) {

            ctx.fillRect(
                x - 3,
                y,
                6,
                65
            );

        }

    }


    roadOffset += speed;

    if (roadOffset >= 120) {
        roadOffset = 0;
    }

}


/* =========================
   CAR DRAWING
========================= */

function drawCar(
    x,
    y,
    width,
    height,
    color
) {

    /* SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.fillRect(
        x + 5,
        y + 7,
        width,
        height
    );


    /* BODY */

    ctx.fillStyle = color;

    roundRect(
        x,
        y,
        width,
        height,
        10
    );


    /* WINDOWS */

    ctx.fillStyle = "#15233c";

    roundRect(
        x + 9,
        y + 12,
        width - 18,
        25,
        6
    );

    roundRect(
        x + 9,
        y + 47,
        width - 18,
        20,
        5
    );


    /* HEADLIGHTS */

    ctx.fillStyle = "#fff3a3";

    ctx.fillRect(
        x + 5,
        y + 5,
        10,
        6
    );

    ctx.fillRect(
        x + width - 15,
        y + 5,
        10,
        6
    );


    /* TAILLIGHTS */

    ctx.fillStyle = "#ff1f3d";

    ctx.fillRect(
        x + 5,
        y + height - 10,
        10,
        6
    );

    ctx.fillRect(
        x + width - 15,
        y + height - 10,
        10,
        6
    );


    /* WHEELS */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        x - 5,
        y + 15,
        7,
        20
    );

    ctx.fillRect(
        x + width - 2,
        y + 15,
        7,
        20
    );

    ctx.fillRect(
        x - 5,
        y + height - 35,
        7,
        20
    );

    ctx.fillRect(
        x + width - 2,
        y + height - 35,
        7,
        20
    );

}


function roundRect(
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

    ctx.fill();

}


/* =========================
   ENEMIES
========================= */

function createEnemy() {

    const lanes = [
        125,
        258,
        391
    ];

    const lane =
        lanes[
            Math.floor(
                Math.random() *
                lanes.length
            )
        ];

    const colors = [
        "#247cff",
        "#ffc928",
        "#9b59ff",
        "#16d9a0",
        "#ff7b24"
    ];

    enemies.push({

        x: lane,

        y: -100,

        width: 50,

        height: 85,

        speed:
            speed * (.7 + Math.random() * .5),

        color:
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ]

    });

}


/* =========================
   COINS
========================= */

function createCoin() {

    const lanes = [
        150,
        283,
        416
    ];

    const lane =
        lanes[
            Math.floor(
                Math.random() *
                lanes.length
            )
        ];

    coins.push({

        x: lane,

        y: -30,

        radius: 13,

        speed: speed

    });

}


function drawCoin(coin) {

    ctx.beginPath();

    ctx.arc(
        coin.x,
        coin.y,
        coin.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffd43b";

    ctx.fill();

    ctx.strokeStyle = "#ff9f00";

    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.fillStyle = "#8a5b00";

    ctx.font = "bold 13px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        "$",
        coin.x,
        coin.y
    );

}


/* =========================
   COLLISION
========================= */

function collision(a, b) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y

    );

}


function coinCollision(car, coin) {

    const closestX =
        Math.max(
            car.x,
            Math.min(
                coin.x,
                car.x + car.width
            )
        );

    const closestY =
        Math.max(
            car.y,
            Math.min(
                coin.y,
                car.y + car.height
            )
        );

    const distanceX =
        coin.x - closestX;

    const distanceY =
        coin.y - closestY;

    return (
        distanceX * distanceX +
        distanceY * distanceY
    ) < coin.radius * coin.radius;

}


/* =========================
   PLAYER
========================= */

function updatePlayer() {

    if (keys.left) {

        player.x -= player.speed;

    }

    if (keys.right) {

        player.x += player.speed;

    }


    const leftLimit = 105;

    const rightLimit =
        500 - player.width;


    if (player.x < leftLimit) {

        player.x = leftLimit;

    }

    if (player.x > rightLimit) {

        player.x = rightLimit;

    }

}


/* =========================
   UPDATE ENEMIES
========================= */

function updateEnemies() {

    enemyTimer--;

    if (enemyTimer <= 0) {

        createEnemy();

        enemyTimer =
            Math.max(
                35,
                85 - speed * 6
            );

    }


    enemies.forEach(enemy => {

        enemy.y += enemy.speed;

    });


    enemies =
        enemies.filter(
            enemy =>
                enemy.y < HEIGHT + 100
        );


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy = enemies[i];

        if (
            collision(
                player,
                enemy
            )
        ) {

            enemies.splice(i, 1);

            loseLife();

        }

    }

}


/* =========================
   UPDATE COINS
========================= */

function updateCoins() {

    coinTimer--;

    if (coinTimer <= 0) {

        createCoin();

        coinTimer = 100;

    }


    coins.forEach(coin => {

        coin.y += coin.speed;

    });


    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin = coins[i];

        if (
            coinCollision(
                player,
                coin
            )
        ) {

            coins.splice(i, 1);

            score += 50;

            updateHUD();

        }

    }


    coins =
        coins.filter(
            coin =>
                coin.y < HEIGHT + 50
        );

}


/* =========================
   LIVES
========================= */

function loseLife() {

    lives--;

    updateHUD();

    player.x =
        WIDTH / 2 - 25;


    if (lives <= 0) {

        endGame();

    }

}


/* =========================
   SCORE
========================= */

function updateScore() {

    score++;

    /* Increase difficulty */

    if (
        score > 0 &&
        score % 500 === 0
    ) {

        speed += .7;

    }

}


/* =========================
   HUD
========================= */

function updateHUD() {

    document.getElementById(
        "score"
    ).textContent = score;

    document.getElementById(
        "lives"
    ).textContent = lives;

    document.getElementById(
        "speed"
    ).textContent =
        Math.floor(speed);

    const high =
        Number(
            localStorage.getItem(
                "highwayHighScore"
            )
        ) || 0;

    document.getElementById(
        "highScore"
    ).textContent = high;

}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (paused) {

        animationId =
            requestAnimationFrame(
                gameLoop
            );

        return;

    }


    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    drawRoad();


    updatePlayer();

    updateEnemies();

    updateCoins();

    updateScore();


    /* DRAW COINS */

    coins.forEach(
        drawCoin
    );


    /* DRAW ENEMIES */

    enemies.forEach(enemy => {

        drawCar(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            enemy.color
        );

    });


    /* PLAYER */

    drawCar(
        player.x,
        player.y,
        player.width,
        player.height,
        player.color
    );


    updateHUD();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================
   START GAME
========================= */

function startGame() {

    score = 0;

    lives = 3;

    speed = 5;

    enemies = [];

    coins = [];

    enemyTimer = 50;

    coinTimer = 80;

    player.x =
        WIDTH / 2 - 25;

    gameRunning = true;

    paused = false;


    document.getElementById(
        "startScreen"
    ).classList.add("hidden");

    document.getElementById(
        "gameOver"
    ).classList.add("hidden");

    document.getElementById(
        "pauseScreen"
    ).classList.add("hidden");


    updateHUD();

    cancelAnimationFrame(
        animationId
    );

    gameLoop();

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameRunning = false;

    cancelAnimationFrame(
        animationId
    );


    const oldHigh =
        Number(
            localStorage.getItem(
                "highwayHighScore"
            )
        ) || 0;


    const isNewRecord =
        score > oldHigh;


    if (isNewRecord) {

        localStorage.setItem(
            "highwayHighScore",
            score
        );

    }


    document.getElementById(
        "finalScore"
    ).textContent = score;


    document.getElementById(
        "newRecord"
    ).style.visibility =
        isNewRecord
            ? "visible"
            : "hidden";


    document.getElementById(
        "gameOver"
    ).classList.remove("hidden");


    updateHUD();

}


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    paused = !paused;


    document.getElementById(
        "pauseScreen"
    ).classList.toggle(
        "hidden",
        !paused
    );


    document.getElementById(
        "pauseBtn"
    ).textContent =
        paused
            ? "▶ Resume"
            : "⏸ Pause";

}


function resumeGame() {

    paused = false;

    document.getElementById(
        "pauseScreen"
    ).classList.add("hidden");

    document.getElementById(
        "pauseBtn"
    ).textContent =
        "⏸ Pause";

}


/* =========================
   BUTTONS
========================= */

document.getElementById(
    "startBtn"
).addEventListener(
    "click",
    startGame
);


document.getElementById(
    "restartBtn"
).addEventListener(
    "click",
    startGame
);


document.getElementById(
    "pauseBtn"
).addEventListener(
    "click",
    togglePause
);


document.getElementById(
    "resumeBtn"
).addEventListener(
    "click",
    resumeGame
);


/* =========================
   INITIAL HUD
========================= */

updateHUD();
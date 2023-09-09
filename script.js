const tickLength = 128;
const appleMargin = 5;
const columns = 35;
const scoreMargin = 30;

let rows;
let score = 1;
let direction = 4;
let tempDirection = 4;
let nextDirection = 4;
let applePos = [0, 0];
let snakeCoordinates = [];
let pxPerSquare;
let tailIndex = 1;
let canvas;
let ctx;
let textDimensions = [0, 0];
let overlapping = false;

document.addEventListener("DOMContentLoaded", () => {
    initializeCanvas();
    initializeGame();
    detectKeyPress();
    setInterval(tick, tickLength);
});

function initializeCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pxPerSquare = canvas.width / columns;
    rows = Math.floor(canvas.height / pxPerSquare);
}

function initializeGame() {
    const startPos = [Math.round(columns / 3 - 1), Math.round(rows / 2 - 1)];
    snakeCoordinates.push(startPos);
    applePos = getNewApplePos();
}

function detectKeyPress() {
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (key === "w" || key === "arrowup") {
            updateDirection(1);
        } else if (key === "a" || key === "arrowleft") {
            updateDirection(2);
        } else if (key === "s" || key === "arrowdown") {
            updateDirection(3);
        } else if (key === "d" || key === "arrowright") {
            updateDirection(4);
        }
    });
}

function updateDirection(newDirection) {
    if (newDirection !== oppositeDirection(direction)) {
        tempDirection = newDirection;
    }
}

function oppositeDirection(dir) {
    const opposites = { 1: 3, 2: 4, 3: 1, 4: 2 };
    return opposites[dir] || dir;
}

function tick() {
    update();
}

function update() {
    direction = tempDirection;
    checkForApple();
    updatePos();
    checkForEnd();
    isOverlapping();
    requestAnimationFrame(drawFrame);
}

function isOverlapping() {
    overlapping = false;
    const cells = getOccupiedCells(scoreMargin, scoreMargin, textDimensions[0], textDimensions[1], pxPerSquare);

    for (const cell of cells) {
        if (snakeCoordinates.some((coord) => isEqual(coord, cell)) || isEqual(applePos, cell)) {
            overlapping = true;
            break;
        }
    }
}

function isEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

function getOccupiedCells(x, y, width, height, size) {
    const occupiedCells = [];
    const startX = Math.floor(x / size);
    const startY = Math.floor(y / size);
    const endX = Math.floor((x + width) / size);
    const endY = Math.floor((y + height) / size);

    for (let row = startY; row <= endY; row++) {
        for (let col = startX; col <= endX; col++) {
            occupiedCells.push([col, row]);
        }
    }

    return occupiedCells;
}

function checkForEnd() {

    if (hasDuplicates(snakeCoordinates)) {
        reset()
    }
    else if (snakeCoordinates.length == columns * rows) {
        alert("You actually won, congrats!")
        reset()
    }
}

function hasDuplicates(coordinates) {
    const seenArrays = {};

    for (const subarray of coordinates) {
        const subarrayString = subarray.toString();

        if (seenArrays[subarrayString]) {
            return true;
        }

        seenArrays[subarrayString] = true;
    }

    return false;
}

function reset() {
    score = 1;
    tailIndex = 1;
    tempDirection = 4;
    snakeCoordinates = [];
    initializeGame();
}

function updatePos() {
    moveTail();
    const head = snakeCoordinates[0];

    if (direction === 1) {
        snakeCoordinates[0] = [head[0], (head[1] - 1 + rows) % rows];
    }
    else if (direction === 2) {
        snakeCoordinates[0] = [(head[0] - 1 + columns) % columns, head[1]];
    }
    else if (direction === 3) {
        snakeCoordinates[0] = [head[0], (head[1] + 1) % rows];
    }
    else if (direction === 4) {
        snakeCoordinates[0] = [(head[0] + 1) % columns, head[1]];
    }

    function moveTail() {
        if (snakeCoordinates.length > 1) {
            tailIndex = (tailIndex < snakeCoordinates.length - 1) ? tailIndex + 1 : 1;
            snakeCoordinates[tailIndex] = [...snakeCoordinates[0]];
        }
    }
}

function checkForApple() {
    if (isEqual(snakeCoordinates[0], applePos)) {
        snakeCoordinates.splice(tailIndex + 1, 0, applePos);
        applePos = getNewApplePos();
        score++;
    }
}

function drawFrame() {
    clearCanvas();
    drawScore();
    drawSquare("red", applePos, appleMargin);

    for (let i = 0; i < snakeCoordinates.length; i++) {
        const color = (i === 0) ? "#00FF00" : "#008000";
        drawSquare(color, snakeCoordinates[i], 0);
    }

    drawStrokeRect();
}

function drawScore() {
    const text = `Score :   ${score}`;
    ctx.font = "64px 'copperplate', Fantasy";
    let opacity = overlapping ? "0.2" : "1";
    ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
    const textMetrics = ctx.measureText(text);
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    ctx.fillText(text, scoreMargin, scoreMargin + textHeight);
    textDimensions = [textMetrics.width, textHeight];
}

function drawStrokeRect() {
    const line = 4;
    ctx.lineWidth = line;
    ctx.strokeStyle = "mediumslateblue";
    ctx.strokeRect(line / 2, line / 2, pxPerSquare * columns - line, rows * pxPerSquare - line + 1);
}

function drawSquare(color, pos, margin) {
    const x = pxPerSquare * pos[0] + margin;
    const y = pxPerSquare * pos[1] + margin;
    const width = pxPerSquare - margin * 2 + 1;
    const height = pxPerSquare - margin * 2 + 1;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getNewApplePos() {
    while (true) {
        const x = Math.floor(Math.random() * columns);
        const y = Math.floor(Math.random() * rows);
        const coord = [x, y];

        if (!isEqual(coord, applePos) && !snakeCoordinates.some((snakeCoord) => isEqual(coord, snakeCoord))) {
            return coord;
        }
    }
}

const tickLength = 128;
const columns = 35;
const scoreTextMargin = 30;

let rows;
let score = 1;
let direction = 4;
let tempDirection = 4;
let applePos = [0, 0];
let snakeCoordinates = [];
let cellSize;
let tailIndex = 1;
let canvas;
let ctx;
let textDimensions = [0, 0];
let overlapping = false;
let appleSound = new Audio("apple.mp3")
let deathSound = new Audio("death.mp3")


document.addEventListener("DOMContentLoaded", () => {
    initializeCanvas();
    initializeGame();
    detectKeyPress();
    setInterval(update, tickLength);

});

function initializeCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    cellSize = roundToTwoDecimalPlaces(canvas.width / columns);
    rows = Math.floor(canvas.height / cellSize);
}

function roundToTwoDecimalPlaces(number) {
    return Math.round(number * 100) / 100;
}

function initializeGame() {
    const startPos = [Math.round(columns / 3 - 1), Math.round(rows / 2 - 1)];
    snakeCoordinates.push(startPos);
    applePos = getNewApplePos();
    detectMouseAndTouch();

    function detectMouseAndTouch() {
        let startX, startY;

        //For checking desktop (click) swiping gestures
        canvas.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
        });
        canvas.addEventListener('mouseup', (e) => {
            const endX = e.clientX;
            const endY = e.clientY;
            detectSwipeDirection(startX, startY, endX, endY);
        });

        //For checking mobile (touch) swiping gestures
        canvas.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        canvas.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            detectSwipeDirection(startX, startY, endX, endY);
        });

        function detectSwipeDirection(startX, startY, endX, endY) {
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    updateDirection(4);
                }
                else
                {
                    updateDirection(2);
                }
            }
            else {
                if (deltaY > 0) {
                    updateDirection(3);
                }
                else {
                    updateDirection(1);
                }
            }
        }
    }

    
}

function detectKeyPress() {
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (key === "w" || key === "arrowup") {
            updateDirection(1, true);
        } else if (key === "a" || key === "arrowleft") {
            updateDirection(2, true);
        } else if (key === "s" || key === "arrowdown") {
            updateDirection(3, true);
        } else if (key === "d" || key === "arrowright") {
            updateDirection(4, true);
        }
    });
}

function updateDirection(newDirection) {
    if (newDirection !== oppositeDirection(direction)) {
        tempDirection = newDirection;
    }
    return newDirection != direction
}

function oppositeDirection(dir) {
    const opposites = { 1: 3, 2: 4, 3: 1, 4: 2 };
    return opposites[dir] || dir;
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
    const cells = getOccupiedCells(scoreTextMargin, scoreTextMargin, textDimensions[0], textDimensions[1], cellSize);

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
        deathSound.play()
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
        appleSound.play();
        snakeCoordinates.splice(tailIndex + 1, 0, applePos);
        applePos = getNewApplePos();
        score++;
    }
}

function drawFrame() {
    clearCanvas();
    drawScore();
    drawSquare("red", applePos);

    for (let i = 0; i < snakeCoordinates.length; i++) {
        const color = (i === 0) ? "#00FF00" : "#008000";
        drawSquare(color, snakeCoordinates[i]);
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
    ctx.fillText(text, scoreTextMargin, scoreTextMargin + textHeight);
    textDimensions = [roundToTwoDecimalPlaces(textMetrics.width), textHeight];
}

function drawStrokeRect() {
    const line = 4;
    ctx.lineWidth = line;
    ctx.strokeStyle = "mediumslateblue";
    ctx.strokeRect(line / 2, line / 2, cellSize * columns - line, rows * cellSize - line + 1);
}

function drawSquare(color, pos) {
    const x = cellSize * pos[0];
    const y = cellSize * pos[1];
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellSize + 1, cellSize + 1);
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

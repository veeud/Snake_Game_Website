const tickLength = 150
const appleMargin = 0
const columns = 35
let rows
let score = 1
let direction = 4
let tempDirection = 4
let applePos = [0, 0]
let snakeCoordinates = []
let pxPerSquare
let tailIndex = 1

let canvas
let ctx

document.addEventListener("DOMContentLoaded", function () {
    canvas = document.querySelector('canvas')
    ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    pxPerSquare = canvas.width / columns
    rows = Math.floor(canvas.height / pxPerSquare)


    initializeGame();

    detectKeyPress()
    update()
    setInterval(tick, tickLength)
});

function initializeGame() {

    let startPos = [Math.round(columns / 3 - 1), Math.round(rows / 2 - 1)];
    snakeCoordinates.push(startPos);
    applePos = getNewApplePos();
}

function detectKeyPress() {
    document.addEventListener("keydown", function (event) {

        if ((event.key.toLowerCase() === "w" || event.key === "ArrowUp") && direction != 3) {
            tempDirection = 1
        }
        else if ((event.key.toLowerCase() === "a" || event.key === "ArrowLeft") && direction != 4) {
            tempDirection = 2
        }
        else if ((event.key.toLowerCase() === "s" || event.key === "ArrowDown") && direction != 1) {
            tempDirection = 3
        }
        else if ((event.key.toLowerCase() === "d" || event.key === "ArrowRight") && direction != 2) {
            tempDirection = 4
        }
    })
}

function tick() {
    update();
}

function update() {

    direction = tempDirection;
    checkForApple()
    updatePos();
    checkForEnd()
    requestAnimationFrame(drawFrame())
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
    tailIndex = 1
    tempDirection = 4
    snakeCoordinates = []
    initializeGame()
}

function updatePos() {

    moveTail();

    let head = snakeCoordinates[0]

    if (direction == 1) {

        snakeCoordinates[0] = [head[0], (head[1] - 1 + rows) % rows];
    }
    else if (direction == 2) {

        snakeCoordinates[0] = [(head[0] - 1 + columns) % columns, head[1]];
    }
    else if (direction == 3) {

        snakeCoordinates[0] = [head[0], (head[1] + 1) % rows];
    }
    else if (direction == 4) {

        snakeCoordinates[0] = [(head[0] + 1) % columns, head[1]];
    }

    function moveTail() {

        if (snakeCoordinates.length > 1) {

            if (tailIndex < snakeCoordinates.length - 1)
                tailIndex++;

            else
                tailIndex = 1;

            snakeCoordinates[tailIndex] = snakeCoordinates[0];
        }
    }
}

function checkForApple() {

    if (snakeCoordinates[0].toString() === applePos.toString()) {

        snakeCoordinates.splice(tailIndex + 1, 0, applePos)
        applePos = getNewApplePos()
        score++;
    }
}

function drawFrame() {

    clearCanvas();
    drawSquare("red", applePos, appleMargin)

    for (var i = 0; i < snakeCoordinates.length; i++) {
        if (i == 0) {
            drawSquare("#00FF00", snakeCoordinates[0], 0)
        }
        else {
            drawSquare("#008000", snakeCoordinates[i], 0);
        }
    }

    drawStrokeRect()
    drawScore();
}

function drawScore() {
    ctx.font = "64px 'copperplate', Fantasy";
    ctx.fillStyle = "white";
    ctx.fillText("Score :   " + score, 30, 80);
}

function drawStrokeRect() {
    let line = 4
    ctx.lineWidth = line
    ctx.strokeStyle = "mediumslateblue"
    ctx.strokeRect(line / 2, line / 2, pxPerSquare * columns - line, rows * pxPerSquare - line + 1);
}

function drawSquare(color, pos, appleMargin) {
    var x = pxPerSquare * pos[0] + appleMargin;
    var y = pxPerSquare * pos[1] + appleMargin;
    var width = pxPerSquare - appleMargin * 2 + 1;
    var height = pxPerSquare - appleMargin * 2 + 1;

    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getNewApplePos() {

    while (true) {

        let x = Math.floor(Math.random() * columns);
        let y = Math.floor(Math.random() * rows);
        let coord = [x, y];
        if (coord != applePos && !arrayContainsArray(snakeCoordinates, coord)) {
            return coord
        }
    }

    function arrayContainsArray(arrOfArrays, targetArray) {
        return arrOfArrays.some(arr => {
            // Check if the current inner array has the same values as the target array
            return arr.length === targetArray.length && arr.every((value, index) => value === targetArray[index]);
        });
    }
}

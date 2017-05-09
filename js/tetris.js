/**
 * Created by zdy on 2017/5/5.
 */
"use strict!"
var canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"),
    resultCanvas = document.getElementById("result"), resCtx = resultCanvas.getContext("2d"),
    nextCanvas = document.getElementById("next"), nextCtx = nextCanvas.getContext("2d"),
    info = document.getElementById("info");
var matrix = [], interval, action, downTime, score;
var blockSize = 40, bgColor = "#D9D9D9", ps = {}, pe = {}, validDistance = 50;
var lastShape = {shape: null, pos: null};
var nowShape = {shape: null, pos: null};
var nextShape = {shape: [[], [], [], []]};
var speed = 1000;
var shapes =
    [
        [[0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]],
        [[0, 0, 0, 0],
            [0, 2, 2, 0],
            [0, 2, 2, 0],
            [0, 0, 0, 0]],
        [[0, 3, 0, 0],
            [3, 3, 3, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]],
        [[0, 0, 0, 0],
            [4, 4, 0, 0],
            [0, 4, 4, 0],
            [0, 0, 0, 0]],
        [[0, 0, 0, 0],
            [0, 5, 5, 0],
            [5, 5, 0, 0],
            [0, 0, 0, 0]],
        [[0, 0, 0, 0],
            [0, 6, 0, 0],
            [0, 6, 0, 0],
            [0, 6, 6, 0]],
        [[0, 0, 0, 0],
            [0, 0, 7, 0],
            [0, 0, 7, 0],
            [0, 7, 7, 0]]
    ];
var shapesColor = [
    "#eeeeee",
    "#00CCFF",
    "#BFB230",
    "#FFCC00",
    "#9966FF",
    "#FF33FF",
    "#FF3300",
    "#00CC00"
];
window.onresize = function () {
    var max = 500, v;
    var w = window.innerWidth - 20;
    var h = window.innerHeight - 20;
    if (w <= h) {
        v = (w >= max) ? max : w;
        canvas.style.width = v + "px";
        resultCanvas.style.width = v + "px";
        nextCanvas.style.width = (v * 0.3) + "px";
        nextCanvas.style.height = (v * 0.3) + "px";
        info.style.width = (v * 0.7) + "px";
        info.style.height = (v * 0.3) + "px";
    } else {
        v = (h >= max) ? max : h;
        canvas.style.width = v + "px";
        resultCanvas.style.width = v + "px";
        nextCanvas.style.width = (v * 0.3) + "px";
        nextCanvas.style.height = (v * 0.3) + "px";
        info.style.width = (v * 0.7) + "px";
        info.style.height = (v * 0.3) + "px";
    }
};
window.onresize();
function clrLastShape() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (nowShape.shape[i][j]) {
                if (matrix[nowShape.pos.row + i]) {
                    matrix[nowShape.pos.row + i][nowShape.pos.line + j] = 0;
                }
            }
        }
    }
}
function isReach() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (nowShape.shape[i][j]) {
                //到下边界
                if (!matrix[nowShape.pos.row + i]) {
                    if (nowShape.pos.row + i >= 0) {
                        dealWithNew();
                        return true;
                    }
                    //没显示完全时不能出边界
                    if (nowShape.pos.line + j < 0 || nowShape.pos.line + j > 9) {
                        return true;
                    }
                }
                //到左右边界
                else if (matrix[nowShape.pos.row + i][nowShape.pos.line + j] == undefined) {
                    return true;
                }
                //该位置有东西
                else if (matrix[nowShape.pos.row + i][nowShape.pos.line + j]) {
                    action == "b" && dealWithNew();
                    return true;
                }
            }
        }
    }
}
function putShape(shape) {
    //绘制此次的
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (shape.shape[i][j]) {
                if (matrix[shape.pos.row + i]) {
                    matrix[shape.pos.row + i][shape.pos.line + j] = shape.shape[i][j];
                }
            }
        }
    }
}
function drawCtx() {
    for (var i = 0, len = matrix.length; i < len; i++) {
        for (var j = 0, rowLen = matrix[i].length; j < rowLen; j++) {
            ctx.fillStyle = shapesColor[matrix[i][j]];
            ctx.fillRect(blockSize * j + 1, blockSize * i + 1, blockSize - 2, blockSize - 2)
        }
    }
}

function pause() {
    clearInterval(interval);
    document.getElementById("pause").style.display = "none";
    document.getElementById("resume").style.display = "inline";
    document.onkeydown=function () {};
    canvas.removeEventListener("touchstart", touchstart, false);
    canvas.removeEventListener("touchmove", touchmove, false);
    canvas.removeEventListener("touchend", touchend, false);
}
function resume() {
    interval = setInterval(operate, speed);
    document.getElementById("pause").style.display = "inline";
    document.getElementById("resume").style.display = "none";
    document.onkeydown=keydown;
    canvas.addEventListener("touchstart", touchstart, false);
    canvas.addEventListener("touchmove", touchmove, false);
    canvas.addEventListener("touchend", touchend, false);
}
function start() {
    score = 0;
    downTime = -1;
    document.getElementById("mask").style.display = "none";
    for (var i = 0, len = ctx.canvas.height / blockSize; i < len; i++) {
        matrix[i] = [];
        for (var j = 0, rowLen = ctx.canvas.width / blockSize; j < rowLen; j++) {
            matrix[i][j] = 0;
        }
    }
    document.getElementById("score").innerText = score;
    createNext();
    dealWithNew();
    document.getElementById("pause").style.display = "inline";
}
function operate() {
    downTime++;
    action = "b";
    clrLastShape();
    nowShape.pos.row++;
    if (isReach()) {
        nowShape.pos.row--;
    }
    putShape(nowShape);
    drawCtx();
}
function rotate(shape) {
    var newShape = [[], [], [], []];
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            //newShape[3-j][i]=shape[i][j];
            newShape[i][j] = shape[j][3 - i];
        }
    }
    return newShape;
}
function dealWithNew() {
    if (nowShape.shape) {
        lastShape.shape = copyMatrix(nowShape.shape);
        lastShape.pos = {};
        lastShape.pos.row = nowShape.pos.row - 1;
        lastShape.pos.line = nowShape.pos.line;
        putShape(lastShape);
    }

    //消除满行
    for (var i = 0, len = matrix.length; i < len; i++) {
        var sign = true;
        for (var j = 0, rowLen = matrix[i].length; j < rowLen; j++) {
            if (matrix[i][j] == 0) {
                sign = false;
            }
        }
        if (sign) {
            downTime++;
            score += 4;
            document.getElementById("score").innerText = score;
            for (var k = i; k > 0; k--) {
                for (var n = 0, rowLen = matrix[k].length; n < rowLen; n++) {
                    matrix[k][n] = matrix[k - 1][n];
                }
            }
            for (var n = 0, rowLen = matrix[i].length; n < rowLen; n++) {
                matrix[0][n] = 0;
            }
        }
    }
    if (downTime != -1 && downTime < 4) {
        fail();
        clearInterval(interval);
        return;
    }


    score++;
    document.getElementById("score").innerText = score;
    //速度变化
    var sp=1000 - ((score - (score % 10)) / 10) * 100
    speed =sp>100?sp:100;
    clearInterval(interval);
    interval = setInterval(operate, speed);
    nowShape.shape = nextShape.shape;
    createNext();
    var emptySign = true;
    for (var i = 3; i >= 0; i--) {
        for (var j = 0; j < 4; j++) {
            if (nowShape.shape[i][j] != 0) {
                emptySign = false;
                break;
            }
        }
        if (!emptySign) {
            nowShape.pos = {row: -1 - i, line: 3};
            break;
        }
    }

    //1,3 2,3...
    downTime = 0;
    clearInterval(interval);
    interval = setInterval(operate, speed);
    //interval=setTimeout(operate, 1000);
}
function createNext() {
    var nextIndex = Math.floor(Math.random() * 7);
    var rotateTimes = Math.floor(Math.random() * 4);
    nextShape.shape = shapes[nextIndex];
    nextShape.color = shapesColor[nextIndex];
    while (rotateTimes--) {
        nextShape.shape = rotate(nextShape.shape);
    }

    function drawNext() {
        var width = nextCtx.canvas.width, height = nextCtx.canvas.height;
        var widthBlock = width / blockSize, heightBlock = height / blockSize;
        for (var i = 0; i < heightBlock; i++) {
            for (var j = 0; j < widthBlock; j++) {
                nextShape.shape[i][j] ? nextCtx.fillStyle = shapesColor[nextShape.shape[i][j]] : nextCtx.fillStyle = bgColor;
                nextCtx.fillRect(blockSize * j + 1, blockSize * i + 1, blockSize - 2, blockSize - 2)
            }
        }
    }

    drawNext();
}
function fail() {
    document.getElementById("mask").style.display = "block";
    var img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function () {
        resCtx.drawImage(img, 0, 0);
    }
    resultCanvas.style.display = "block";
    document.getElementById("mes").innerHTML = "<p>您的成绩是" + score + "分！</p>"
}
document.onkeydown = keydown;
function keydown(event) {
    if (resultCanvas.style.display != "none") return;
    var e = event || window.event;
    if (e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault();
    switch (e.keyCode) {
        case 37://left
            move("l");
            break;
        case 38://top
            move("t");
            break;
        case 39://right
            move("r");
            break;
        case 40://bottom
            move("b");
            break;
        default:
            break;
    }
}
function move(op) {
    clrLastShape();
    switch (op) {
        case "r":
            action = "r";
            nowShape.pos.line++;
            if (isReach()) {
                nowShape.pos.line--;
            }
            break;
        case "l":
            nowShape.pos.line--;
            action = "l";
            if (isReach()) {
                nowShape.pos.line++;
            }
            break;
        case "b":
            action = "b";
            clearInterval(interval);
            interval = setInterval(operate, 10);
            break;
        case "t":
            action = "t";
            var savedShape = copyMatrix(nowShape.shape);
            nowShape.shape = rotate(nowShape.shape);
            if (isReach()) {
                nowShape.shape = savedShape;
            }
            break;
        default:
            break;
    }
    ;
    putShape(nowShape);
    drawCtx();
};
canvas.removeEventListener("touchstart", touchstart, false);
canvas.removeEventListener("touchmove", touchmove, false);
canvas.removeEventListener("touchend", touchend, false);
canvas.addEventListener("touchstart", touchstart, false);
canvas.addEventListener("touchmove", touchmove, false);
canvas.addEventListener("touchend", touchend, false);
function touchend(e) {
    if (Math.abs(pe.x - ps.x) > Math.abs(pe.y - ps.y)) {
        //横向
        if (pe.x - ps.x > validDistance) {//右移
            move("r")
        } else if (pe.x - ps.x < 0 - validDistance) {//左移
            move("l")
        }
    } else {
        if (pe.y - ps.y > validDistance) {//下移
            move("b")
        } else if (pe.y - ps.y < 0 - validDistance) {//上移
            move("t")
        }
    }
}
function touchstart(e) {
    ps.x = e.touches[0].pageX;
    ps.y = e.touches[0].pageY;
    e.preventDefault();
}
function touchmove(e) {
    pe.x = e.touches[0].pageX;
    pe.y = e.touches[0].pageY;
    e.preventDefault();
}
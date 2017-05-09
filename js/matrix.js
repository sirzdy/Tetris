/**
 * Created by zdy on 2017/5/6.
 */
function log(matrix) {
    for (var i = 0; i < matrix.length; i++) {
        console.log(matrix[i].join(" "))
        console.log(" ");
    }
}
function copyMatrix(originMatrix) {
    var newMatrix = [];
    for (var i = 0, len = originMatrix.length; i < len; i++) {
        newMatrix[i] = [];
        for (var j = 0, rowLen = originMatrix[i].length; j < rowLen; j++) {
            newMatrix[i][j] = originMatrix[i][j];
        }
    }
    return newMatrix;
}


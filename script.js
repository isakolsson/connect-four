const boardArray = new Array(9).fill(null);
const boardElement = document.querySelector("#board");
const information = document.querySelector("#information");
const computerInformation = document.querySelector("#computer-information");
const restart = document.querySelector("#restart");

let round = 0;
let playerGetFirstTurn = false;
let interval, timeout;

window.onload = () => {
    startGame();
}

restart.onclick = () => {
    startGame();
}

function startGame() {
    clearInterval(interval);
    clearTimeout(timeout);
    round = 0;
    playerGetFirstTurn = document.querySelector("#player-first-turn").checked;
    boardArray.fill(null);
    Array.from(boardElement.getElementsByClassName("square")).forEach(square => {
        square.classList.remove("x");
        square.classList.remove("o");
        square.classList.remove("green");
        square.classList.remove("red");
        square.classList.remove("yellow");
    });
    newRound();
}

function newRound() {
    if (checkForWinner(boardArray) !== null) {
        if (checkForWinner === "x") {
            information.innerText = "you won";
        } else {
            information.innerText = "the computer won";
        }
        return;
    }
    if (round === 9) {
        information.innerText = "game ended with a draw";
        return;
    }

    round++;
    if (round % 2 == playerGetFirstTurn) {
        newRoundPlayer();
    } else {
        newRoundComputer();
    }
}

function newRoundPlayer() {
    boardElement.classList.add("players-turn");
    information.innerText = "your turn";
}

Array.from(boardElement.getElementsByClassName("square")).forEach((squareElement, i) => {
    squareElement.onclick = () => {
        if (boardArray[i] === null && boardElement.classList.contains("players-turn")) {
            boardElement.classList.remove("players-turn");
            placePiece(true, i);
        }
    }
})

function placePiece(isPlayer, squareIndex) {
    if (isPlayer) {
        boardArray[squareIndex] = "x";
        boardElement.getElementsByClassName("square")[squareIndex].classList.add("x");
    } else {
        boardArray[squareIndex] = "o";
        boardElement.getElementsByClassName("square")[squareIndex].classList.add("o");
    }
    newRound();
}

function checkForWinner(board) {
    for (i = 0; i < 9; i+=3) {
        const value = board[i];
        // console.log("a");
        if (value !== null) {
            // console.log("b");
            if (value === board[i+1] && value === board[i+2]) {
                // console.log("c");
                return value;
            }
        }
    }
    for (i = 0; i < 3; i++) {
        const value = board[i];
        // console.log("1");
        if (value !== null) {
            // console.log("2");
            if (value === board[i+3] && value === board[i+6]) {
                // console.log("3");
                return value;
            }
        }
    }
    if (board[0] !== null && board[0] === board[4] && board[0] === board[8]) {
        // console.log("alpha");
        return board[0];
    }
    if (board[2] !== null && board[2] === board[4] && board[2] === board[6]) {
        // console.log("beta");
        return board[2];
    }
    return null;
}

function newRoundComputer() {
    information.innerText = "computer's turn";
    let bestIndex = -1;
    let best = -1;
    let i = 0;
    interval = window.setInterval(() => {
        const board = possibleMoves(boardArray, "o")[i];
        const value = minimax(board, 9-round, false);
        if (value > best || bestIndex === -1) {
            bestIndex = findDifferenceIndexBetweenTwoBoards(boardArray, board);
            best = value;
        }
        if (value === 1) {
            document.querySelectorAll(".square:not(.o):not(.x)")[i].classList.add("green");
            computerInformation.innerText = "empty square number " + (i+1) + ": computer will win";
        } else if (value === -1) {
            document.querySelectorAll(".square:not(.o):not(.x)")[i].classList.add("red");
            computerInformation.innerText = "empty square number " + (i+1) + ": computer might lose";
        } else {
            document.querySelectorAll(".square:not(.o):not(.x)")[i].classList.add("yellow");
            computerInformation.innerText = "empty square number " + (i+1) + ": match might end with a draw";
        }

        i++;
        if (i >= possibleMoves(boardArray, "o").length) {
            clearInterval(interval);
            timeout = setTimeout(() => {
                Array.from(document.getElementsByClassName("square")).forEach(square => {
                    square.classList.remove("green");
                    square.classList.remove("red");
                    square.classList.remove("yellow");
                    computerInformation.innerText = "";
                });
                placePiece(false, bestIndex);
            }, 3*(Math.pow(-5*round, 2) + 45*round));
            
        }
    }, Math.pow(-5*round, 2) + 45*round);
}



function findDifferenceIndexBetweenTwoBoards(board1, board2) {
    for (let i = 0; i < 9; i++) {
        if (board1[i] !== board2[i]) {
            return i;
        }
    }
    return -1;
}

function minimax(node, depth, maximizingPlayer) {
    // console.count();
    if (depth === 0 || checkForWinner(node)) {
        const winner = checkForWinner(node);
        if (winner === "o") {
            return 1;
        } else if (winner === "x") {
            return -1;
        } else {
            return 0;
        }
    }
    if (maximizingPlayer) {
        let value = -1;
        possibleMoves(node, "o").forEach(child => value = Math.max(value, minimax(child, depth-1, false)));
        return value;
    } else {
        let value = 1;
        possibleMoves(node, "x").forEach(child => value = Math.min(value, minimax(child, depth-1, true)));
        return value;
    }
}

function possibleMoves(board, piece) {
    const possibleMoves = new Array();
    board.forEach((square, i) => {
        if (square === null) {
            possibleMoves.push(board.map((x, j) => j === i ? piece : x));
        }
    });
    return possibleMoves;
}
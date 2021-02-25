const boardArray = new Array(42).fill(null);
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
        if (checkForWinner(boardArray) === "x") {
            information.innerText = "you won";
        } else {
            information.innerText = "the computer won";
        }
        return;
    }
    if (round === 42) {
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
    squareElement.innerHTML = '<span style="font-size:30px">' + i + '</span>';//TABORT
    squareElement.onclick = () => {
        if (boardArray[i] === null && boardElement.classList.contains("players-turn")) {
            boardElement.classList.remove("players-turn");
            placePiece(true, findLowestEmptySquare(boardArray, i%7));
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

function findLowestEmptySquare(board, column) {
    for (let i = 35+column; i >= 0; i-=7) {
        if (board[i] == null) {
            return i;
        }
    }
    return -1;
}

function checkForWinner(board) {
    let winner = null;
    board.forEach((square, i) => {
        if (square != null) {
            if (i < 21) {
                if (square == board[i+7] && square == board[i+14] && square == board[i+21]) {
                    // console.log(i + " vertical " + square);
                    winner = square;
                }
            }
            if (i%7 < 4) {
                if (square == board[i+1] && square == board[i+2] && square == board[i+3]) {
                    // console.log(i + " horizontal " + square);
                    winner = square;
                }
            }
            if (i < 21 && i%7 < 4) {
                if (square == board[i+8] && square == board[i+16] && square == board[i+24]) {
                    // console.log(i + " alpha " + square);
                    winner = square;
                }
            } else if (i%7 < 4) {
                if (square == board[i-6] && square == board[i-12] && square == board[i-18]) {
                    // console.log(i + " beta " + square);
                    winner = square;
                }
            }
        }
        
    });

    return winner;
}

function newRoundComputer() {
    information.innerText = "computer's turn";
    let bestIndex = -1;
    let best = -1;
    let i = 0;
    interval = window.setInterval(() => {
        const board = possibleMoves(boardArray, "o")[i];
        // const value = minimax(board, 9-round, false);
        const value = minimax(board, 7, false);
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
            }, 3*(Math.pow(-2*round, 2) + 2*round));
            
        }
    }, Math.pow(-2*round, 2) + 2*round);
}



function findDifferenceIndexBetweenTwoBoards(board1, board2) {
    for (let i = 0; i < 42; i++) {
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
    for (let i = 0; i < 7; i++) {
        if (findLowestEmptySquare(board, i) != -1) {
            const copy = board.map(x=>x);
            copy[findLowestEmptySquare(board, i)] = piece;
            possibleMoves.push(copy);
        }
    }
    return possibleMoves;
}
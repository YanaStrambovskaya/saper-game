function getMatrix (cols, rows) {
    const matrix = [];
    let idCounter = 1

    for (let y = 0; y <  rows; y++) {
        const row = []
        for (let x = 0; x < cols; x++) {
            row.push({
                id: idCounter ++,
                left: false,
                right: false,
                show: false,
                flag: false,
                mine: false,
                number: 0,
                x,
                y
            })
        }
        matrix.push(row)
    }

    return matrix
}

function getFreeCell (matrix) {
    const freeCell = [];

    forEach(matrix, (x) => {
        if (x.mine === false) {
            freeCell.push(x);
        }
    })

    const index = Math.floor(Math.random() * freeCell.length);
    return freeCell[index];
}

function setRandomMine (matrix) {
    const cell = getFreeCell(matrix);
    
    cell.mine = true;

    const cells =  getCellsAround(matrix, cell.x, cell.y);

    for (const cell of cells) {
        cell.number += 1;
    }

}

function getCell (matrix, x, y) {
    if (!matrix[y] || !matrix[y][x]) {
        return false
    }
    return matrix[y][x];
}

function getCellsAround (matrix, y, x) {
    const cells = [];

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) {
                continue
            }
            const cell = getCell(matrix, y + dy, x + dx);

            if (!cell || cell.show) continue;
            cells.push(cell)
        }

    }

    return cells;
}

function forEach (elem, func) {
    for (let y = 0; y < elem.length; y++) {
        for (let x = 0; x < elem[y].length; x++) {
            func(elem[y][x])
        }
    }
}

function getCellBiId(matrix, id) {

    for (let y = 0; y < matrix.length; y++) {

        for (let x = 0; x < matrix[y].length; x++){

            if (matrix[y][x].id === id) {
                return matrix[y][x];
            };

        }
    }

    return false;
}


function matrixToHtml (matrix) {
    const gameElement = document.createElement('div');
    gameElement.classList.add('saper');

    for(let y = 0; y < matrix.length; y ++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        for (let x = 0; x < matrix[y].length; x ++) {
            const imgElement = document.createElement('img');
            const cell = matrix[y][x];
            imgElement.draggable = false;
            imgElement.oncontextmenu = () => false;
            imgElement.setAttribute('data-cell-id', cell.id);
            rowElement.append(imgElement);
            
            if (cell.flag) {
                imgElement.src = 'img/flag.png';
                continue
            }

            if (!cell.show) {
                if (y % 2 !== 0) {
                    if (x % 2 !== 0) {
                        imgElement.src = 'img/empty.jpg';
                    } else {
                        imgElement.src = 'img/empty1.jpg';
                    }
                } else {
                    if (x % 2 === 0) {
                        imgElement.src = 'img/empty.jpg';
                    } else {
                        imgElement.src = 'img/empty1.jpg';
                    }
                }
                continue
            }

            if (cell.mine) {
                imgElement.src = 'img/bomb.jpg';
                continue
            }

            if (cell.number) {
                imgElement.src = 'img/' + cell.number + '.png';
                continue
            }

            if (y % 2 !== 0) {
                if (x % 2 !== 0) {
                    imgElement.src = 'img/empty2.jpg';
                } else {
                    imgElement.src = 'img/empty3.jpg';
                }
            } else {
                if (x % 2 === 0) {
                    imgElement.src = 'img/empty2.jpg';
                } else {
                    imgElement.src = 'img/empty3.jpg';
                }
            }

        }
        gameElement.append(rowElement);
    }

    return gameElement;
}

function isWin (matrix) {
    const mineCells = [];
    const flagCells = [];

    function isShow (matrix) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                const cell = matrix[y][x];
                if (!cell.flag && !cell.show) {
                    return false;
                };
                if (cell.flag) flagCells.push(x);
                if (cell.mine) mineCells.push(x);
            }
        };
        return true
    }

    const a = isShow(matrix);

    if (a) {
        if (mineCells.length !== flagCells.length) return false;
        return true;
    }
    

}

function isLose (matrix, cell) {
    if (cell.mine && cell.show) {
        forEach(matrix, (x) => {
            x.show = true;
        })
        alert('You lose');
        const restart = document.querySelector('#restart');
        restart.removeAttribute('disabled', 'disabled');
    }
}








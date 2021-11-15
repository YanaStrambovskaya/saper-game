let matrix = null;
let running = null;


async function createOptions (id, min, max) {
    const response = await fetch("http://localhost:3000/size");
    const result = await response.json()
    .then((data) => {
        const select = document.getElementById(id);
        for (let i = min; i <= max; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.innerHTML = i;
            if (i == data[id]) {
                option.setAttribute("selected", "selected")
            };
    
            select.appendChild(option);
        } 
    })
    
}   

function optionVisibility (flag) {
    const options = document.getElementById('options');
    const selects = options.getElementsByTagName('select');
    const start = document.querySelector('#start');
    if (!flag) {
        start.setAttribute('disabled', 'disabled');
        for (let i = 0; i < selects.length; i++) {
            selects[i].setAttribute('disabled', 'disabled');
        }
        return
    } 
    start.removeAttribute('disabled', 'disabled');
    for (let i = 0; i < selects.length; i++) {
        selects[i].removeAttribute('disabled', 'disabled');
    }
}

createOptions('cols', 4, 15);
createOptions('rows', 4, 15);
createOptions('mines', 1, 50);

init();

const options = document.getElementById('options');

const start = document.querySelector('#start');
start.addEventListener('click', setOption)

async function setOption (e) {
    const cols = document.querySelector('#cols');
    const rows = document.querySelector('#rows');
    const mines = document.querySelector('#mines');
    console.log({cols, rows, mines});
    const response = await fetch("http://localhost:3000/size");
    const result = await response.json()
    .then((data) => {

            fetch("http://localhost:3000/size", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cols: cols.value,
                    rows: rows.value,
                    mines: mines.value,
                })
            });
     
        init();
    })

}

async function init () {
    const restart = document.querySelector('#restart');
    const response = await fetch("http://localhost:3000/size");
    const result = await response.json()
    .then((data) => {
        matrix = getMatrix(data.cols, data.rows);
        running = true;
        for (let i = 0; i < data.mines; i++) {
            setRandomMine(matrix);
        }
        restart.setAttribute('disabled', 'disabled');
        update ();
        showFlagsNum();
        optionVisibility(true);
    })
}

document.getElementById('restart').addEventListener('click', () => init());


function update () {
    const gameElement = matrixToHtml(matrix)
    const appElement = document.getElementById('app');
    appElement.innerHTML = '';
    appElement.append(gameElement);

    appElement
        .querySelectorAll('img')
        .forEach((imgElement) => {
            imgElement.addEventListener('mousedown', mousedouwnHandler)
            imgElement.addEventListener('mouseup', mouseupHandler)
        })
}


function mousedouwnHandler (event) {
    const {left, right, cell} = getInfo(event);
   
    optionVisibility(false);
    
    if (left) {
        cell.left = true;
    }
    
    if (right) {
        cell.right = true;
    }
}

function mouseupHandler (event) {
    const {left, right, cell} = getInfo(event);
    const leftMouse = cell.left && !cell.right;
    const rightMouse = cell.right && !cell.left;
    if (left) {
        cell.left = false;
    }

    if (right) {
        cell.right = false;
    }  
    if (leftMouse) {
        leftHangler(matrix, cell);
    } else if (rightMouse) {
        rightHangler(matrix, cell);
    }
}

function getInfo (event) {
    const cell = event.target;
    const cellId = parseInt(cell.getAttribute('data-cell-id'));

    return {
        left: event.which === 1,
        right: event.which === 3,
        cell: getCellBiId(matrix, cellId)
    }
}

function leftHangler (matrix, cell) {
    if (cell.show || cell.flag) {
        return
    }

    cell.show = true;

    if (!cell.mine && !cell.number) {
        showSpead(matrix, cell, cell.x, cell.y);
    }

    isLose(matrix, cell)
    if (isWin(matrix)) {
        alert('You Win');
        const restart = document.querySelector('#restart');
        restart.removeAttribute('disabled', 'disabled');
    };
    

    update();
}

let mines = null;
async function showFlagsNum () {
    const response = await fetch("http://localhost:3000/size");
    const result = await response.json()
    .then((data) => {
        mines = data.mines;

        const flagNumParent = document.getElementById('flags');
        flagNumParent.innerHTML = '';
        const img = document.createElement('img');
        img.src= 'img/flag.png';
        img.width = '35';
        img.height = '35';
        const flagNum = document.createElement('p');
        flagNum.innerHTML = mines;
        flagNumParent.appendChild(flagNum);
        flagNumParent.appendChild(img);
    })
}

function rightHangler (matrix, cell) {
    const flagNumParent = document.getElementById('flags');
    const img = document.createElement('img');
    const flagNum = document.createElement('p');

    
    if (cell.flag) {
        cell.flag = !cell.flag;
        mines = mines + 1;

        flagNumParent.innerHTML = '';
        img.src= 'img/flag.png';
        img.width = '35';
        img.height = '35';
        flagNum.innerHTML = mines;
        flagNumParent.appendChild(flagNum);
        flagNumParent.appendChild(img);

        update();
        return false;
    } 

    
    if(mines <= 0) {
        flagNumParent.innerHTML = '';
        img.src= 'img/flag.png';
        img.width = '35';
        img.height = '35';
        flagNum.innerHTML = "your mines is out";
        flagNumParent.appendChild(flagNum);
        flagNumParent.appendChild(img);
        return false;
    }
    if (!cell.show) {
        cell.flag = !cell.flag;
        if (isWin(matrix)) {
            alert('You Win')
        };
        update();
    }

    if (mines > 0) {
        mines = mines - 1;

        flagNumParent.innerHTML = '';
        img.src= 'img/flag.png';
        img.width = '35';
        img.height = '35';
        flagNum.innerHTML = mines;
        flagNumParent.appendChild(flagNum);
        flagNumParent.appendChild(img);
    }
    
        
    
}

function showSpead (matrix, cell, x, y) {

    const cellsAround = getCellsAround (matrix, x, y);

        for (let x = 0; x < cellsAround.length; x++) {
            if (!cellsAround[x].mine) {
                cellsAround[x].show = true;
            }
        }

        let a = cellsAround.filter((x) => {
            return !x.number
        });

        if (a.length === 0) {
            return false;
        }

        for (let i = 0; i< a.length; i++) {
            const x = a[i].x;
            const y = a[i].y;
            const cell = getCell (matrix, x, y) 
            showSpead(matrix, cell, cell.x, cell.y)
        }
}


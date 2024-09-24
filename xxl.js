const board = document.getElementById('game-board');
const gameContainer = document.getElementById('game-container');
const difficultySelection = document.getElementById('difficulty-selection');
let rows, columns;
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
let tiles = [];

function setFontSize() {
    var width = window.innerWidth;
    var fontSize;

    if (width === 768) {
        fontSize = '18px';
    } else if (width === 480) {
        fontSize = '12px';
    } else {
        // 可以根据需要设置其他宽度下的字体大小
        fontSize = '16px';
    }

    document.documentElement.style.fontSize = fontSize;
}

window.addEventListener('resize', setFontSize);
setFontSize(); // 初始化时调用一次

// 根据难度初始化游戏板
function startGame(difficulty) {
    switch (difficulty) {
        case 'easy':
            rows = 8;
            columns = 8;
            break;
        case 'medium':
            rows = 10;
            columns = 10;
            break;
        case 'hard':
            rows = 13;
            columns = 13;
            break;
    }
    initBoard();
    difficultySelection.style.display = 'none';
    gameContainer.style.display = 'block';
}

// 初始化游戏板
function initBoard() {
    board.innerHTML = ''; // 清空游戏板
    tiles = []; // 重置tiles数组
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let i = 0; i < rows * columns; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.backgroundColor = getRandomColor();
        tile.addEventListener('click', () => handleTileClick(tile));
        board.appendChild(tile);
        tiles.push(tile);

        // 添加滑动事件
        const hammer = new Hammer(tile);
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
        hammer.on('swipe', (event) => handleSwipe(event, tile));
    }
}

// 获取随机颜色
function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// 处理方块点击事件
function handleTileClick(tile) {
    const color = tile.style.backgroundColor;
    const index = tiles.indexOf(tile);

    // 获取相邻的相同颜色的方块
    const matchingTiles = getMatchingTiles(index, color);

    if (matchingTiles.length >= 3) {
        matchingTiles.forEach(tile => {
            tile.classList.add('removed');
            setTimeout(() => {
                tile.style.backgroundColor = getRandomColor();
                tile.classList.remove('removed');
            }, 300);
        });
    }

    checkGameOver();
}

// 获取相邻的相同颜色的方块
function getMatchingTiles(index, color) {
    const matchingTiles = [];
    const queue = [index];
    const visited = new Set();

    while (queue.length > 0) {
        const currentIndex = queue.shift();
        if (visited.has(currentIndex)) continue;

        visited.add(currentIndex);
        const currentTile = tiles[currentIndex];
        if (currentTile.style.backgroundColor === color) {
            matchingTiles.push(currentTile);

            // 添加相邻方块到队列
            const neighbors = getNeighbors(currentIndex);
            queue.push(...neighbors);
        }
    }

    return matchingTiles;
}

// 获取相邻方块的索引
function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / columns);
    const col = index % columns;

    if (row > 0) neighbors.push(index - columns); // 上
    if (row < rows - 1) neighbors.push(index + columns); // 下
    if (col > 0) neighbors.push(index - 1); // 左
    if (col < columns - 1) neighbors.push(index + 1); // 右

    return neighbors;
}

// 处理滑动事件
function handleSwipe(event, tile) {
    const index = tiles.indexOf(tile);
    let targetIndex;

    switch (event.direction) {
        case Hammer.DIRECTION_UP:
            targetIndex = index - columns;
            break;
        case Hammer.DIRECTION_DOWN:
            targetIndex = index + columns;
            break;
        case Hammer.DIRECTION_LEFT:
            targetIndex = index - 1;
            break;
        case Hammer.DIRECTION_RIGHT:
            targetIndex = index + 1;
            break;
        default:
            return;
    }

    if (targetIndex >= 0 && targetIndex < tiles.length) {
        swapTiles(index, targetIndex);
    }

    checkGameOver();
}

// 交换两个方块的颜色并添加动画效果
function swapTiles(index1, index2) {
    const tile1 = tiles[index1];
    const tile2 = tiles[index2];

    tile1.classList.add('moving');
    tile2.classList.add('moving');

    setTimeout(() => {
        const tempColor = tile1.style.backgroundColor;
        tile1.style.backgroundColor = tile2.style.backgroundColor;
        tile2.style.backgroundColor = tempColor;

        tile1.classList.remove('moving');
        tile2.classList.remove('moving');
    }, 300);
}

// 检查游戏是否结束
function checkGameOver() {
    let hasMatchingTiles = false;

    for (let i = 0; i < tiles.length; i++) {
        const color = tiles[i].style.backgroundColor;
        const matchingTiles = getMatchingTiles(i, color);
        if (matchingTiles.length >= 3) {
            hasMatchingTiles = true;
            break;
        }
    }

    if (!hasMatchingTiles) {
        $('#gameOverModal').modal('show');
    }
}

// 返回到难度选择界面
function goBack() {
    gameContainer.style.display = 'none';
    difficultySelection.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    initBoard();
}

// 重新开始游戏（模态框按钮）
document.getElementById('restartGame').addEventListener('click', () => {
    $('#gameOverModal').modal('hide');
    initBoard();
});

// 开始新游戏（模态框按钮）
document.getElementById('newGame').addEventListener('click', () => {
    $('#gameOverModal').modal('hide');
    initBoard();
});


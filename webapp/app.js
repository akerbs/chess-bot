// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Константы
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Эмодзи фигур
const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Состояние игры
let gameState = {
    board: null,
    selectedSquare: null,
    validMoves: [],
    lastMove: null,
    isWhiteTurn: true,
    gameOver: false,
    pendingValidMoves: null // Ожидаем ответ от бота
};

// Инициализация начальной позиции
function initStartingPosition() {
    // Начальная позиция в шахматах
    return [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    setupEventListeners();
    
    // Инициализируем начальную позицию
    gameState.board = initStartingPosition();
    updateBoard();
    updateStatus('Ваш ход');
    
    // Загружаем состояние игры при загрузке
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (userId) {
        // Запрашиваем актуальное состояние у бота
        loadGameState();
    } else {
        // Если нет userId, запрашиваем новую игру
        tg.sendData(JSON.stringify({ type: 'newGame' }));
    }
});

// Инициализация доски
function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const square = createSquare(rank, file);
            board.appendChild(square);
        }
    }
}

// Создание клетки
function createSquare(rank, file) {
    const square = document.createElement('div');
    square.className = 'square';
    square.dataset.rank = rank;
    square.dataset.file = file;
    square.dataset.square = FILES[file] + RANKS[rank];
    
    // Чередование цветов
    const isLight = (rank + file) % 2 === 0;
    square.classList.add(isLight ? 'light' : 'dark');
    
    // Координаты
    if (file === 7) {
        const rankLabel = document.createElement('div');
        rankLabel.className = 'coordinates rank';
        rankLabel.textContent = RANKS[rank];
        square.appendChild(rankLabel);
    }
    
    if (rank === 7) {
        const fileLabel = document.createElement('div');
        fileLabel.className = 'coordinates file';
        fileLabel.textContent = FILES[file];
        square.appendChild(fileLabel);
    }
    
    // Обработчики событий
    square.addEventListener('click', () => handleSquareClick(square));
    square.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (gameState.validMoves.includes(square.dataset.square)) {
            square.classList.add('valid-move');
        }
    });
    square.addEventListener('dragleave', () => {
        square.classList.remove('valid-move');
    });
    square.addEventListener('drop', (e) => {
        e.preventDefault();
        square.classList.remove('valid-move');
        handleSquareClick(square);
    });
    
    return square;
}

// Обработка клика по клетке
async function handleSquareClick(squareElement) {
    const square = squareElement.dataset.square;
    
    if (gameState.gameOver) {
        return;
    }
    
    // Проверяем, чей сейчас ход
    if (!gameState.isWhiteTurn) {
        updateStatus('Сейчас ход бота. Подождите...');
        return;
    }
    
    // Если выбрана клетка с фигурой
    if (gameState.selectedSquare === null) {
        const piece = getPieceAt(square);
        if (piece && isOwnPiece(piece)) {
            await selectSquare(square);
        }
    } else {
        // Если выбрана целевая клетка
        if (gameState.validMoves.includes(square)) {
            makeMove(gameState.selectedSquare, square);
        } else {
            // Отмена выбора или выбор другой фигуры
            const piece = getPieceAt(square);
            if (piece && isOwnPiece(piece)) {
                await selectSquare(square);
            } else {
                clearSelection();
            }
        }
    }
}

// Выбор клетки
async function selectSquare(square) {
    clearSelection();
    gameState.selectedSquare = square;
    
    const squareElement = getSquareElement(square);
    squareElement.classList.add('selected');
    
    // Получаем возможные ходы от бота
    updateStatus('Загрузка возможных ходов...');
    gameState.validMoves = await getValidMoves(square);
    highlightValidMoves();
    updateStatus(gameState.isWhiteTurn ? 'Ваш ход' : 'Ход бота');
}

// Очистка выбора
function clearSelection() {
    if (gameState.selectedSquare) {
        const squareElement = getSquareElement(gameState.selectedSquare);
        squareElement.classList.remove('selected');
    }
    
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    clearHighlights();
}

// Подсветка возможных ходов
function highlightValidMoves() {
    gameState.validMoves.forEach(square => {
        const squareElement = getSquareElement(square);
        const piece = getPieceAt(square);
        if (piece) {
            squareElement.classList.add('valid-capture');
        } else {
            squareElement.classList.add('valid-move');
        }
    });
}

// Очистка подсветки
function clearHighlights() {
    document.querySelectorAll('.valid-move, .valid-capture').forEach(el => {
        el.classList.remove('valid-move', 'valid-capture');
    });
}

// Получить фигуру на клетке
function getPieceAt(square) {
    if (!gameState.board) return null;
    const [file, rank] = squareToCoords(square);
    return gameState.board[rank]?.[file] || null;
}

// Проверить, своя ли фигура
function isOwnPiece(piece) {
    if (!piece) return false;
    const isWhite = piece === piece.toUpperCase();
    return isWhite === gameState.isWhiteTurn;
}

// Получить URL API сервера
function getApiUrl() {
    const hostname = window.location.hostname;
    
    // Для локальной разработки используем localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    
    // Для Netlify используем Netlify Functions (serverless functions)
    // Они автоматически доступны по тому же домену через /api/*
    return ''; // Пустая строка = тот же домен (Netlify Functions)
}

// Получить возможные ходы от бота
function getValidMoves(square) {
    return new Promise(async (resolve) => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        
        if (!userId) {
            resolve([]);
            return;
        }
        
        // Получаем валидные ходы через API
        try {
            const baseUrl = getApiUrl();
            const apiUrl = baseUrl ? `${baseUrl}/api/valid-moves` : '/api/valid-moves';
            const fullUrl = `${apiUrl}?userId=${userId}&square=${square}`;
            const response = await fetch(fullUrl);
            if (response.ok) {
                const data = await response.json();
                resolve(data.moves || []);
            } else {
                resolve([]);
            }
        } catch (error) {
            console.error('Ошибка при получении валидных ходов:', error);
            // Fallback: используем простую логику для демонстрации
            resolve([]);
        }
    });
}

// Сделать ход
function makeMove(from, to) {
    // Визуально перемещаем фигуру сразу (оптимистичное обновление)
    const fromElement = getSquareElement(from);
    const toElement = getSquareElement(to);
    const pieceElement = fromElement.querySelector('.piece');
    
    if (pieceElement) {
        // Обновляем локальное состояние
        const [fromFile, fromRank] = squareToCoords(from);
        const [toFile, toRank] = squareToCoords(to);
        const piece = gameState.board[fromRank][fromFile];
        
        gameState.board[fromRank][fromFile] = null;
        gameState.board[toRank][toFile] = piece;
        
        // Анимация перемещения
        pieceElement.classList.add('moving');
        setTimeout(() => {
            toElement.appendChild(pieceElement);
            pieceElement.classList.remove('moving');
            updateBoard();
            clearSelection();
        }, 300);
    } else {
        updateBoard();
        clearSelection();
    }
    
    // Отправляем ход боту
    sendMoveToBot(from, to);
    
    // Обновим состояние через небольшую задержку (чтобы получить ответ от бота)
    setTimeout(() => {
        loadGameState();
    }, 500);
}

// Отправка хода боту
function sendMoveToBot(from, to) {
    tg.sendData(JSON.stringify({
        type: 'move',
        from: from,
        to: to
    }));
}

// Обновление доски
function updateBoard() {
    if (!gameState.board) return;
    
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const square = FILES[file] + RANKS[rank];
            const squareElement = getSquareElement(square);
            const piece = gameState.board[rank]?.[file];
            
            // Удаляем старую фигуру
            const oldPiece = squareElement.querySelector('.piece');
            if (oldPiece) {
                oldPiece.remove();
            }
            
            // Добавляем новую фигуру
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.textContent = PIECES[piece] || piece;
                pieceElement.draggable = true;
                pieceElement.addEventListener('dragstart', (e) => {
                    if (isOwnPiece(piece)) {
                        e.dataTransfer.effectAllowed = 'move';
                        selectSquare(square);
                    } else {
                        e.preventDefault();
                    }
                });
                squareElement.appendChild(pieceElement);
            }
        }
    }
    
    // Подсветка последнего хода
    if (gameState.lastMove) {
        const fromElement = getSquareElement(gameState.lastMove.from);
        const toElement = getSquareElement(gameState.lastMove.to);
        fromElement.classList.add('last-move');
        toElement.classList.add('last-move');
    }
}

// Получить элемент клетки
function getSquareElement(square) {
    return document.querySelector(`[data-square="${square}"]`);
}

// Преобразование координат
function squareToCoords(square) {
    const file = FILES.indexOf(square[0]);
    const rank = RANKS.indexOf(square[1]);
    return [file, rank];
}

// Загрузка состояния игры
async function loadGameState() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (!userId) {
        return;
    }
    
    try {
        // Получаем состояние через API
        const baseUrl = getApiUrl();
        const apiUrl = baseUrl ? `${baseUrl}/api/game-state` : '/api/game-state';
        const fullUrl = `${apiUrl}?userId=${userId}`;
        const response = await fetch(fullUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.board) {
                gameState.board = data.board;
                gameState.isWhiteTurn = data.isWhiteTurn;
                gameState.isGameOver = data.isGameOver;
                gameState.lastMove = data.lastMove;
                updateBoard();
                
                if (data.isGameOver) {
                    if (data.isCheckmate) {
                        updateStatus('🏆 Мат!');
                    } else if (data.isStalemate) {
                        updateStatus('🤝 Пат');
                    } else {
                        updateStatus('🤝 Ничья');
                    }
                } else {
                    updateStatus(data.isWhiteTurn ? 'Ваш ход' : 'Ход бота');
                }
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке состояния:', error);
        // Если API недоступен, продолжаем с текущим состоянием
    }
}

// Обработка данных от бота
// Telegram Web App получает данные через sendData, но ответ приходит через другой механизм
// Используем простой подход: Web App инициализирует доску с начальной позицией
// и обновляет через периодический запрос к боту (который будет обрабатываться на сервере)

// Для получения состояния от бота используем простой механизм:
// Бот будет отправлять состояние через специальный endpoint или через ответ на callback
// Пока используем начальную позицию и обновляем через ходы

// Обработка ответов от бота через MainButton
tg.MainButton.setText('Обновить');
tg.MainButton.show();
tg.MainButton.onClick(() => {
    loadGameState();
});

// Периодическое обновление состояния (каждые 3 секунды)
setInterval(() => {
    if (!gameState.gameOver) {
        loadGameState();
    }
}, 3000);

// Обработка данных от бота
tg.onEvent('viewportChanged', () => {
    tg.expand();
});

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('newGameBtn').addEventListener('click', () => {
        tg.sendData(JSON.stringify({ type: 'newGame' }));
    });
    
    document.getElementById('undoBtn').addEventListener('click', () => {
        tg.sendData(JSON.stringify({ type: 'undo' }));
    });
}

// Обновление статуса
function updateStatus(text) {
    document.getElementById('status').textContent = text;
}

// Экспорт для внешнего использования
window.chessApp = {
    updateBoard: (board) => {
        gameState.board = board;
        updateBoard();
    },
    updateStatus: updateStatus,
    setTurn: (isWhite) => {
        gameState.isWhiteTurn = isWhite;
    },
    setLastMove: (move) => {
        gameState.lastMove = move;
    },
    setGameOver: (over) => {
        gameState.gameOver = over;
    }
};


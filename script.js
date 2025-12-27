// API base URL
const API_BASE = 'http://localhost:3000/api';

// User state
let currentUser = null;

// Game state
let gameState = {
    isPlaying: false,
    timeLeft: 240, // 4 minutes in seconds
    score: 0,
    correct: 0,
    wrong: 0,
    currentProblem: null,
    timerInterval: null,
    selectedOperations: ['add', 'sub', 'mul', 'div'],
    problemHistory: [] // Track problems for statistics
};

// DOM elements
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');
const problemDisplayEl = document.getElementById('problemDisplay');
const answerInputEl = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const startBtn = document.getElementById('startBtn');
const newProblemBtn = document.getElementById('newProblemBtn');
const feedbackEl = document.getElementById('feedback');
const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Operation checkboxes
const addCheck = document.getElementById('addCheck');
const subCheck = document.getElementById('subCheck');
const mulCheck = document.getElementById('mulCheck');
const divCheck = document.getElementById('divCheck');

// User interface elements
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const userInfo = document.getElementById('userInfo');
const currentUsernameEl = document.getElementById('currentUsername');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const leaderboardList = document.getElementById('leaderboardList');
const timeframeSelect = document.getElementById('timeframeSelect');
const refreshLeaderboard = document.getElementById('refreshLeaderboard');
const statsContent = document.getElementById('statsContent');

// Initialize
function init() {
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserInfo();
    }

    // Game event listeners
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    newProblemBtn.addEventListener('click', generateNewProblem);
    restartBtn.addEventListener('click', resetGame);
    
    answerInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            checkAnswer();
        }
    });

    // Update selected operations when checkboxes change
    [addCheck, subCheck, mulCheck, divCheck].forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
            updateSelectedOperations();
        });
    });

    updateSelectedOperations();

    // User authentication
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Leaderboard
    refreshLeaderboard.addEventListener('click', loadLeaderboard);
    timeframeSelect.addEventListener('change', loadLeaderboard);
    
    // Load leaderboard on page load
    loadLeaderboard();
}

// Update selected operations based on checkboxes
function updateSelectedOperations() {
    gameState.selectedOperations = [];
    if (addCheck.checked) gameState.selectedOperations.push('add');
    if (subCheck.checked) gameState.selectedOperations.push('sub');
    if (mulCheck.checked) gameState.selectedOperations.push('mul');
    if (divCheck.checked) gameState.selectedOperations.push('div');
}

// Start the game
function startGame() {
    if (!currentUser) {
        alert('Please login first to play and track your scores!');
        return;
    }

    if (gameState.selectedOperations.length === 0) {
        alert('Please select at least one operation type!');
        return;
    }

    gameState.isPlaying = true;
    gameState.timeLeft = 240;
    gameState.score = 0;
    gameState.correct = 0;
    gameState.wrong = 0;
    gameState.problemHistory = [];

    updateUI();
    generateNewProblem();
    startTimer();

    startBtn.disabled = true;
    newProblemBtn.disabled = false;
    answerInputEl.disabled = false;
    submitBtn.disabled = false;
    answerInputEl.focus();

    // Disable operation checkboxes during game
    [addCheck, subCheck, mulCheck, divCheck].forEach(cb => cb.disabled = true);
}

// Generate a new math problem
function generateNewProblem() {
    if (!gameState.isPlaying) return;

    const operation = gameState.selectedOperations[
        Math.floor(Math.random() * gameState.selectedOperations.length)
    ];

    let num1, num2, answer, problemText;

    switch (operation) {
        case 'add':
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            answer = num1 + num2;
            problemText = `${num1} + ${num2} = ?`;
            break;

        case 'sub':
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * (num1 + 1));
            answer = num1 - num2;
            problemText = `${num1} - ${num2} = ?`;
            break;

        case 'mul':
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            answer = num1 * num2;
            problemText = `${num1} × ${num2} = ?`;
            break;

        case 'div':
            num2 = Math.floor(Math.random() * 9) + 1; // 1-9 (can't divide by 0)
            answer = Math.floor(Math.random() * 10); // 0-9
            num1 = num2 * answer;
            problemText = `${num1} ÷ ${num2} = ?`;
            break;
    }

    gameState.currentProblem = {
        operation,
        num1,
        num2,
        answer,
        problemText
    };

    problemDisplayEl.innerHTML = `<div class="problem">${problemText}</div>`;
    answerInputEl.value = '';
    answerInputEl.focus();
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback empty';
}

// Track problem attempt
function trackProblemAttempt(userAnswer, isCorrect) {
    if (gameState.currentProblem) {
        gameState.problemHistory.push({
            ...gameState.currentProblem,
            userAnswer,
            isCorrect
        });
    }
}

// Check the answer
function checkAnswer() {
    if (!gameState.isPlaying || !gameState.currentProblem) return;

    const userAnswer = parseInt(answerInputEl.value);
    const correctAnswer = gameState.currentProblem.answer;

    if (isNaN(userAnswer)) {
        feedbackEl.textContent = 'Please enter a valid number!';
        feedbackEl.className = 'feedback wrong';
        return;
    }

    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        gameState.score += 10;
        gameState.correct++;
        feedbackEl.textContent = '✓ Correct! Great job!';
        feedbackEl.className = 'feedback correct';
    } else {
        gameState.wrong++;
        feedbackEl.textContent = `✗ Wrong! The correct answer is ${correctAnswer}`;
        feedbackEl.className = 'feedback wrong';
    }

    // Track the problem attempt
    trackProblemAttempt(userAnswer, isCorrect);

    updateUI();

    // Generate new problem after a short delay
    setTimeout(() => {
        if (gameState.isPlaying) {
            generateNewProblem();
        }
    }, 1500);
}

// Start the timer
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;

        if (gameState.timeLeft <= 0) {
            endGame();
        } else {
            updateTimer();
        }
    }, 1000);
}

// Update timer display
function updateTimer() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Add warning class when time is running low
    if (gameState.timeLeft <= 30) {
        timerEl.classList.add('timer-warning');
    } else {
        timerEl.classList.remove('timer-warning');
    }
}

// End the game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerInterval);

    const totalProblems = gameState.correct + gameState.wrong;

    // Show game over screen
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalCorrect').textContent = gameState.correct;
    document.getElementById('finalWrong').textContent = gameState.wrong;
    document.getElementById('totalProblems').textContent = totalProblems;
    
    gameOverEl.classList.add('active');
    
    // Disable game controls
    answerInputEl.disabled = true;
    submitBtn.disabled = true;
    newProblemBtn.disabled = true;

    // Save game result to backend
    if (currentUser) {
        saveGameResult(totalProblems);
        loadUserRank();
    }
}

// Save game result to backend
async function saveGameResult(totalProblems) {
    try {
        const response = await fetch(`${API_BASE}/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                score: gameState.score,
                correct: gameState.correct,
                wrong: gameState.wrong,
                totalProblems: totalProblems,
                operations: gameState.selectedOperations
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Game saved:', data);
            // Refresh leaderboard and stats
            loadLeaderboard();
            if (document.getElementById('statsTab').classList.contains('active')) {
                loadUserStats();
            }
        }
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

// Load user rank
async function loadUserRank() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}/rank`);
        if (response.ok) {
            const data = await response.json();
            const rankDisplay = document.getElementById('rankDisplay');
            const userRank = document.getElementById('userRank');
            if (rankDisplay && userRank) {
                userRank.textContent = `#${data.rank}`;
                rankDisplay.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading rank:', error);
    }
}

// Reset the game
function resetGame() {
    gameState.isPlaying = false;
    gameState.timeLeft = 240;
    gameState.score = 0;
    gameState.correct = 0;
    gameState.wrong = 0;
    gameState.currentProblem = null;

    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    updateUI();
    problemDisplayEl.innerHTML = '<p class="instruction">Click "Start Game" to begin!</p>';
    answerInputEl.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback empty';
    gameOverEl.classList.remove('active');

    startBtn.disabled = false;
    newProblemBtn.disabled = true;
    answerInputEl.disabled = true;
    submitBtn.disabled = true;

    // Re-enable operation checkboxes
    [addCheck, subCheck, mulCheck, divCheck].forEach(cb => cb.disabled = false);
}

// Update UI elements
function updateUI() {
    updateTimer();
    scoreEl.textContent = gameState.score;
    correctEl.textContent = gameState.correct;
    wrongEl.textContent = gameState.wrong;
}

// User authentication functions
async function handleLogin() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter a username!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showUserInfo();
            usernameInput.value = '';
            
            if (user.isNew) {
                alert(`Welcome, ${user.username}! Your account has been created.`);
            }
        } else {
            alert('Failed to login. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error connecting to server. Make sure the server is running!');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showUserInfo();
    switchTab('game');
}

function showUserInfo() {
    if (currentUser) {
        currentUsernameEl.textContent = currentUser.username;
        loginForm.style.display = 'none';
        userInfo.style.display = 'flex';
    } else {
        loginForm.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab contents
    tabContents.forEach(content => {
        if (content.id === `${tabName}Tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Load data for specific tabs
    if (tabName === 'leaderboard') {
        loadLeaderboard();
    } else if (tabName === 'stats') {
        if (currentUser) {
            loadUserStats();
        } else {
            statsContent.innerHTML = '<p class="instruction">Please login to view your statistics.</p>';
        }
    }
}

// Load leaderboard
async function loadLeaderboard() {
    const timeframe = timeframeSelect.value;
    leaderboardList.innerHTML = '<p class="loading">Loading leaderboard...</p>';

    try {
        const response = await fetch(`${API_BASE}/leaderboard?timeframe=${timeframe}&limit=20`);
        if (response.ok) {
            const leaderboard = await response.json();
            displayLeaderboard(leaderboard);
        } else {
            leaderboardList.innerHTML = '<p class="error">Failed to load leaderboard.</p>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<p class="error">Error connecting to server. Make sure the server is running!</p>';
    }
}

function displayLeaderboard(leaderboard) {
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p class="instruction">No scores yet. Be the first to play!</p>';
        return;
    }

    let html = '<div class="leaderboard-table">';
    leaderboard.forEach((entry, index) => {
        const isCurrentUser = currentUser && entry.username === currentUser.username;
        html += `
            <div class="leaderboard-entry ${isCurrentUser ? 'current-user' : ''}">
                <span class="rank">#${index + 1}</span>
                <span class="username">${entry.username}</span>
                <span class="score">${Math.round(entry.best_score)}</span>
                <span class="avg-score">Avg: ${Math.round(entry.avg_score || 0)}</span>
                <span class="games">Games: ${entry.games_played}</span>
            </div>
        `;
    });
    html += '</div>';
    leaderboardList.innerHTML = html;
}

// Load user statistics
async function loadUserStats() {
    if (!currentUser) return;

    statsContent.innerHTML = '<p class="loading">Loading statistics...</p>';

    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}/stats`);
        if (response.ok) {
            const data = await response.json();
            displayUserStats(data);
        } else {
            statsContent.innerHTML = '<p class="error">Failed to load statistics.</p>';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        statsContent.innerHTML = '<p class="error">Error connecting to server.</p>';
    }
}

function displayUserStats(data) {
    const stats = data.stats;
    const accuracy = stats.total_problems > 0 
        ? Math.round((stats.total_correct / stats.total_problems) * 100) 
        : 0;

    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Overall Performance</h3>
                <p><strong>Total Games:</strong> ${stats.total_games || 0}</p>
                <p><strong>Best Score:</strong> ${stats.best_score || 0}</p>
                <p><strong>Average Score:</strong> ${Math.round(stats.avg_score || 0)}</p>
                <p><strong>Total Correct:</strong> ${stats.total_correct || 0}</p>
                <p><strong>Total Wrong:</strong> ${stats.total_wrong || 0}</p>
                <p><strong>Accuracy:</strong> ${accuracy}%</p>
            </div>
    `;

    if (data.operationStats && data.operationStats.length > 0) {
        html += '<div class="stat-card"><h3>Operation Performance</h3>';
        data.operationStats.forEach(op => {
            const opName = {
                'add': 'Addition',
                'sub': 'Subtraction',
                'mul': 'Multiplication',
                'div': 'Division'
            }[op.operation] || op.operation;
            const opAccuracy = op.total > 0 ? Math.round((op.correct / op.total) * 100) : 0;
            html += `
                <p><strong>${opName}:</strong> ${op.correct}/${op.total} correct (${opAccuracy}%)</p>
            `;
        });
        html += '</div>';
    }

    if (data.recentGames && data.recentGames.length > 0) {
        html += '<div class="stat-card"><h3>Recent Games</h3><div class="recent-games">';
        data.recentGames.forEach(game => {
            const date = new Date(game.played_at).toLocaleString();
            html += `
                <div class="recent-game">
                    <span class="game-date">${date}</span>
                    <span class="game-score">Score: ${game.score}</span>
                    <span class="game-accuracy">${game.correct}/${game.total_problems} correct</span>
                </div>
            `;
        });
        html += '</div></div>';
    }

    html += '</div>';
    statsContent.innerHTML = html;
}

// Initialize the game when page loads
init();


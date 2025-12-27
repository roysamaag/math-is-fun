const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Initialize database
const db = new sqlite3.Database('./mathgame.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Games table - stores each game session
        db.run(`CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            wrong INTEGER NOT NULL,
            total_problems INTEGER NOT NULL,
            operations TEXT NOT NULL,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Problem attempts table - tracks individual problem performance
        db.run(`CREATE TABLE IF NOT EXISTS problem_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            operation TEXT NOT NULL,
            num1 INTEGER NOT NULL,
            num2 INTEGER NOT NULL,
            correct_answer INTEGER NOT NULL,
            user_answer INTEGER,
            is_correct INTEGER NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`);
    });
}

// API Routes

// Register or login user
app.post('/api/users', (req, res) => {
    const { username } = req.body;
    
    if (!username || username.trim().length === 0) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();

    // Check if user exists
    db.get('SELECT * FROM users WHERE username = ?', [trimmedUsername], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (user) {
            // User exists, return user info
            return res.json({ 
                id: user.id, 
                username: user.username,
                isNew: false 
            });
        } else {
            // Create new user
            db.run('INSERT INTO users (username) VALUES (?)', [trimmedUsername], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                res.json({ 
                    id: this.lastID, 
                    username: trimmedUsername,
                    isNew: true 
                });
            });
        }
    });
});

// Save game result
app.post('/api/games', (req, res) => {
    const { userId, score, correct, wrong, totalProblems, operations } = req.body;

    if (!userId || score === undefined || correct === undefined || wrong === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO games (user_id, score, correct, wrong, total_problems, operations) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, score, correct, wrong, totalProblems || (correct + wrong), JSON.stringify(operations)],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to save game' });
            }
            res.json({ gameId: this.lastID, message: 'Game saved successfully' });
        }
    );
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || 'all'; // all, today, week, month

    let dateFilter = '';
    if (timeframe === 'today') {
        dateFilter = "AND DATE(played_at) = DATE('now')";
    } else if (timeframe === 'week') {
        dateFilter = "AND played_at >= datetime('now', '-7 days')";
    } else if (timeframe === 'month') {
        dateFilter = "AND played_at >= datetime('now', '-30 days')";
    }

    const query = `
        SELECT 
            u.username,
            MAX(g.score) as best_score,
            AVG(g.score) as avg_score,
            SUM(g.correct) as total_correct,
            SUM(g.wrong) as total_wrong,
            COUNT(g.id) as games_played,
            MAX(g.played_at) as last_played
        FROM users u
        LEFT JOIN games g ON u.id = g.user_id
        WHERE 1=1 ${dateFilter}
        GROUP BY u.id
        HAVING COUNT(g.id) > 0
        ORDER BY best_score DESC, avg_score DESC
        LIMIT ?
    `;

    db.all(query, [limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
        res.json(rows);
    });
});

// Get user statistics
app.get('/api/users/:userId/stats', (req, res) => {
    const userId = req.params.userId;

    const statsQuery = `
        SELECT 
            COUNT(g.id) as total_games,
            MAX(g.score) as best_score,
            AVG(g.score) as avg_score,
            SUM(g.correct) as total_correct,
            SUM(g.wrong) as total_wrong,
            SUM(g.total_problems) as total_problems,
            MIN(g.played_at) as first_game,
            MAX(g.played_at) as last_game
        FROM games g
        WHERE g.user_id = ?
    `;

    db.get(statsQuery, [userId], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }

        // Get recent games
        db.all(
            'SELECT * FROM games WHERE user_id = ? ORDER BY played_at DESC LIMIT 10',
            [userId],
            (err, recentGames) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch recent games' });
                }

                // Get operation performance
                const operationQuery = `
                    SELECT 
                        operation,
                        COUNT(*) as total,
                        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
                        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as wrong
                    FROM problem_attempts pa
                    JOIN games g ON pa.game_id = g.id
                    WHERE g.user_id = ?
                    GROUP BY operation
                `;

                db.all(operationQuery, [userId], (err, operationStats) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch operation stats' });
                    }

                    res.json({
                        stats: stats || {
                            total_games: 0,
                            best_score: 0,
                            avg_score: 0,
                            total_correct: 0,
                            total_wrong: 0,
                            total_problems: 0
                        },
                        recentGames,
                        operationStats: operationStats || []
                    });
                });
            }
        );
    });
});

// Get user rank
app.get('/api/users/:userId/rank', (req, res) => {
    const userId = req.params.userId;

    // Get user's best score
    db.get('SELECT MAX(score) as best_score FROM games WHERE user_id = ?', [userId], (err, userResult) => {
        if (err || !userResult) {
            return res.status(500).json({ error: 'Failed to get user score' });
        }

        const userBestScore = userResult.best_score || 0;

        // Count users with better scores
        db.get(
            'SELECT COUNT(DISTINCT user_id) as rank FROM games WHERE score > ?',
            [userBestScore],
            (err, rankResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to calculate rank' });
                }
                res.json({ rank: (rankResult.rank || 0) + 1 });
            }
        );
    });
});

// Get trends (daily scores over time)
app.get('/api/trends', (req, res) => {
    const userId = req.query.userId;
    const days = parseInt(req.query.days) || 7;

    let query = `
        SELECT 
            DATE(played_at) as date,
            COUNT(*) as games_played,
            AVG(score) as avg_score,
            MAX(score) as max_score
        FROM games
        WHERE played_at >= datetime('now', '-' || ? || ' days')
    `;

    const params = [days];

    if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
    }

    query += ' GROUP BY DATE(played_at) ORDER BY date ASC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch trends' });
        }
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});


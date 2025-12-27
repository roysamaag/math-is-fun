# Math Is Fun - Math Practice Game

A fun and interactive math practice game where users can test their skills with addition, subtraction, multiplication, and division problems in a 4-minute challenge. Features user tracking, leaderboards, and statistics.

## Features

- 🎮 **Math Practice Game**: Single-digit math problems (addition, subtraction, multiplication, division)
- ⏱️ **4-Minute Timer**: Challenge yourself to solve as many problems as possible
- 👤 **User Accounts**: Login/register to track your progress
- 📊 **Leaderboards**: Compete with other players and see rankings
- 📈 **Statistics**: View your performance, accuracy, and operation-specific stats
- 🏆 **Score Tracking**: Track your best scores, average scores, and game history

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Play

1. **Login/Register**: Enter a username to create an account or login
2. **Select Operations**: Choose which math operations you want to practice
3. **Start Game**: Click "Start Game" to begin the 4-minute challenge
4. **Answer Problems**: Solve the math problems as quickly and accurately as possible
5. **View Results**: After the timer ends, see your score and rank
6. **Check Leaderboards**: See how you rank against other players
7. **View Statistics**: Track your progress and performance over time

## API Endpoints

- `POST /api/users` - Register or login a user
- `POST /api/games` - Save a game result
- `GET /api/leaderboard` - Get leaderboard (supports timeframe: all, today, week, month)
- `GET /api/users/:userId/stats` - Get user statistics
- `GET /api/users/:userId/rank` - Get user rank
- `GET /api/trends` - Get score trends over time

## Database

The application uses SQLite database (`mathgame.db`) which is automatically created on first run. The database stores:

- **Users**: User accounts and registration dates
- **Games**: Game sessions with scores and performance metrics
- **Problem Attempts**: Individual problem performance tracking

## Project Structure

```
MathIsFun/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # Frontend JavaScript
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Styling**: Modern CSS with gradients and animations

## License

ISC


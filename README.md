# Boardgame System

A web application for tracking boardgame plays, player rankings, and game statistics for your boardgame group.

## Features

- Game library management (add, edit, import from BoardGameGeek)
- Player directory and profiles
- Log game plays with results, scores, and notes
- Automatic calculation of player grades and win rates
- Dashboard with recent plays, top players, and statistics
- Filter rankings by year and minimum plays
- Responsive, playful UI

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Query
- **Backend:** Flask, SQLAlchemy, Gunicorn
- **Database:** PostgreSQL (or SQLite for development)
- **Other:** BoardGameGeek API integration

## Getting Started

Update environment in dev: conda activate boardgame

### Backend

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2. Set up your database (see `app/config.py` for settings).
3. Run the backend:
    ```bash
    flask run
    ```
   Or for production:
    ```bash
    gunicorn app:app
    ```

### Frontend

1. Install dependencies:
    ```bash
    cd boardgame_fe
    npm install
    ```
2. Start the frontend:
    ```bash
    npm start
    ```

## Usage

- Visit the dashboard to see stats and rankings.
- Add new games or import your collection from BoardGameGeek.
- Log game plays and player results.
- View player profiles and detailed stats.

## Ranking & Scoring

See the "How It Works" modal in the dashboard for a detailed explanation of grade and win rate calculations.

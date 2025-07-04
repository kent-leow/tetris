---
applyTo: '**'
---
# Project Architecture and Structure

## Application Architecture
```
tetris/
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   │   └── game/         # Game-specific components
│   └── lib/              # Core logic and utilities
│       └── game/         # Game engine and types
├── docs/                 # Documentation
└── public/              # Static assets
```

## Game Architecture
1. Core Game Engine
   - Tetromino management
   - Board state management
   - Collision detection
   - Score calculation

2. Game Components
   - Board rendering
   - Game controls
   - Score display
   - Next piece preview

3. Game States
   - Playing
   - Paused
   - Game Over
   - High Score Entry

4. Multiplayer Features
   - Two-player mode
   - Score comparison
   - Win/lose conditions

## Data Flow
1. User Input -> Game Engine -> State Update -> Render
2. Game Loop -> Physics Update -> State Update -> Render
3. Score Events -> State Update -> Storage -> Leaderboard

## Storage Architecture
1. Local Storage
   - High scores
   - Game settings
   - Player preferences

2. Azure Storage (Future)
   - Global leaderboard
   - Player profiles
   - Game statistics

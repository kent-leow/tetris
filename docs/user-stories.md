# User Stories


## Single Player User Stories
- As a player, I want to play Tetris solo in my browser.
- As a player, I want my highscore to be saved and ranked.
- As a player, I want to see a leaderboard of the top 10 scores.
- As a player, I want to pause and resume my single player game at any time.
- As a player, I want to customize the game controls for a more comfortable experience.

## Two Player User Stories
- As two players, we want to play Tetris together in the same browser window.
- As a player, I want to know when I win or lose in competitive mode.
- As two players, we want to see each other's scores and next pieces in real time.
- As a player, I want to send a "garbage line" to my opponent when I clear multiple lines at once.

## Menu System
- As a player, I want to access a main menu when I start the game.
- As a player, I want to see my current highscore displayed on the menu.
- As a player, I want to navigate between single player and two player modes from the menu.
- As a player, I want to access the leaderboard from the menu.

## General
- As a user, I want the game to work on desktop and tablet.
- As a developer, I want to test all features locally.
- As a developer, I want the project to be easy to deploy to the web.


---

# Requirements and Game Rules

## General Requirements
- The game must run at 60 FPS and be responsive to user input with latency < 16ms.
- The UI must be accessible via keyboard and support screen readers.
- The game must be playable on desktop and tablet devices.
- All game logic must be implemented in TypeScript with strict type safety.
- State management should use Zustand and React hooks.
- High scores and settings must persist in local storage.

## Single Player Game Rules
- The player controls tetrominoes that fall from the top of the board.
- The game ends when the stack of tetrominoes reaches the top of the board.
- The player scores points by clearing lines; more lines cleared at once yield higher scores.
- The game speed increases as the player clears more lines.
- The player can pause and resume the game.

## Two Player Game Rules
- Both players play on separate boards in the same window.
- Each player has their own controls and score.
- Clearing two or more lines at once sends a garbage line to the opponent.
- The first player to top out loses; the other wins.
- Both players can see each other's next piece and score in real time.

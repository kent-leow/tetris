# User Story: Improve Keyboard Accessibility and Prevent Unintended Restarts

## Title
Fix Keyboard Accessibility Bugs: Prevent Unintended Game Restarts and Enable Full Main Menu Navigation

## As a
Player who prefers using the keyboard for gameplay and navigation

## I want
1. The game to prevent the restart button from remaining focused after a game over, so that pressing the spacebar only drops the tetromino and does not unintentionally restart the game.
2. The main menu to be fully navigable and operable using only the keyboard, including selecting game modes, accessing settings, and opening the leaderboard.

## So that
I can enjoy a seamless and accessible experience without accidental restarts and with full keyboard control throughout the game and menus.

## Acceptance Criteria
- After a game over, the restart button is automatically unfocused or loses focus, so pressing spacebar does not trigger a restart unless the button is intentionally focused and activated.
- The main menu supports full keyboard navigation:
  - Tab and arrow keys move focus between menu items
  - Enter/Space activates the selected menu item
  - Visual focus indicators are present for all interactive elements
  - All menu actions (start game, settings, leaderboard, etc.) are accessible via keyboard
- Accessibility and usability are maintained (focus management, ARIA labels, etc.)
- The fixes are covered by unit and accessibility tests

## Notes
- Test on all supported browsers and devices
- Reference WAI-ARIA guidelines for keyboard navigation
- Document any new accessibility utilities or components

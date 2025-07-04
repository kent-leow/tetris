# User Story: Soft Drop Mechanic for Tetromino

## Title
Implement Soft Drop Mechanic for Tetromino (Hold Enter/Space for Fast Drop with Control)

## As a
Player who wants more control and a classic Tetris experience

## I want
Pressing and holding the Enter or Space key during gameplay to make the current tetromino fall rapidly (soft drop), instead of instantly dropping to the bottom (hard drop)

## So that
I can still move and rotate the tetromino while it is falling quickly, allowing for more precise placement and advanced gameplay strategies

## Description
Currently, pressing Enter or Space causes the tetromino to perform a hard drop, instantly locking it at the lowest possible position. The new requirement is to change this behavior so that pressing and holding Enter or Space will trigger a soft drop: the tetromino falls much faster than normal gravity, but the player can still move it left/right and rotate it until it lands. This matches the behavior of classic and modern Tetris games, improving playability and skill expression.

## Acceptance Criteria
- Pressing and holding Enter or Space triggers a soft drop (rapid descent)
- Tetromino does not lock immediately; player can move and rotate during soft drop
- Releasing Enter or Space returns the tetromino to normal fall speed
- Hard drop (instant drop and lock) is still available via a separate key (e.g., Up Arrow or configurable)
- Soft drop speed is configurable and matches classic Tetris standards
- All controls remain responsive during soft drop
- Feature is covered by unit, integration, and E2E tests
- Accessibility and keyboard navigation are maintained
- Documentation is updated to reflect new controls

## Code Quality Requirements
- Follow project coding standards and TypeScript strict mode
- Use proper types and interfaces for input handling and game state
- Ensure code is modular, maintainable, and well-documented
- Add JSDoc for new functions and interfaces
- Update or add tests for new and changed logic

## Feature Requirements
- Update input handling to distinguish between soft drop and hard drop
- Implement soft drop logic in the game engine
- Allow player to move and rotate tetromino during soft drop
- Add configuration for soft drop speed
- Update UI to reflect new control scheme (e.g., help overlay)
- Ensure compatibility with multiplayer mode

## Use Cases & Scenarios
- Player holds Enter/Space: tetromino falls rapidly, can still be moved/rotated
- Player releases Enter/Space: tetromino resumes normal fall speed
- Player presses hard drop key: tetromino instantly drops and locks
- Player uses soft drop in multiplayer mode
- Player uses soft drop with accessibility features enabled
- Player changes soft drop speed in settings

## Test Cases
- Unit: Soft drop logic triggers correct fall speed
- Unit: Player can move/rotate during soft drop
- Integration: Input handling distinguishes soft/hard drop
- Integration: Soft drop works in multiplayer
- E2E: Player can soft drop, move, rotate, and hard drop
- E2E: Accessibility and keyboard navigation are preserved
- Performance: No input lag during soft drop

## Documentation
- Update user guide and README with new control scheme
- Document soft drop configuration option
- Update changelog with new feature

---

- [ ] Title and user story format are clear
- [ ] Acceptance criteria are testable
- [ ] Code quality and feature requirements are explicit
- [ ] Use cases and test cases are comprehensive
- [ ] Documentation needs are identified
- [ ] Accessibility and performance are considered

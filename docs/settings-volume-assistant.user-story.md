# User Story: Enhanced Settings – Volume Control & Drop Assistant

## Title
Add Music/Sound Volume Adjustment and Drop Assistant Feature to Settings

## As a
Player who wants a personalized and accessible gameplay experience

## I want
To be able to adjust the music and sound effects volume from the settings menu, and enable an assistant feature that highlights the column where the current tetromino will drop

## So that
I can control the audio experience to my preference and have visual assistance for more precise gameplay


## Acceptance Criteria
- Settings menu includes sliders or controls to adjust music and sound effects volume independently
- Volume settings persist across sessions (local storage)
- An "Assistant" toggle is available in settings
- When enabled, a dashed-outline tetromino appears at the predicted landing position at the bottom of the board, showing where the current tetromino will land if dropped
- The assistant outline updates in real time as the tetromino moves left/right or rotates
- All new features are accessible via keyboard and screen reader
- Settings changes take effect immediately without requiring a game restart
- The new features are covered by unit and integration tests

## Notes
- Ensure volume controls are accessible and labeled for screen readers
- Dashed-outline tetromino should be visually distinct, meet color contrast requirements, and be clearly visible on all backgrounds
- Document new settings options and update user documentation
- All settings are saved in the browser local storage

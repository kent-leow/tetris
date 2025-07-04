# Enhanced Settings - Volume Control & Drop Assistant

## Overview

This update adds enhanced settings functionality to the Tetris game, including independent volume controls for music and sound effects, and a drop assistant feature that helps players visualize where pieces will land.

## Features

### Volume Controls

#### Music Volume
- **Range**: 0% - 100% (0.0 - 1.0)
- **Default**: 10% (0.1)
- **Control**: Horizontal slider with real-time feedback
- **Persistence**: Automatically saved to localStorage
- **Effect**: Immediately adjusts background music volume across all game modes

#### Sound Effects Volume
- **Range**: 0% - 100% (0.0 - 1.0)
- **Default**: 80% (0.8)
- **Control**: Horizontal slider with real-time feedback
- **Persistence**: Automatically saved to localStorage
- **Effect**: Immediately adjusts volume for drop sounds, line clear sounds, and other SFX

### Drop Assistant

#### Visual Guide
- **Appearance**: Dashed white outline showing where the current tetromino will land
- **Animation**: Subtle pulse effect for better visibility
- **Real-time Updates**: Position updates as the piece moves or rotates
- **Accessibility**: Screen reader compatible with descriptive labels

#### Behavior
- **Toggle**: On/off switch in settings menu
- **Default**: Disabled
- **Scope**: Works in both single-player and two-player modes
- **Performance**: Optimized calculations with minimal impact on gameplay

## Technical Implementation

### Settings Store (`src/lib/settings/store.ts`)

```typescript
interface Settings {
  musicVolume: number;      // 0.0 - 1.0
  sfxVolume: number;        // 0.0 - 1.0
  assistantEnabled: boolean;
}
```

**Key Features:**
- Zustand-based state management
- Automatic localStorage persistence
- Input validation and clamping
- Error handling for storage failures

### Audio Integration (`src/lib/audio/store.ts`)

**Updates:**
- Volume methods now read from settings store
- Real-time volume adjustment for all audio
- Backward compatibility with existing mute functionality

### Drop Assistant Logic (`src/lib/game/types.ts`)

**Function:** `getDropPosition(board, tetromino, position)`
- Calculates where a piece will land if dropped
- Handles collision detection with existing pieces
- Optimized for real-time updates during gameplay

### UI Components

#### SettingsOverlay (`src/components/menu/SettingsOverlay.tsx`)
- Modal dialog with retro styling
- Accessible form controls
- Keyboard navigation support
- Screen reader compatible

#### Game Integration
- **SinglePlayerGame**: Drop assistant overlay on game board
- **TwoPlayerGame**: Independent assistant for each player
- **MainMenu**: Settings button opens overlay

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between controls
- **Arrow Keys**: Adjust slider values
- **Space/Enter**: Toggle assistant switch
- **Escape**: Close settings modal

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all controls
- **Live Regions**: Volume changes announced
- **Role Attributes**: Proper semantic markup
- **Value Announcements**: Current slider positions read aloud

### Visual Accessibility
- **High Contrast**: Dashed outline meets WCAG standards
- **Color Independence**: Doesn't rely solely on color for information
- **Motion Sensitivity**: Subtle animations that don't cause distraction
- **Focus Indicators**: Clear visual focus states

## User Interface

### Settings Access
1. Click "Settings" button in main menu
2. Modal overlay appears with all controls
3. Changes take effect immediately
4. Close with X button, backdrop click, or Escape key

### Volume Controls
- **Visual Feedback**: Sliders show current percentage
- **Immediate Effect**: Audio adjusts as you drag
- **Range Indicators**: 0% to 100% clearly marked
- **Retro Styling**: Matches game aesthetic

### Assistant Toggle
- **Visual State**: Clear on/off indication
- **Immediate Preview**: Drop outline appears/disappears instantly
- **Description**: Explains what the feature does

## Performance Considerations

### Optimizations
- **Efficient Calculations**: Drop position computed only when needed
- **Minimal Re-renders**: Smart state management prevents unnecessary updates
- **CSS Animations**: Hardware-accelerated visual effects
- **Memory Management**: No memory leaks in audio handling

### Browser Compatibility
- **localStorage**: Graceful fallback when unavailable
- **Audio API**: Compatible with modern browsers
- **CSS Features**: Progressive enhancement for older browsers

## Testing Strategy

### Unit Tests
- Settings store functionality
- Volume validation and clamping
- Drop position calculations
- Error handling scenarios

### Integration Tests
- Settings persistence across sessions
- Audio system integration
- Game component interactions
- Accessibility compliance

### Manual Testing
- Keyboard navigation workflows
- Screen reader compatibility
- Visual contrast verification
- Performance under load

## Configuration

### Default Values
```typescript
const DEFAULT_SETTINGS = {
  musicVolume: 0.1,      // 10%
  sfxVolume: 0.8,        // 80%
  assistantEnabled: false
};
```

### Storage Key
- **localStorage Key**: `tetris-settings`
- **Format**: JSON string
- **Error Handling**: Falls back to defaults if corrupted

## Future Enhancements

### Potential Additions
- **Color Themes**: Multiple retro color schemes
- **Keybinding Customization**: Custom control mappings
- **Difficulty Settings**: Speed and complexity options
- **Assistant Customization**: Different outline styles

### Accessibility Improvements
- **High Contrast Mode**: Enhanced visibility option
- **Motion Reduction**: Respect prefers-reduced-motion
- **Font Size Options**: Adjustable text size
- **Voice Navigation**: Voice control support

## API Reference

### Settings Store Methods

```typescript
// Volume Controls
setMusicVolume(volume: number): void
setSfxVolume(volume: number): void

// Assistant Feature
setAssistantEnabled(enabled: boolean): void

// Utility
resetSettings(): void
```

### Audio Store Methods

```typescript
// Volume Getters (reads from settings)
getMusicVolume(): number
getSfxVolume(): number

// Existing Methods (unchanged)
setMuted(muted: boolean): void
toggleMuted(): void
playDrop(): void
playVanish(): void
```

### Game Integration

```typescript
// In game components
const assistantEnabled = useSettingsStore(s => s.assistantEnabled);
const dropPosition = assistantEnabled ? getDropPosition(board, current, position) : null;
```

## Troubleshooting

### Common Issues

**Settings Not Persisting**
- Check browser localStorage support
- Verify no browser storage restrictions
- Clear corrupted data and restart

**Audio Not Adjusting**
- Ensure browser allows audio playback
- Check if audio is already muted globally
- Verify no conflicting audio contexts

**Assistant Not Showing**
- Confirm setting is enabled
- Check that game is in active state
- Verify no CSS conflicts

**Performance Issues**
- Disable assistant if experiencing lag
- Check browser developer tools for errors
- Ensure adequate system resources

### Debug Information

**Settings State**
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('tetris-settings')));
```

**Current Volumes**
```javascript
// Audio debugging
console.log('Music:', useAudioStore.getState().getMusicVolume());
console.log('SFX:', useAudioStore.getState().getSfxVolume());
```

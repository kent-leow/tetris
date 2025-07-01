---
applyTo: '**'
---
# Coding Standards and Best Practices

## Project Overview
This is a modern Tetris game built with Next.js, TypeScript, and TailwindCSS. The project aims to provide both single-player and multiplayer modes with a focus on clean code and maintainable architecture.

## Code Quality Standards
### TypeScript and Type Safety
- Use TypeScript strict mode for all new files
- Define proper interfaces and types
- Avoid using 'any' type
- Use generics when appropriate
- Implement proper type guards

### Code Style
- Follow functional programming principles
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Follow SOLID principles
- Use consistent naming conventions
- Implement proper code organization
- Use functional components with hooks for React

### Documentation
- Add JSDoc comments for all public functions and interfaces
- Document complex game logic
- Keep README up to date
- Include comments for non-obvious code
- Document performance considerations
- Include examples in documentation

### State Management
- Use React hooks for local component state
- Implement proper state management patterns
- Use context for shared game state
- Avoid prop drilling by using composition
- Implement proper state immutability
- Use state machines for complex state flows

## Performance Optimization
### React Performance
- Use React.memo for expensive components
- Implement proper memoization strategies
- Optimize useEffect dependencies
- Avoid unnecessary re-renders
- Implement proper cleanup in effects
- Profile component rendering

### Game Performance
- Optimize canvas rendering
- Use requestAnimationFrame properly
- Minimize state updates during gameplay
- Use appropriate data structures
- Implement proper event handling
- Profile game loop performance

## Security Measures
### Input Validation
- Validate all user inputs
- Implement proper sanitization
- Use type-safe validation
- Implement rate limiting
- Validate game state changes

### Data Protection
- Use environment variables for sensitive data
- Implement proper CORS policies
- Follow OWASP security guidelines
- Secure local storage usage
- Implement proper authentication
- Use secure communication channels

## Error Handling
### Runtime Errors
- Use try-catch blocks strategically
- Implement proper error boundaries
- Provide user-friendly error messages
- Implement proper error recovery
- Log errors appropriately
- Handle async errors properly

### Game State Errors
- Validate game state transitions
- Implement proper error recovery
- Handle edge cases gracefully
- Implement proper state rollback
- Log game state errors
- Provide player feedback

## Accessibility Requirements
### Keyboard Navigation
- Implement proper keyboard controls
- Support game pause/resume
- Implement proper focus management
- Support keyboard shortcuts
- Handle input conflicts

### Screen Reader Support
- Use semantic HTML elements
- Add appropriate ARIA labels
- Implement proper focus order
- Provide status announcements
- Support screen reader navigation

### Visual Accessibility
- Maintain proper color contrast
- Support color blind modes
- Implement proper scaling
- Support different screen sizes
- Provide visual feedback
- Support reduced motion

## Testing Standards
### Unit Testing
- Test all utility functions
- Test game logic components
- Test state management
- Implement proper mocking
- Test error conditions

### Integration Testing
- Test component interactions
- Test game flow
- Test state transitions
- Test error handling
- Test accessibility features

### Edge Cases
- Test boundary conditions
- Test performance limits
- Test error scenarios
- Test state conflicts
- Test multiplayer scenarios

---
applyTo: '**'
---
# Testing Standards and Guidelines

## Test Types

### Unit Tests
- Test individual game logic functions
- Test utility functions
- Test state management functions
- Use Jest for testing framework

### Integration Tests
- Test game component interactions
- Test user input handling
- Test game state transitions
- Use React Testing Library

### End-to-End Tests
- Test complete game flows
- Test multiplayer interactions
- Use Cypress or Playwright

## Test Coverage
- Aim for 80% code coverage
- Focus on critical game logic
- Test edge cases and error conditions

## Test Organization
```
__tests__/
├── unit/
│   ├── game-logic.test.ts
│   └── utils.test.ts
├── integration/
│   └── game-components.test.ts
└── e2e/
    └── gameplay.test.ts
```

## Testing Best Practices
1. Follow AAA pattern (Arrange-Act-Assert)
2. Use meaningful test descriptions
3. Keep tests independent
4. Mock external dependencies
5. Use test data factories
6. Test error conditions
7. Test boundary conditions

## Performance Testing
- Test rendering performance
- Test game loop efficiency
- Test multiplayer synchronization

## Accessibility Testing
- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast

## Browser Testing
- Test on major browsers
- Test on different screen sizes
- Test on different devices

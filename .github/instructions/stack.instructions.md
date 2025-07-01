---
applyTo: '**'
---
# Technology Stack Instructions

## Frontend Technology Stack
### Core Framework
- Next.js 14+
  - App Router for routing
  - Server Components
  - Server Actions
  - Edge Runtime support
  - API Routes

### Language and Type System
- TypeScript 5.0+
  - Strict mode enabled
  - Path aliases configured
  - Type checking in build
  - Custom type definitions

### Styling Solution
- TailwindCSS
  - Custom configuration
  - Component classes
  - Responsive design
  - Dark mode support
  - Custom animations

### State Management
- Zustand
  - Type-safe stores
  - Middleware support
  - Persistent storage
  - DevTools integration

### Data Fetching
- React Query
  - Cache management
  - Optimistic updates
  - Error handling
  - Infinite queries
  - Real-time updates

### Testing Framework
- Jest
  - Unit testing
  - Integration testing
  - Custom matchers
  - Mock implementations

- React Testing Library
  - Component testing
  - Hook testing
  - User event simulation
  - Accessibility testing

### Development Tools
- ESLint
  - Custom rules
  - TypeScript support
  - React hooks rules
  - Import sorting

- Prettier
  - Custom configuration
  - Pre-commit formatting
  - Editor integration

## Backend Technology Stack
### Backend Technology Stack

- Next.js Backend (API Routes)
  - Serverless API endpoints
  - TypeScript support
  - Edge Runtime support
  - Built-in authentication
  - Custom server logic

- Local MongoDB (via Dockerfile)
  - NoSQL database
  - Local development with Docker
  - Scalable document storage
  - Mongoose/TypeScript SDK
  - Easy integration with Next.js

## Development Environment
### Required Tools
- VS Code
  - Recommended extensions
  - Custom snippets
  - Debugging configs
  - Task configurations

- Node.js
  - Version 18+ LTS
  - NPM configuration
  - Global packages

### Package Management
- npm
  - Workspace support
  - Lock file handling
  - Script running
  - Plugin system

### Git Hooks
- Husky
  - Pre-commit hooks
  - Pre-push hooks
  - Commit message validation

### Commit Standards
- commitlint
  - Conventional commits
  - Custom rules
  - Integration with Husky

## Performance Requirements
### Frontend
- Core Web Vitals targets
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### Game Engine
- Frame rate: 60 FPS
- Input latency < 16ms
- Memory usage < 100MB

### API Performance
- Response time < 200ms
- Cache hit ratio > 80%
- Error rate < 0.1%

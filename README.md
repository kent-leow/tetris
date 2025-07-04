# Tetris Game

A modern, feature-rich Tetris game built with Next.js, TypeScript, and TailwindCSS. Features both single-player and multiplayer modes with a global leaderboard system.

## Features

- 🎮 **Single Player Mode** - Classic Tetris gameplay with scoring and levels
- 👥 **Two Player Mode** - Competitive multiplayer Tetris
- 🏆 **Global Leaderboard** - MongoDB-powered high score tracking
- 🎵 **Audio System** - Background music and sound effects
- ♿ **Accessibility** - Full keyboard navigation and screen reader support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Performance Optimized** - Built for speed and reliability

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm, yarn, pnpm, or bun
- MongoDB (local or Atlas)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/kent-leow/tetris.git
   cd tetris
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start MongoDB (if running locally)**
   ```bash
   docker-compose -f docker-compose.mongodb.yml up -d
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all tests

## Architecture

### Project Structure
```
tetris/
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   │   └── game/         # Game-specific components
│   └── lib/              # Core logic and utilities
│       └── game/         # Game engine and types
├── docs/                 # Documentation
├── e2e/                  # End-to-end tests
└── public/              # Static assets
```

### Technology Stack

- **Frontend:** Next.js 14+, React 19, TypeScript 5+
- **Styling:** TailwindCSS 4
- **State Management:** Zustand
- **Database:** MongoDB with connection pooling
- **Testing:** Jest, React Testing Library, Playwright
- **Deployment:** Vercel (recommended)

## Deployment

### Deploy to Vercel (Recommended)

1. **Quick Deploy**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kent-leow/tetris)

2. **Manual Setup**
   - Connect your GitHub repository to Vercel
   - Configure environment variables (see deployment guide)
   - Deploy automatically on push to main branch

3. **Detailed Instructions**
   See [Vercel Deployment Guide](./docs/deployment/vercel-deployment-guide.md) for complete setup instructions.

### Environment Variables

Required for deployment:
```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

See `.env.example` for all configuration options.

## Game Controls

### Single Player
- **Arrow Keys** - Move and rotate pieces
- **Space** - Hard drop
- **Shift** - Hold piece
- **P** - Pause game

### Two Player
- **Player 1:** Arrow keys
- **Player 2:** WASD keys

## API Endpoints

- `GET /api/health` - System health check
- `GET /api/leaderboard` - Retrieve top scores
- `POST /api/leaderboard` - Submit new score

## Performance

The application is optimized for performance with:
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Image optimization with WebP/AVIF support
- MongoDB connection pooling for serverless
- Proper caching headers and compression

## Security

Security features include:
- CORS configuration for API routes
- Input validation and sanitization
- Security headers (CSP, X-Frame-Options, etc.)
- Environment variable protection
- Rate limiting considerations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run the full test suite:
```bash
npm run test:all
```

This includes:
- Unit tests for game logic
- Integration tests for components
- End-to-end tests for user flows
- Accessibility tests

## Documentation

- [User Stories](./docs/user-stories.md) - Feature requirements and acceptance criteria
- [Deployment Guide](./docs/deployment/vercel-deployment-guide.md) - Production deployment instructions
- [Architecture Guide](./docs/architecture.md) - System design and patterns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the excellent framework
- Vercel for deployment platform
- MongoDB for database services
- Contributors and testers

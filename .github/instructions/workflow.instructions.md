---
applyTo: '**'
---
# Development Workflow Instructions

## Git Workflow
### Branch Management
- Main branch: `main` - production-ready code
- Development branch: `dev` - integration branch
- Feature branches: `feature/*` - new features
- Bug fixes: `bugfix/*` - bug fixes
- Hotfixes: `hotfix/*` - urgent production fixes

### Commit Standards
- Use conventional commits format
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused
- Write meaningful commit messages
- Reference issues in commits

### Pull Requests
- Create descriptive PR titles
- Use PR template
- Include proper description
- Link related issues
- Include test coverage
- Update documentation
- Add screenshots if UI changes

## Code Review Process
### Pre-Review Checklist
- Run all tests locally
- Check code formatting
- Update documentation
- Verify build success
- Check for console logs
- Review for security issues

### Review Standards
- Check for security vulnerabilities
- Verify test coverage
- Review performance implications
- Ensure proper error handling
- Validate accessibility
- Check code style compliance
- Review documentation updates

### Quality Gates
- All tests passing
- No security vulnerabilities
- Code coverage maintained
- No merge conflicts
- Documentation updated
- Performance verified
- Accessibility validated

## Continuous Integration
### Build Pipeline
- Automated testing
- Code coverage reporting
- Security scanning
- Performance benchmarking
- Bundle size analysis
- Dependency auditing

### Deployment Process
- Environment-specific configs
- Automated deployments
- Rollback capability
- Feature flags
- A/B testing support
- Performance monitoring

## Development Environment
### Local Setup
- Use consistent Node.js version
- Use npm for package management
- Implement git hooks with Husky
- Use commitlint for commits
- Configure ESLint and Prettier
- Set up environment variables

### Code Quality Tools
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking
- Jest for testing
- React Testing Library
- Playwright for E2E tests

### Documentation
- Keep README updated
- Document setup process
- Include troubleshooting guide
- Document common issues
- Maintain changelog
- Document deployment process

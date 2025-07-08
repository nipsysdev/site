# Development Guide

## Setup

1. Install Node.js (v18+ recommended)
2. Install pnpm: `npm install -g pnpm`
3. Install dependencies: `pnpm install`

## Running the Project

- Development: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

## Testing

- Run tests: `pnpm test`
- Run tests with coverage: `pnpm test:coverage`
- Watch mode: `pnpm test:watch`
- Test framework: Vitest with React Testing Library
- Coverage reporting: V8 coverage provider

### Testing Requirements

- **New functionality must include tests** - Never implement new features without corresponding tests
- **Update existing tests** when modifying functionality
- **Test all edge cases** - especially for utility functions and complex logic
- **Component tests** should cover props, state changes, and user interactions
- **Utility tests** should cover all branches and error conditions
- **Integration tests** for command system and terminal interactions
- **Mock external dependencies** appropriately in tests
- **Test file organization** - keep tests in `__tests__/` directories alongside components

## Quality Assurance

- Linting: `pnpm lint` (Biome)
- Formatting: `pnpm format` (Biome)
- Git hooks: Lefthook for pre-commit checks

## Coding Conventions

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling
- Biome for formatting and linting
- Components organized by feature
- Test files located alongside components (`__tests__/` directories)
- Comprehensive test coverage for components and utilities
- Use React Testing Library for component testing
- Mock external dependencies in tests

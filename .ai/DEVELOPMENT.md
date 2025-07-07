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

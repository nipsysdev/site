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

## Deployment

### Decentralized Storage

This site is built specifically for deployment on decentralized storage networks and is currently deployed on IPFS (InterPlanetary File System). The static build output is optimized for distributed hosting without traditional server infrastructure.

### Current Deployment

- **Platform**: IPFS (InterPlanetary File System)
- **Build target**: Static export
- **Access**: Accessible via IPFS gateways or dedicated IPFS clients

### Build for Deployment

The project generates a static build suitable for IPFS deployment:

```bash
pnpm build
```

This creates an optimized static export that can be pinned to IPFS nodes for decentralized hosting.

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

# nipsys.dev

A personal portfolio website featuring a terminal emulator interface, deployed
on IPFS.

![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-green)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-orange)

## Overview

This is my personal website. The site features a novel terminal-style interface
where visitors can navigate using CLI commands rather than traditional UI
elements.

**Live Access:**

- [nipsys.eth.limo](https://nipsys.eth.limo)
- [IPNS Gateway](https://k2k4r8ng8uzrtqb5ham8kao889m8qezu96z4w3lpinyqghum43veb6n3.ipns.dweb.link/)
  (note: no proper caching, expect timeouts)

## Features

- **Terminal Interface** - Navigate the site using CLI commands (`help`,
  `whoami`, `contact`, `status`, etc.)
- **Decentralized Status** - Real-time service health monitoring via Logos
  Delivery (previously named Waku, a P2P communication network)
- **IPFS Deployment** - Hosted on IPFS with IPNS for mutable content
- **Internationalization** - Available in English and French
- **Dark/Light Theme** - System preference detection with manual toggle
- **Keyboard Navigation** - Full keyboard support with history, autocomplete,
  and shortcuts

## Tech Stack

| Category      | Technology                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org/) (App Router, Static Export)                                        |
| UI            | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)                           |
| Components    | [@nipsys/lsd](https://github.com/nipsysdev/lsd), [@phosphor-icons/react](https://phosphoricons.com/) |
| State         | [Nanostores](https://github.com/nanostores/nanostores)                                               |
| i18n          | [next-intl](https://next-intl-docs.vercel.app/)                                                      |
| Decentralized | [@waku/sdk](https://waku.org/), [@helia/verified-fetch](https://helia.io/)                           |
| Testing       | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/)                       |
| Linting       | [Biome](https://biomejs.dev/)                                                                        |
| Git Hooks     | [Lefthook](https://github.com/evilmartians/lefthook)                                                 |

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/nipsysdev/site.git
cd site

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [localhost:3000](http://localhost:3000) to view the site.

### Available Scripts

| Script               | Description                      |
| -------------------- | -------------------------------- |
| `pnpm dev`           | Start dev server with Turbopack  |
| `pnpm build`         | Production build (static export) |
| `pnpm serve`         | Serve the static output locally  |
| `pnpm test:unit`     | Run unit tests                   |
| `pnpm test:coverage` | Run tests with coverage report   |
| `pnpm lint`          | Lint codebase                    |
| `pnpm lint:fix`      | Lint and auto-fix issues         |
| `pnpm format`        | Format code                      |
| `pnpm typecheck`     | TypeScript type check            |
| `pnpm analyze`       | Build with bundle analyzer       |

## Terminal Commands

The site uses a terminal emulator interface. Available commands:

| Command      | Description                             |
| ------------ | --------------------------------------- |
| `welcome`    | Display welcome message                 |
| `whoami`     | About me - bio, badges, GPG fingerprint |
| `contact`    | Contact information and social links    |
| `status`     | Self-hosted services health status      |
| `help`       | List available commands                 |
| `clear`      | Clear terminal screen                   |
| `build-info` | Build timestamp and deployment info     |

### Keyboard Shortcuts

| Key       | Action                   |
| --------- | ------------------------ |
| `Enter`   | Execute command          |
| `Tab`     | Autocomplete             |
| `↑` / `↓` | Navigate command history |
| `Ctrl+C`  | Cancel current input     |

## Project Structure

```
site/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   └── [locale]/     # Internationalized routes (en, fr)
│   ├── components/       # React components
│   │   ├── terminal/     # Terminal emulator
│   │   ├── cmd-outputs/  # Command output components
│   │   └── layout/       # Layout components
│   ├── lib/
│   │   └── dpulse/       # Waku P2P status monitoring
│   ├── stores/           # Nanostores state
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization config
│   ├── constants/        # App constants
│   └── utils/            # Utility functions
├── out/                  # Static export output
└── .github/workflows/    # CI/CD pipelines
```

## Architecture

### Static Export

The site is built as a fully static export using Next.js's `output: 'export'`
configuration. This enables:

- IPFS/IPNS deployment
- No server-side dependencies
- Fast, cacheable content delivery

### dpulse - Decentralized Status Monitoring

The `status` command connects to the
[dpulse](https://github.com/nipsysdev/dpulse) system via the Waku P2P network:

- Real-time service health updates via filter protocol
- Historical messages via store protocol
- Ed25519 signature verification for authenticity
- IPFS-hosted service icons via Helia

## Deployment

The site is automatically deployed to IPFS via GitHub Actions:

1. On push to main: CI pipeline runs lint, tests, and build
2. Static export is published to IPNS
3. Pinned to 4EVERLand for availability

## License

[GPL-3.0-or-later](LICENSE)

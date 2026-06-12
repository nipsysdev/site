# nipsys.dev

My personal portfolio website with a terminal-style interface. Navigate using
CLI commands instead of traditional UI.

![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-green)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-orange)

**Live:** [nipsys.eth.limo](https://nipsys.eth.limo)

## What makes it unique

- **Terminal interface** — Type commands like `whoami`, `resume`, `status`,
  `contact`
- **Peer-to-peer data retrieval** — Real-time service health and recent Pixelfed
  posts fetch via Logos Delivery (A censorship resistant P2P messaging network)
- **IPFS hosted** — Deployed on IPFS with IPNS, accessible via ENS

## Commands

| Command   | What it does                           |
| --------- | -------------------------------------- |
| `welcome` | Introduction                           |
| `whoami`  | About me — bio, skills, GPG key        |
| `resume`  | View/download my CV                    |
| `contact` | Email, social links, messaging         |
| `status`  | Live health of my self-hosted services |
| `gallery` | Recent photos from Pixelfed            |
| `help`    | List all commands                      |

**Keyboard:** `Tab` for autocomplete, `↑↓` for history, `Ctrl+C` to cancel.

## Tech Stack

| Layer     | Tools                                |
| --------- | ------------------------------------ |
| Framework | Next.js 15 (static export), React 19 |
| Styling   | Tailwind CSS 4, @nipsys/lsd          |
| State     | Nanostores                           |
| i18n      | next-intl (EN/FR)                    |
| P2P       | @waku/sdk (Logos Delivery)           |
| Testing   | Vitest                               |

## Getting Started

**Requirements:** Node.js ≥22, pnpm ≥9

```bash
git clone https://github.com/nipsysdev/site.git
cd site
git submodule update --init --recursive  # Resume PDFs
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `pnpm dev`       | Development server        |
| `pnpm build`     | Production build → `out/` |
| `pnpm test:unit` | Run tests                 |
| `pnpm lint`      | Lint with Biome           |

## Architecture

```
src/
├── app/[locale]/      # Pages (en, fr)
├── components/
│   ├── terminal/      # Terminal emulator
│   └── cmd-outputs/   # Command output components
├── lib/dpulse/        # Logos Delivery integration
└── stores/            # Nanostores state
```

**dpulse** connects to [dpulse](https://github.com/nipsysdev/dpulse) via Waku
for real-time service status with Ed25519 signature verification.

## Deployment

Push to `main` triggers GitHub Actions: lint → test → build → publish to IPNS →
pin to 4EVERLand.

## License

[GPL-3.0-or-later](LICENSE)

# nipsys.dev

```
$ whoami
> another dev trying to exit the matrix
```

## what is this?

a terminal-based personal website because... well, GUIs are overrated sometimes.

built this when i got tired of the usual portfolio sites. figured if i'm gonna spend time on the web, might as well make it feel like home (aka the command line).

licensed under GPL-3.0 because that's how it should be.

**status**: work in progress. not even hosted yet, but getting there.

## why a terminal?

- terminals are timeless
- reminds me why i fell in love with computers in the first place
- plus it's kinda fun to type commands instead of clicking buttons
- you can still click around if typing isn't your thing (content stays terminal-styled)

## current state

- ✅ terminal interface works
- ✅ commands and navigation
- ✅ responsive design
- ✅ internationalization
- 🚧 content still being written
- 🚧 ipfs deployment setup
- 🚧 figuring out codex hosting
- 🚧 web3 integration features
- ❌ not live yet (soon™)

## commands

```
help     - shows available commands
whoami   - about me
contact  - how to reach me
clear    - cleans the terminal
setlang  - en/fr language toggle
```

## running locally

```bash
git clone https://github.com/nipsysdev/site.git
cd site
pnpm install  # or npm/yarn if that's your thing
pnpm dev
```

then navigate to `localhost:3000` and start typing (or clicking).

## dependencies

- **[lsd-react](https://github.com/acid-info/lsd)**
- **next.js 15**
- **react 19**
- **tailwindcss 4**
- **figlet**
- **next-intl**
- **vitest**
- **biome**

## hosting approach

planning to host this on **IPFS** for now because i haven't figured out how to deploy websites on **Codex** yet (that's the real goal).

codex looks promising for truly decentralized, economically sustainable storage. ipfs is the stepping stone.

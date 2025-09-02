# xav's site

```
$ whoami
> another dev trying to exit the matrix
```

## what is this?

A terminal looking site because... well, figured if i'm gonna build a personal site, might as well make it feel like home.

Licensed under GPL-3.0.

## status

Still a work in progress, but it already lives on the InterPlanetary FileSystem:

- IPNS Hash: `k2k4r8ng8uzrtqb5ham8kao889m8qezu96z4w3lpinyqghum43veb6n3`
- [Access through eth.limo](https://nipsys.eth.limo)
- [Access through dweb.link](https://k2k4r8ng8uzrtqb5ham8kao889m8qezu96z4w3lpinyqghum43veb6n3.ipns.dweb.link/)

## current state

- [x] terminal interface works
- [x] commands and navigation
- [x] responsive design
- [x] internationalization
- [x] automatic deployment on IPFS
- [_] content is still being written
- [_] pages are still being added & refined

## commands

```
help     - Shows available commands
whoami   - About me
contact  - How to reach me
clear    - Cleans the terminal
setlang  - En/Fr language switch
```

## running locally

```bash
git clone https://github.com/nipsysdev/site.git
cd site
pnpm install
pnpm dev
```

Then navigate to `localhost:3000` and start typing (or clicking).

## dependencies

- **[lsd-react](https://github.com/acid-info/lsd)**
- **next.js 15**
- **next-intl**
- **react 19**
- **react-icons**
- **tailwindcss 4**

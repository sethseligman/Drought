# The Drought

Live championship drought tracker built with React + Vite, optimized for sportsbook-style wall displays.

## Stack

- React 18+ (running on current React release)
- Vite
- Tailwind CSS v3
- Framer Motion
- React Router hash routing
- Static JSON data files

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy static

Deploy the `dist/` output to Vercel, Netlify, or GitHub Pages.

## Features

- Live global clock with shared 1s ticker context
- Drought-sorted animated mosaic
- Detail panel with history and relative drought bar
- Search overlay across all leagues
- Wall mode (`?wall=true` or press `W`) with league auto-cycling and ticker

## Data

- Tier 1 leagues are populated in `src/data` (NFL, MLB, NBA, NHL, WNBA, MLS)
- Tiers 2-7 are scaffolded with schema-complete stubs for easy future expansion

# Chaos's Catacombs

A dark-romance book blog built with Next.js. Browse reviews publicly; log in to publish new ones rated out of **6 stars**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

- **Username:** `chaos`
- **Password:** `catacombs`

## Pages

| Route | What it does |
| --- | --- |
| `/` | Banner, latest 5 reviews, sidebar (search, categories, follow), currently reading, favorites, about |
| `/reviews` | Every review, filterable by search query (`?q=`) and category (`?category=`) |
| `/reviews/[id]` | Full review with rating, category tags and publish date |
| `/reviews/new` | Publish form — login required |
| `/about` | About page |
| `/login` | Login |

## What you can do when logged in

- Publish a review with title, author, categories, a 1–6 star rating and review text
- Toggle any review as a favorite (the heart on each card) — favorites feed the "My Favorites" shelf
- Update the "Currently Reading" book, its progress bar and note

## Data

Everything is stored in `data/store.json`, which is seeded automatically on first run. Delete the file to reset back to the seed content.

## Theme

- Banner: `public/banner.jpg`
- Colors and fonts are defined as CSS variables in `src/app/globals.css` (black background, dusty rose accents, Cinzel / Cormorant Garamond / Great Vibes)
"# chaoscatacoumbs" 

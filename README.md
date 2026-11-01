# Chaos's Catacombs

A dark-romance book blog built with Next.js. Browse reviews publicly; log in to publish new ones rated out of **6 stars**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Login

There is one account. The password is never stored in the repo. `AUTH_PEPPER` is a server secret mixed into the password before it is hashed with scrypt, and `AUTH_PASSWORD_HASH` is that hash. A login creates a random session, stored as a hash in `data/sessions.json` locally and in the Blob store as `sessions.json` on Vercel. The browser only receives the raw session token in an httpOnly cookie named `cc_session`. Old `chaos_session` cookies are ignored.

Create or rotate the password (this writes `.env.local` and removes any plaintext `AUTH_PASSWORD`):

```bash
npm run auth:hash
```

Set the same `AUTH_PEPPER`, `AUTH_PASSWORD_HASH`, and `AUTH_USERNAME` values in the Vercel project, then redeploy. Changing the pepper requires hashing the password again. To sign every session out, delete the session store:

```bash
npm run auth:revoke
npm run auth:revoke:blob
```

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

Reviews and the "Currently Reading" entry live in a single JSON document.

Locally it is always `data/store.json`, seeded automatically on first run. Delete the file to reset back to the seed content. Local development never touches the deployed data, even with Blob credentials present.

On Vercel the filesystem is read-only, so the same document is stored in [Vercel Blob](https://vercel.com/docs/vercel-blob) as `store.json`. Create a Blob store with **private** access, connect it to the project, and redeploy — the app authenticates with the `BLOB_STORE_ID` and OIDC token Vercel injects. Deploying without a Blob store connected fails every read and write with a clear error.

To copy your local data into the Blob store instead of starting from the seed:

```bash
vercel env pull .env.blob   # kept out of .env.local so `next dev` stays local
npm run seed:blob           # add --force to overwrite an existing store.json
```

## Theme

- Banner: `public/banner.jpg`
- Colors and fonts are defined as CSS variables in `src/app/globals.css` (black background, dusty rose accents, Cinzel / Cormorant Garamond / Great Vibes)
"# chaoscatacoumbs" 

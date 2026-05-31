# MovieRadar

MovieRadar is a simple modern Next.js app for browsing upcoming United States theatrical movies using real TMDB data. It supports filtering by genre and month, title search, pagination, and movie detail pages.

## Features

- Upcoming theatrical movies from TMDB
- Server-side API routes so the TMDB key is never exposed to the browser
- Poster and backdrop images from TMDB image URLs
- Genre and month filters
- Search by movie title
- Detail pages with overview, release date, runtime, cast, rating, language, and trailer embed/link when available
- Responsive dark cinema-style UI
- Loading, empty, and error states
- Load more pagination

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- TMDB API

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
TMDB_API_KEY=your_api_key_here
```

Get your API key from your TMDB account settings, then run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying With GitHub and Vercel

1. Push this project to a GitHub repository.
2. In Vercel, create a new project and import the GitHub repository.
3. Keep the framework preset as Next.js.
4. Add this environment variable in Vercel project settings:

```bash
TMDB_API_KEY=your_real_tmdb_api_key
```

5. Deploy the project.

Do not commit `.env.local`. It is ignored by Git and should only be used on your machine. Use `.env.example` as the template for required environment variables.

## Project Structure

```text
app/
  api/
    movie/[id]/route.ts
    movies/route.ts
  movie/[id]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  MovieCard.tsx
  MovieFilters.tsx
  SearchBar.tsx
lib/
  tmdb.ts
types/
  movie.ts
```

## Environment Notes

Only `TMDB_API_KEY` is used. It is read in `lib/tmdb.ts` from server-side code and is not prefixed with `NEXT_PUBLIC_`, so it is not shipped to the client.

The checked-in `.env.local` contains a placeholder value. Replace it locally with your real key before running the app.

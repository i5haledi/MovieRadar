import Image from "next/image";
import { imageUrl } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

type MovieCardProps = {
  movie: Movie;
};

function daysUntilRelease(value: string) {
  if (!value) {
    return "TBA";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const releaseDate = new Date(`${value}T00:00:00`);
  const days = Math.ceil((releaseDate.getTime() - today.getTime()) / 86_400_000);

  if (days <= 0) {
    return "Today";
  }

  return `${days} day${days === 1 ? "" : "s"}`;
}

function formatDate(value: string) {
  if (!value) {
    return "TBA";
  }

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function letterboxdUrl(title: string) {
  return `https://letterboxd.com/search/films/${encodeURIComponent(title)}/`;
}

function letterboxdSearchUrl(value: string) {
  return `https://letterboxd.com/search/${encodeURIComponent(value)}/`;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const poster = imageUrl(movie.posterPath, "w500");
  const countdown = daysUntilRelease(movie.releaseDate);

  return (
    <article
      title={movie.title}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 transition duration-300 hover:-translate-y-1 hover:border-red-400/55 hover:bg-zinc-900/90"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">Poster unavailable</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <a
            href={letterboxdUrl(movie.title)}
            aria-label={`Find ${movie.title} on Letterboxd`}
            target="_blank"
            rel="noreferrer"
            className="block text-sm font-bold leading-snug text-white transition hover:text-red-300"
          >
            {movie.title}
          </a>
          <p className="mt-1 text-xs font-bold text-amber-200">{countdown === "Today" ? "Today" : `${countdown} left`}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{formatDate(movie.releaseDate)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300">
              {genre}
            </span>
          ))}
        </div>

        {movie.director ? (
          <a
            href={letterboxdSearchUrl(movie.director)}
            aria-label={`Find ${movie.director} on Letterboxd`}
            target="_blank"
            rel="noreferrer"
            className="mt-auto text-xs text-zinc-500 transition hover:text-red-300"
          >
            Dir. {movie.director}
          </a>
        ) : (
          <p className="mt-auto text-xs text-zinc-500">Director TBA</p>
        )}
      </div>
    </article>
  );
}

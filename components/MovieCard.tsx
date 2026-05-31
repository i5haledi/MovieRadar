import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

type MovieCardProps = {
  movie: Movie;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  if (!value) {
    return "Date TBA";
  }

  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export default function MovieCard({ movie }: MovieCardProps) {
  const poster = imageUrl(movie.posterPath, "w500");

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/72 transition duration-300 hover:-translate-y-1 hover:border-red-400/55 hover:bg-zinc-900/90"
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
        <div className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-amber-200 backdrop-blur">
          {movie.rating ? movie.rating.toFixed(1) : "NR"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">{formatDate(movie.releaseDate)}</p>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-white">{movie.title}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 3).map((genre) => (
            <span key={genre} className="rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-300">
              {genre}
            </span>
          ))}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-zinc-400">{movie.overview || "No overview is available yet."}</p>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
          <span>{movie.originalLanguage}</span>
          <span>Details</span>
        </div>
      </div>
    </Link>
  );
}


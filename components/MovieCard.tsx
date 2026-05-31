import Image from "next/image";
import Link from "next/link";
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

export default function MovieCard({ movie }: MovieCardProps) {
  const poster = imageUrl(movie.posterPath, "w500");
  const countdown = daysUntilRelease(movie.releaseDate);

  return (
    <Link
      href={`/movie/${movie.id}`}
      aria-label={`View details for ${movie.title}`}
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
        <div className="absolute inset-x-2 bottom-2 rounded-md bg-black/75 px-2.5 py-2 text-center text-xs font-bold uppercase tracking-normal text-white shadow-lg shadow-black/30 backdrop-blur">
          {countdown === "Today" ? "Today" : `${countdown} left`}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

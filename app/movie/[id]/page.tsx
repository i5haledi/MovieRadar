import Image from "next/image";
import Link from "next/link";
import { getMovieDetails, imageUrl } from "@/lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  if (!value) {
    return "Date TBA";
  }

  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatRuntime(minutes: number | null) {
  if (!minutes) {
    return "Runtime TBA";
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours ? `${hours}h ${remaining}m` : `${remaining}m`;
}

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

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieDetails(id);
  const backdrop = imageUrl(movie.backdropPath, "original");
  const poster = imageUrl(movie.posterPath, "w780");
  const trailerUrl = movie.trailer ? `https://www.youtube.com/watch?v=${movie.trailer.key}` : null;
  const countdown = daysUntilRelease(movie.releaseDate);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-[70vh] overflow-hidden">
        {backdrop ? (
          <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-42" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/35" />

        <div className="relative mx-auto grid min-h-[70vh] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr] lg:items-end lg:px-8">
          <div className="pt-16 lg:pt-0">
            <Link href="/" className="mb-6 inline-flex rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/15">
              Back to movies
            </Link>
            <div className="relative aspect-[2/3] max-w-[18rem] overflow-hidden rounded-lg bg-zinc-900 poster-shadow">
              {poster ? (
                <Image src={poster} alt={`${movie.title} poster`} fill priority sizes="18rem" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">Poster unavailable</div>
              )}
            </div>
          </div>

          <div className="pb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-300">{formatDate(movie.releaseDate)}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-normal sm:text-6xl">{movie.title}</h1>
            {movie.tagline ? <p className="mt-4 max-w-2xl text-lg italic text-zinc-300">{movie.tagline}</p> : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre} className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm text-zinc-200">
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500">Rating</span>
                <strong className="mt-1 block text-xl text-white">{movie.rating ? movie.rating.toFixed(1) : "NR"}</strong>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500">Runtime</span>
                <strong className="mt-1 block text-xl text-white">{formatRuntime(movie.runtime)}</strong>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500">Language</span>
                <strong className="mt-1 block text-xl uppercase text-white">{movie.originalLanguage}</strong>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500">Status</span>
                <strong className="mt-1 block text-xl text-white">{movie.status || "TBA"}</strong>
              </div>
              <div className="rounded-lg border border-red-400/25 bg-red-500/15 p-4">
                <span className="block text-xs uppercase tracking-[0.18em] text-red-200/75">Countdown</span>
                <strong className="mt-1 block text-xl text-white">{countdown}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">{movie.overview || "No overview is available yet."}</p>

          <h2 className="mt-10 text-2xl font-semibold">Cast</h2>
          {movie.cast.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {movie.cast.map((member) => (
                <div key={member.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{member.character || "Role TBA"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Cast is not available yet.</p>
          )}
        </div>

        <aside>
          <h2 className="text-2xl font-semibold">Trailer</h2>
          {movie.trailer ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
              <iframe
                title={movie.trailer.name}
                src={`https://www.youtube.com/embed/${movie.trailer.key}`}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <a href={trailerUrl ?? "#"} target="_blank" rel="noreferrer" className="block border-t border-white/10 p-4 text-sm font-semibold text-red-300 transition hover:text-red-200">
                Open on YouTube
              </a>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-zinc-400">
              No trailer is available yet.
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

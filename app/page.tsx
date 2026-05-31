"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MovieCard from "@/components/MovieCard";
import MovieFilters, { type FilterState } from "@/components/MovieFilters";
import SearchBar from "@/components/SearchBar";
import type { Genre, Movie, MoviesResponse } from "@/types/movie";

const initialFilters: FilterState = {
  genre: "",
  month: "",
};

type ApiState = {
  movies: Movie[];
  genres: Genre[];
  page: number;
  totalPages: number;
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [importantOnly, setImportantOnly] = useState(false);
  const [data, setData] = useState<ApiState>({ movies: [], genres: [], page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams({
      page: "1",
    });

    if (filters.genre) searchParams.set("genre", filters.genre);
    if (filters.month) searchParams.set("month", filters.month);
    if (debouncedQuery) searchParams.set("query", debouncedQuery);
    if (importantOnly) searchParams.set("importantOnly", "true");

    return searchParams;
  }, [debouncedQuery, filters, importantOnly]);

  const fetchMovies = useCallback(async (page: number, append = false) => {
    const searchParams = new URLSearchParams(params);
    searchParams.set("page", String(page));

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      const response = await fetch(`/api/movies?${searchParams.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to load movies.");
      }

      const movieData = payload as MoviesResponse;
      setData((current) => ({
        movies: append ? [...current.movies, ...movieData.results] : movieData.results,
        genres: movieData.genres,
        page: movieData.page,
        totalPages: movieData.totalPages,
      }));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Something went wrong.");
      if (!append) {
        setData((current) => ({ ...current, movies: [] }));
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchMovies(1);
  }, [fetchMovies]);

  const hasMore = data.page < data.totalPages;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-7 py-10 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300">MovieRadar</p>
          <h1 className="mt-4 text-5xl font-bold tracking-normal text-white sm:text-7xl">What Next</h1>
        </div>

        <div className="w-full rounded-lg border border-white/10 bg-black/35 p-4">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <section className="border-y border-white/10 py-5">
        <MovieFilters filters={filters} genres={data.genres} onChange={setFilters} />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setImportantOnly((current) => !current)}
            aria-label={importantOnly ? "Show all movies" : "Hide unimportant movies"}
            title={importantOnly ? "Show all movies" : "Hide unimportant movies"}
            className={`flex size-10 items-center justify-center rounded-lg border transition ${
              importantOnly
                ? "border-zinc-500/60 bg-zinc-700/70 text-zinc-100 hover:bg-zinc-600"
                : "border-white/10 bg-white/[0.05] text-zinc-500 hover:border-zinc-500/60 hover:bg-white/[0.08] hover:text-zinc-200"
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              {importantOnly ? null : <path d="m4 4 16 16" />}
            </svg>
          </button>
        </div>
      </section>

      {error ? (
        <section className="mt-10 rounded-lg border border-red-500/25 bg-red-950/25 p-6 text-red-100">
          <h2 className="text-lg font-semibold">Unable to load movies</h2>
          <p className="mt-2 text-sm text-red-100/80">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && data.movies.length === 0 ? (
        <section className="my-12 rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">No matching releases found</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Try a different month, genre, or search term.
          </p>
        </section>
      ) : null}

      {!isLoading && data.movies.length > 0 ? (
        <>
          <section className="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {data.movies.map((movie) => (
              <MovieCard key={`${movie.id}-${movie.releaseDate}`} movie={movie} />
            ))}
          </section>

          {hasMore ? (
            <div className="mb-14 flex justify-center">
              <button
                type="button"
                onClick={() => void fetchMovies(data.page + 1, true)}
                disabled={isLoadingMore}
                className="rounded-lg border border-red-300/30 bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-70"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

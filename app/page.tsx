"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MovieCard from "@/components/MovieCard";
import MovieFilters, { type FilterState } from "@/components/MovieFilters";
import SearchBar from "@/components/SearchBar";
import type { Genre, Movie, MoviesResponse } from "@/types/movie";

const initialFilters: FilterState = {
  region: "SA",
  genre: "",
  month: "",
  language: "",
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
      region: filters.region,
      page: "1",
    });

    if (filters.genre) searchParams.set("genre", filters.genre);
    if (filters.month) searchParams.set("month", filters.month);
    if (filters.language) searchParams.set("language", filters.language);
    if (debouncedQuery) searchParams.set("query", debouncedQuery);

    return searchParams;
  }, [debouncedQuery, filters]);

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
      <header className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300">MovieRadar</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Upcoming movies in theaters
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Browse coming cinema releases by region, genre, month, and language. Default region is Saudi Arabia.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/35 p-4">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <section className="border-y border-white/10 py-5">
        <MovieFilters filters={filters} genres={data.genres} onChange={setFilters} />
      </section>

      {error ? (
        <section className="mt-10 rounded-lg border border-red-500/25 bg-red-950/25 p-6 text-red-100">
          <h2 className="text-lg font-semibold">Unable to load movies</h2>
          <p className="mt-2 text-sm text-red-100/80">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[34rem] animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && data.movies.length === 0 ? (
        <section className="my-12 rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">No matching releases found</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Try a different month, region, genre, language, or search term.
          </p>
        </section>
      ) : null}

      {!isLoading && data.movies.length > 0 ? (
        <>
          <section className="grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
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

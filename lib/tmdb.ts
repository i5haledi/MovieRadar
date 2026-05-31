import type { Genre, Movie, MoviesResponse } from "@/types/movie";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  vote_average?: number;
  original_language?: string;
  origin_country?: string[];
  tagline?: string;
  status?: string;
};

type TmdbListResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbMovie[];
};

type TmdbCreditsResponse = {
  crew: Array<{
    id: number;
    name: string;
    job?: string;
  }>;
};

const today = () => new Date().toISOString().slice(0, 10);

const oneYearFromToday = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

function getApiKey() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("TMDB_API_KEY is not configured. Add your key to .env.local.");
  }

  return apiKey;
}

async function tmdbFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = response.status === 401 ? "TMDB rejected the API key." : `TMDB request failed with ${response.status}.`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function imageUrl(path: string | null, size = "w500") {
  return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
}

export async function getMovieGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", { language: "en-US" });
  return data.genres;
}

function mapMovie(movie: TmdbMovie, genreMap: Map<number, string>): Movie {
  const genreIds = movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [];

  return {
    id: movie.id,
    title: movie.title ?? movie.original_title ?? "Untitled",
    originalTitle: movie.original_title ?? movie.title ?? "Untitled",
    overview: movie.overview ?? "",
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date ?? "",
    genres: movie.genres?.map((genre) => genre.name) ?? genreIds.map((id) => genreMap.get(id)).filter(Boolean) as string[],
    genreIds,
    rating: Number((movie.vote_average ?? 0).toFixed(1)),
    originalLanguage: movie.original_language ?? "unknown",
    originalCountries: movie.origin_country ?? [],
    director: null,
  };
}

function isIndianMovie(movie: Movie) {
  return movie.originalLanguage === "hi" || movie.originalCountries.includes("IN");
}

function isEnglishMovie(movie: Movie) {
  return movie.originalLanguage === "en";
}

function compareByReleaseDate(first: Movie, second: Movie) {
  if (!first.releaseDate) {
    return 1;
  }

  if (!second.releaseDate) {
    return -1;
  }

  return first.releaseDate.localeCompare(second.releaseDate);
}

async function getMovieDirector(id: number) {
  const credits = await tmdbFetch<TmdbCreditsResponse>(`/movie/${id}/credits`, { language: "en-US" });
  return credits.crew.find((member) => member.job === "Director")?.name ?? null;
}

async function addDirectors(movies: Movie[]) {
  const directors = await Promise.all(
    movies.map(async (movie) => ({
      id: movie.id,
      director: await getMovieDirector(movie.id),
    })),
  );
  const directorMap = new Map(directors.map((item) => [item.id, item.director]));

  return movies.map((movie) => ({
    ...movie,
    director: directorMap.get(movie.id) ?? null,
  }));
}

function monthRange(month: string) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function getUpcomingMovies({
  region = "US",
  genre,
  month,
  query,
  page = "1",
}: {
  region?: string;
  genre?: string;
  month?: string;
  query?: string;
  page?: string;
}): Promise<MoviesResponse> {
  const genres = await getMovieGenres();
  const genreMap = new Map(genres.map((item) => [item.id, item.name]));
  const selectedMonth = month ? monthRange(month) : null;
  const pageNumber = Number(page) || 1;

  const commonParams = {
    language: "en-US",
    page: pageNumber,
    region,
  };

  const data = query
    ? await tmdbFetch<TmdbListResponse>("/search/movie", {
        ...commonParams,
        query,
        include_adult: "false",
        primary_release_year: selectedMonth?.start.slice(0, 4),
      })
    : await tmdbFetch<TmdbListResponse>("/discover/movie", {
        ...commonParams,
        sort_by: "primary_release_date.asc",
        include_adult: "false",
        include_video: "false",
        with_release_type: "2|3",
        "release_date.gte": selectedMonth?.start ?? today(),
        "release_date.lte": selectedMonth?.end ?? oneYearFromToday(),
        with_genres: genre,
        with_original_language: "en",
      });

  let results = data.results
    .map((movie) => mapMovie(movie, genreMap))
    .filter((movie) => isEnglishMovie(movie) && !isIndianMovie(movie))
    .sort(compareByReleaseDate);

  if (query) {
    const range = selectedMonth;
    const minDate = today();
    results = results.filter((movie) => {
      const matchesGenre = !genre || movie.genreIds.includes(Number(genre));
      const matchesMonth = !range || (movie.releaseDate >= range.start && movie.releaseDate <= range.end);
      const isUpcoming = !movie.releaseDate || movie.releaseDate >= minDate;
      return matchesGenre && matchesMonth && isUpcoming;
    });
  }

  results = await addDirectors(results);

  return {
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
    results,
    genres,
  };
}

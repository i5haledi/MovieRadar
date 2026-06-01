import type { Genre, Movie, MoviesResponse } from "@/types/movie";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const EXCLUDED_NON_FILM_GENRE_IDS = [99, 10402, 10770];
const MIN_MAINSTREAM_POPULARITY = 1;
const MOST_ANTICIPATED_POPULARITY = 8;
const APP_PAGE_SIZE = 20;
const DISCOVER_SCAN_PAGES = 20;
const IMPORTANT_DIRECTORS = new Set([
  "Christopher Nolan",
  "Denis Villeneuve",
  "Greta Gerwig",
  "Jordan Peele",
  "Quentin Tarantino",
  "Martin Scorsese",
  "Steven Spielberg",
  "James Cameron",
  "Ryan Coogler",
  "Ari Aster",
  "Robert Eggers",
  "Bong Joon Ho",
  "Guillermo del Toro",
  "Patty Jenkins",
  "Chloé Zhao",
  "Rian Johnson",
  "Matt Reeves",
  "Sam Raimi",
  "Edgar Wright",
  "Wes Anderson",
]);
const TOP_HOLLYWOOD_STARS = new Set([
  "Tom Cruise",
  "Leonardo DiCaprio",
  "Dwayne Johnson",
  "Zendaya",
  "Timothée Chalamet",
  "Ryan Gosling",
  "Margot Robbie",
  "Florence Pugh",
  "Anya Taylor-Joy",
  "Robert Pattinson",
  "Austin Butler",
  "Pedro Pascal",
  "Jenna Ortega",
  "Sydney Sweeney",
  "Scarlett Johansson",
  "Chris Hemsworth",
  "Chris Evans",
  "Ryan Reynolds",
  "Hugh Jackman",
  "Brad Pitt",
  "George Clooney",
  "Jennifer Lawrence",
  "Emma Stone",
  "Tom Holland",
  "Will Smith",
  "Keanu Reeves",
  "Jason Momoa",
  "Vin Diesel",
  "Joaquin Phoenix",
  "Lady Gaga",
]);
const FRANCHISE_KEYWORDS = [
  "avengers",
  "batman",
  "captain america",
  "dc",
  "dune",
  "fast",
  "ghostbusters",
  "godzilla",
  "harry potter",
  "hunger games",
  "jurassic",
  "lord of the rings",
  "marvel",
  "mission: impossible",
  "predator",
  "scream",
  "spider-man",
  "star trek",
  "star wars",
  "superman",
  "teenage mutant ninja turtles",
  "transformers",
  "x-men",
];

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
  popularity?: number;
  original_language?: string;
  origin_country?: string[];
  tagline?: string;
  status?: string;
};

type TmdbMovieDetails = {
  belongs_to_collection: {
    id: number;
    name: string;
  } | null;
  production_companies?: Array<{
    id: number;
    name: string;
  }>;
};

type TmdbListResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbMovie[];
};

type TmdbCreditsResponse = {
  cast: Array<{
    id: number;
    name: string;
  }>;
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
    popularity: movie.popularity ?? 0,
    originalLanguage: movie.original_language ?? "unknown",
    originalCountries: movie.origin_country ?? [],
    director: null,
    topCast: [],
    collectionName: null,
    importanceReasons: [],
  };
}

function isIndianMovie(movie: Movie) {
  return movie.originalLanguage === "hi" || movie.originalCountries.includes("IN");
}

function isEnglishMovie(movie: Movie) {
  return movie.originalLanguage === "en";
}

function isNarrativeFilm(movie: Movie) {
  return !movie.genreIds.some((genreId) => EXCLUDED_NON_FILM_GENRE_IDS.includes(genreId));
}

function isHollywoodRelease(movie: Movie) {
  return movie.popularity >= MIN_MAINSTREAM_POPULARITY && Boolean(movie.posterPath);
}

function isFuturePrimaryRelease(movie: Movie) {
  return Boolean(movie.releaseDate) && movie.releaseDate >= today();
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

function hasFranchiseSignal(movie: Movie) {
  const searchable = `${movie.title} ${movie.originalTitle} ${movie.overview}`.toLowerCase();
  return Boolean(movie.collectionName) || FRANCHISE_KEYWORDS.some((keyword) => searchable.includes(keyword));
}

function getImportanceReasons(movie: Movie) {
  const reasons: string[] = [];

  if (movie.director && IMPORTANT_DIRECTORS.has(movie.director)) {
    reasons.push("notable director");
  }

  if (hasFranchiseSignal(movie)) {
    reasons.push("IP/franchise");
  }

  if (movie.popularity >= MOST_ANTICIPATED_POPULARITY) {
    reasons.push("public anticipation");
  }

  if (movie.topCast.some((actor) => TOP_HOLLYWOOD_STARS.has(actor))) {
    reasons.push("top star");
  }

  return reasons;
}

async function enrichForImportance(movies: Movie[]) {
  return Promise.all(
    movies.map(async (movie) => {
      const [credits, details] = await Promise.all([
        tmdbFetch<TmdbCreditsResponse>(`/movie/${movie.id}/credits`, { language: "en-US" }),
        tmdbFetch<TmdbMovieDetails>(`/movie/${movie.id}`, { language: "en-US" }),
      ]);
      const enrichedMovie = {
        ...movie,
        director: credits.crew.find((member) => member.job === "Director")?.name ?? null,
        topCast: credits.cast.slice(0, 8).map((member) => member.name),
        collectionName: details.belongs_to_collection?.name ?? null,
      };

      return {
        ...enrichedMovie,
        importanceReasons: getImportanceReasons(enrichedMovie),
      };
    }),
  );
}

async function filterByStudioFromDetails(movies: Movie[], studio: string) {
  const studioId = Number(studio);

  if (!studioId) {
    return movies;
  }

  const matches = await Promise.all(
    movies.map(async (movie) => {
      const details = await tmdbFetch<TmdbMovieDetails>(`/movie/${movie.id}`, { language: "en-US" });
      return {
        movie,
        matchesStudio: details.production_companies?.some((company) => company.id === studioId) ?? false,
      };
    }),
  );

  return matches.filter((item) => item.matchesStudio).map((item) => item.movie);
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
  studio,
  query,
  importantOnly = false,
  page = "1",
}: {
  region?: string;
  genre?: string;
  month?: string;
  studio?: string;
  query?: string;
  importantOnly?: boolean;
  page?: string;
}): Promise<MoviesResponse> {
  const genres = await getMovieGenres();
  const genreMap = new Map(genres.map((item) => [item.id, item.name]));
  const selectedMonth = month ? monthRange(month) : null;
  const pageNumber = Number(page) || 1;

  const commonParams = {
    language: "en-US",
    region,
  };

  const data = query
    ? await tmdbFetch<TmdbListResponse>("/search/movie", {
        ...commonParams,
        page: pageNumber,
        query,
        include_adult: "false",
        primary_release_year: selectedMonth?.start.slice(0, 4),
      })
    : null;

  const rawResults = data
    ? data.results
    : (
        await Promise.all(
          Array.from({ length: DISCOVER_SCAN_PAGES }, (_, index) =>
            tmdbFetch<TmdbListResponse>("/discover/movie", {
              ...commonParams,
              page: index + 1,
              sort_by: "primary_release_date.asc",
              include_adult: "false",
              include_video: "false",
              with_release_type: "3",
              "primary_release_date.gte": selectedMonth?.start ?? today(),
              "primary_release_date.lte": selectedMonth?.end ?? oneYearFromToday(),
              with_genres: genre,
              with_companies: studio,
              without_genres: EXCLUDED_NON_FILM_GENRE_IDS.join(","),
              with_original_language: "en",
              with_origin_country: "US",
            }),
          ),
        )
      ).flatMap((response) => response.results);

  let results = rawResults
    .map((movie) => mapMovie(movie, genreMap))
    .filter(
      (movie) =>
        isEnglishMovie(movie) &&
        !isIndianMovie(movie) &&
        isNarrativeFilm(movie) &&
        isHollywoodRelease(movie) &&
        isFuturePrimaryRelease(movie),
    )
    .sort(compareByReleaseDate);

  if (query) {
    const range = selectedMonth;
    results = results.filter((movie) => {
      const matchesGenre = !genre || movie.genreIds.includes(Number(genre));
      const matchesMonth = !range || (movie.releaseDate >= range.start && movie.releaseDate <= range.end);
      return matchesGenre && matchesMonth;
    });

    if (studio) {
      results = await filterByStudioFromDetails(results, studio);
    }
  }

  if (importantOnly) {
    results = (await enrichForImportance(results)).filter((movie) => movie.importanceReasons.length > 0);
  }

  const totalResults = results.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / APP_PAGE_SIZE));
  const paginatedResults = results.slice((pageNumber - 1) * APP_PAGE_SIZE, pageNumber * APP_PAGE_SIZE);
  const resultsWithDirectors = importantOnly ? paginatedResults : await addDirectors(paginatedResults);

  return {
    page: pageNumber,
    totalPages,
    totalResults,
    results: resultsWithDirectors,
    genres,
  };
}

export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  genres: string[];
  genreIds: number[];
  rating: number;
  popularity: number;
  originalLanguage: string;
  originalCountries: string[];
  director: string | null;
  topCast: string[];
  collectionName: string | null;
  importanceReasons: string[];
};

export type MoviesResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Movie[];
  genres: Genre[];
};

export type MovieFilters = {
  genre?: string;
  month?: string;
  studio?: string;
  query?: string;
  importantOnly?: string;
  page?: string;
};

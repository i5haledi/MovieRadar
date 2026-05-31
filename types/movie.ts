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
  originalLanguage: string;
  originalCountries: string[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};

export type Trailer = {
  id: string;
  name: string;
  key: string;
  site: string;
  type: string;
};

export type MovieDetails = Movie & {
  runtime: number | null;
  tagline: string;
  status: string;
  cast: CastMember[];
  trailer: Trailer | null;
};

export type MoviesResponse = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Movie[];
  genres: Genre[];
};

export type MovieFilters = {
  region?: string;
  genre?: string;
  month?: string;
  language?: string;
  query?: string;
  page?: string;
};

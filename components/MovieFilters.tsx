"use client";

import type { Genre } from "@/types/movie";

export type FilterState = {
  region: string;
  genre: string;
  month: string;
  language: string;
};

type MovieFiltersProps = {
  filters: FilterState;
  genres: Genre[];
  onChange: (filters: FilterState) => void;
};

const regions = [
  { value: "US", label: "United States" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "IN", label: "India" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
];

const languages = [
  { value: "", label: "Any language" },
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "es", label: "Spanish" },
];

function nextMonths() {
  const formatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + index);

    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: formatter.format(date),
    };
  });
}

export default function MovieFilters({ filters, genres, onChange }: MovieFiltersProps) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Region</span>
        <select
          value={filters.region}
          onChange={(event) => update("region", event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-red-400/70"
        >
          {regions.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Genre</span>
        <select
          value={filters.genre}
          onChange={(event) => update("genre", event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-red-400/70"
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Month</span>
        <select
          value={filters.month}
          onChange={(event) => update("month", event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-red-400/70"
        >
          <option value="">Next 12 months</option>
          {nextMonths().map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Language</span>
        <select
          value={filters.language}
          onChange={(event) => update("language", event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-red-400/70"
        >
          {languages.map((language) => (
            <option key={language.value || "any"} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

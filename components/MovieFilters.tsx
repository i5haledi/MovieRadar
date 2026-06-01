"use client";

import type { Genre } from "@/types/movie";

export type FilterState = {
  genre: string;
  month: string;
  studio: string;
};

type MovieFiltersProps = {
  filters: FilterState;
  genres: Genre[];
  onChange: (filters: FilterState) => void;
};

const studios = [
  { value: "", label: "All studios" },
  { value: "2", label: "Disney" },
  { value: "174", label: "Warner Bros." },
  { value: "33", label: "Universal" },
  { value: "4", label: "Paramount" },
  { value: "5", label: "Columbia" },
  { value: "34", label: "Sony" },
  { value: "127928", label: "20th Century" },
  { value: "420", label: "Marvel" },
  { value: "184898", label: "DC Studios" },
  { value: "21", label: "MGM" },
  { value: "1632", label: "Lionsgate" },
  { value: "41077", label: "A24" },
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
    <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
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
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Studio</span>
        <select
          value={filters.studio}
          onChange={(event) => update("studio", event.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-red-400/70"
        >
          {studios.map((studio) => (
            <option key={studio.value || "all"} value={studio.value}>
              {studio.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

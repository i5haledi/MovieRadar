"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="block w-full">
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Find a coming release..."
          className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-400/70 focus:bg-white/[0.09]"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </label>
  );
}

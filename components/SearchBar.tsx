"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Search title</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Find a coming release..."
        className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-400/70 focus:bg-white/[0.09]"
      />
    </label>
  );
}


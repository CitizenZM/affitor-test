"use client";

import { useState, useCallback } from "react";

type Program = {
  slug: string;
  name: string;
  url: string;
  category: string;
  shortDescription: string;
  commission: {
    type: string;
    rate: string;
  };
  cookieDays: number;
  stars: number;
  verified: boolean;
  signupUrl: string;
};

type ApiResponse = {
  programs: Program[];
  total?: number;
};

const SORT_OPTIONS = [
  { value: "top", label: "Top" },
  { value: "newest", label: "Newest" },
  { value: "commission", label: "Commission" },
];

export default function Home() {
  const [query, setQuery] = useState("AI writing");
  const [sort, setSort] = useState("top");
  const [limit, setLimit] = useState(10);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://openaffiliate.dev/api/programs?q=${encodeURIComponent(
        query
      )}&sort=${sort}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: ApiResponse = await res.json();
      setPrograms(data.programs ?? []);
      setHasSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, sort, limit]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Affitor Test
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
            OpenAffiliate Program Search
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Live search against the{" "}
            <a
              className="underline underline-offset-2"
              href="https://openaffiliate.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              openaffiliate.dev
            </a>{" "}
            registry (450+ affiliate programs), maintained by{" "}
            <a
              className="underline underline-offset-2"
              href="https://github.com/Affitor"
              target="_blank"
              rel="noopener noreferrer"
            >
              Affitor
            </a>
            .
          </p>
        </header>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs, e.g. 'AI writing'"
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                Limit: {n}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-8">
          {hasSearched && !loading && programs.length === 0 && !error && (
            <p className="text-sm text-zinc-500">No programs matched.</p>
          )}

          {programs.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Commission</th>
                    <th className="px-4 py-2">Cookie</th>
                    <th className="px-4 py-2">Stars</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr
                      key={p.slug}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-black dark:text-zinc-50">
                          {p.name}
                          {p.verified && (
                            <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="max-w-xs truncate text-xs text-zinc-500">
                          {p.shortDescription}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.commission?.rate}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.cookieDays}d
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.stars}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={p.signupUrl || p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium underline underline-offset-2"
                        >
                          Signup ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Equivalent CLI call:{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">
            curl &quot;https://openaffiliate.dev/api/programs?q={encodeURIComponent(query)}&sort={sort}&limit={limit}&quot;
          </code>
        </footer>
      </main>
    </div>
  );
}

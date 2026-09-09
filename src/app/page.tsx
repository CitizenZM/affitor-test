"use client";

import { useState, useCallback, useEffect } from "react";

type Program = {
  slug: string;
  name: string;
  url: string;
  category: string;
  shortDescription: string;
  commission: { type: string; rate: string | number };
  cookieDays: number;
  stars: number;
  verified: boolean;
  signupUrl?: string;
};

type Candidate = {
  id: string;
  slug: string;
  name: string;
  url: string | null;
  category: string | null;
  commission_type: string | null;
  commission_rate: string | null;
  cookie_days: number | null;
  stars: number | null;
  verified: boolean;
  signup_url: string | null;
  short_description: string | null;
  status: string;
  created_at: string;
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
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    setCandidatesLoading(true);
    setCandidatesError(null);
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load candidates");
      setCandidates(data.candidates ?? []);
    } catch (e) {
      setCandidatesError(e instanceof Error ? e.message : "Failed to load candidates");
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query, sort, limit: String(limit) });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Search failed (${res.status})`);
      setPrograms(data.programs ?? []);
      setHasSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, sort, limit]);

  const addCandidate = useCallback(
    async (p: Program) => {
      setSavingSlug(p.slug);
      try {
        const res = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to save");
        await loadCandidates();
      } catch (e) {
        setCandidatesError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setSavingSlug(null);
      }
    },
    [loadCandidates]
  );

  const removeCandidate = useCallback(
    async (id: string) => {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      try {
        const res = await fetch(`/api/candidates?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to remove");
        }
      } catch (e) {
        setCandidatesError(e instanceof Error ? e.message : "Failed to remove");
        loadCandidates();
      }
    },
    [loadCandidates]
  );

  const savedSlugs = new Set(candidates.map((c) => c.slug));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Affitor Test
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
            OpenAffiliate Program Search
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Live search against the{" "}
            <a className="underline underline-offset-2" href="https://openaffiliate.dev" target="_blank" rel="noopener noreferrer">
              openaffiliate.dev
            </a>{" "}
            registry via the official{" "}
            <a className="underline underline-offset-2" href="https://npm.im/openaffiliate-sdk" target="_blank" rel="noopener noreferrer">
              openaffiliate-sdk
            </a>
            . Save candidates to a Supabase-backed shortlist and export as CSV.
          </p>
        </header>

        {/* Search */}
        <section>
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

          <div className="mt-6">
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
                    {programs.map((p) => {
                      const saved = savedSlugs.has(p.slug);
                      return (
                        <tr key={p.slug} className="border-t border-zinc-200 dark:border-zinc-800">
                          <td className="px-4 py-3">
                            <div className="font-medium text-black dark:text-zinc-50">
                              {p.name}
                              {p.verified && (
                                <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">✓</span>
                              )}
                            </div>
                            <div className="max-w-xs truncate text-xs text-zinc-500">{p.shortDescription}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.category}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.commission?.rate}</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.cookieDays}d</td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.stars}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => addCandidate(p)}
                              disabled={saved || savingSlug === p.slug}
                              className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                            >
                              {saved ? "Saved ✓" : savingSlug === p.slug ? "Saving…" : "+ Add"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Candidate library */}
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                Candidate library
              </h2>
              <p className="text-xs text-zinc-500">
                Stored in Supabase (project adstream-ai, table{" "}
                <code className="rounded bg-black/[.06] px-1 py-0.5 font-mono dark:bg-white/[.08]">
                  oa_candidates
                </code>
                )
              </p>
            </div>
            <a
              href="/api/candidates/export"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Export CSV
            </a>
          </div>

          {candidatesError && (
            <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {candidatesError}
            </p>
          )}

          {candidatesLoading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No candidates saved yet. Search above and click &quot;+ Add&quot;.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Commission</th>
                    <th className="px-4 py-2">Cookie</th>
                    <th className="px-4 py-2">Saved</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-4 py-3">
                        <div className="font-medium text-black dark:text-zinc-50">
                          {c.name}
                          {c.verified && (
                            <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">✓</span>
                          )}
                        </div>
                        <div className="max-w-xs truncate text-xs text-zinc-500">
                          {c.short_description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.category}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.commission_rate}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.cookie_days}d</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={c.signup_url ?? c.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-3 text-xs font-medium underline underline-offset-2"
                        >
                          Signup ↗
                        </a>
                        <button
                          onClick={() => removeCandidate(c.id)}
                          className="text-xs font-medium text-red-600 underline underline-offset-2 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          <p>
            CLI (search): <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">npx openaffiliate search &quot;{query}&quot;</code>
          </p>
          <p className="mt-1">
            MCP (Claude Code): tools <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">search_programs</code> /{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">get_program</code> /{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">list_categories</code> via{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">openaffiliate-mcp</code>
          </p>
        </footer>
      </main>
    </div>
  );
}

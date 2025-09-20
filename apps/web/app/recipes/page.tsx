"use client"

// app/recipes/page.tsx — list view with search & filters (uses local proxy /api/recipes)

import { useEffect, useMemo, useState } from "react"

type RecipeListItem = {
  id: string
  title: string
  slug: string
  minutes: number | null
  kcal: number | null
  tags: string[]
}

type ListResponse = {
  total: number
  skip: number
  take: number
  items: RecipeListItem[]
}

export default function RecipesPage() {
  const [q, setQ] = useState("")
  const [tag, setTag] = useState("")
  const [maxKcal, setMaxKcal] = useState<string>("")
  const [maxMinutes, setMaxMinutes] = useState<string>("")
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set("take", "50")
    params.set("skip", "0")
    if (q.trim()) params.set("q", q.trim())
    if (tag.trim()) params.set("tag", tag.trim())
    if (maxKcal.trim()) params.set("maxKcal", maxKcal.trim())
    if (maxMinutes.trim()) params.set("maxMinutes", maxMinutes.trim())
    return params.toString()
  }, [q, tag, maxKcal, maxMinutes])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/recipes?${queryString}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to load recipes: ${res.status}`)
      const json = (await res.json()) as ListResponse
      setData(json)
    } catch (e: any) {
      setError(e?.message || "Unknown error")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // initial load

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBlock: 0, fontSize: 28 }}>NourishIQ — Recipes</h1>
      <p style={{ marginTop: 8, color: "#444" }}>
        Using local proxy at <code>/api/recipes</code>
      </p>

      {/* Controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          fetchData()
        }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 16,
          padding: 12,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff"
        }}
      >
        <div>
          <label style={{ fontSize: 12, color: "#555" }}>Search (title or tag)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g., vegan, pesto"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#555" }}>Tag (exact)</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., vegetarian"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#555" }}>Max kcal</label>
          <input
            value={maxKcal}
            onChange={(e) => setMaxKcal(e.target.value)}
            placeholder="e.g., 450"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#555" }}>Max minutes</label>
          <input
            value={maxMinutes}
            onChange={(e) => setMaxMinutes(e.target.value)}
            placeholder="e.g., 20"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>

        <div style={{ alignSelf: "end" }}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: "#111827",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            {loading ? "Loading…" : "Apply"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: "#ffeaea", color: "#900", border: "1px solid #f5c2c7"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Meta */}
      {!error && data && (
        <div style={{ marginTop: 16, color: "#555" }}>
          Total: <strong>{data.total}</strong>
        </div>
      )}

      {/* List */}
      {!error && data && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16
        }}>
          {data.items.map((r) => (
            <a
              key={r.id}
              href={`/recipes/${r.slug}`}
              style={{
                textDecoration: "none",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, color: "#111" }}>{r.title}</h2>
              <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                {r.minutes ? `${r.minutes} min` : "—"} · {r.kcal ? `${r.kcal} kcal` : "—"}
              </div>
              {!!r.tags?.length && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: 12, background: "#f3f4f6", color: "#374151",
                      padding: "4px 8px", borderRadius: 999
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  outline: "none"
}

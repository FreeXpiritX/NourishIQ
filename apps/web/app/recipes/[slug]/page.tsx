// app/recipes/[slug]/page.tsx — recipe detail via local proxy /api/recipes/[slug]

type Recipe = {
  id: string
  title: string
  slug: string
  minutes: number | null
  ingredients: string[]
  steps: string[]
  tags: string[]
  kcal: number | null
  macros: { protein?: number | null, carbs?: number | null, fat?: number | null } | null
  costTier: string | null
}

async function fetchRecipe(slug: string): Promise<Recipe | null> {
  // relative to Next server; works in dev without CORS issues
  const res = await fetch(`/api/recipes/${slug}`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
  return res.json()
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  let recipe: Recipe | null = null
  let error: string | null = null

  try {
    recipe = await fetchRecipe(params.slug)
  } catch (e: any) {
    error = e?.message || "Unknown error"
  }

  if (error) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <p><a href="/recipes">← Back to recipes</a></p>
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#ffeaea", color: "#900", border: "1px solid #f5c2c7" }}>
          <strong>Error:</strong> {error}
        </div>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <h1>Recipe not found</h1>
        <p><a href="/recipes">← Back to recipes</a></p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth: 800 }}>
      <p><a href="/recipes">← Back to recipes</a></p>
      <h1 style={{ marginBlock: 0 }}>{recipe.title}</h1>
      <div style={{ marginTop: 6, color: "#666" }}>
        {recipe.minutes ? `${recipe.minutes} min` : "—"} · {recipe.kcal ? `${recipe.kcal} kcal` : "—"} · {recipe.costTier ?? "—"}
      </div>

      {!!recipe.tags?.length && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {recipe.tags.map((t) => (
            <span key={t} style={{ fontSize: 12, background: "#f3f4f6", color: "#374151", padding: "4px 8px", borderRadius: 999 }}>
              {t}
            </span>
          ))}
        </div>
      )}

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Steps</h2>
        <ol>
          {recipe.steps.map((s, idx) => <li key={idx} style={{ marginBottom: 6 }}>{s}</li>)}
        </ol>
      </section>

      {recipe.macros && (
        <section style={{ marginTop: 18 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Macros</h2>
          <div>Protein: {recipe.macros.protein ?? "—"} g</div>
          <div>Carbs: {recipe.macros.carbs ?? "—"} g</div>
          <div>Fat: {recipe.macros.fat ?? "—"} g</div>
        </section>
      )}
    </main>
  )
}

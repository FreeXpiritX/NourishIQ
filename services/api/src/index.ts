import "dotenv/config"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { PrismaClient, Prisma } from "@prisma/client"

console.log("[API] booting…")

const app = express()
const prisma = new PrismaClient()

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "nourishiq-api" })
})

app.get("/api/recipes", async (req, res) => {
  try {
    const take = Math.min(Math.max(Number(req.query.take ?? 20), 1), 100)
    const skip = Math.max(Number(req.query.skip ?? 0), 0)

    const qRaw = (req.query.q ?? "").toString().trim()
    const tagRaw = (req.query.tag ?? "").toString().trim()
    const maxKcal = req.query.maxKcal !== undefined ? Number(req.query.maxKcal) : undefined
    const maxMinutes = req.query.maxMinutes !== undefined ? Number(req.query.maxMinutes) : undefined

    const where: Prisma.RecipeWhereInput = {}
    if (qRaw) where.OR = [{ title: { contains: qRaw, mode: "insensitive" } }, { tags: { has: qRaw.toLowerCase() } }]
    if (tagRaw) where.tags = { has: tagRaw }
    if (typeof maxKcal === "number" && !Number.isNaN(maxKcal)) where.kcal = { lte: maxKcal }
    if (typeof maxMinutes === "number" && !Number.isNaN(maxMinutes)) where.minutes = { lte: maxMinutes }

    const [items, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: { id: true, title: true, slug: true, minutes: true, kcal: true, tags: true }
      }),
      prisma.recipe.count({ where })
    ])

    res.json({ total, skip, take, items })
  } catch (err: any) {
    console.error("[GET /api/recipes] error:", err?.message || err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/recipes/:slug", async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { slug: req.params.slug } })
    if (!recipe) return res.status(404).json({ error: "Recipe not found" })
    res.json(recipe)
  } catch (err: any) {
    console.error("[GET /api/recipes/:slug] error:", err?.message || err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/recipes", async (req, res) => {
  try {
    const b = req.body ?? {}
    const title = b.title ? String(b.title) : ""
    const slug = b.slug ? String(b.slug) : ""
    if (!title || !slug) return res.status(400).json({ error: "title and slug are required" })

    const minutes = b.minutes == null ? null : Number(b.minutes)
    const ingredients: string[] = Array.isArray(b.ingredients) ? b.ingredients.map((x: any) => String(x)) : []
    const steps: string[] = Array.isArray(b.steps) ? b.steps.map((x: any) => String(x)) : []
    const tags: string[] = Array.isArray(b.tags) ? b.tags.map((x: any) => String(x).toLowerCase()) : []
    const kcal = b.kcal == null ? null : Number(b.kcal)
    const macros: any = b.macros && typeof b.macros === "object" ? b.macros : null
    const costTier = b.costTier == null ? null : String(b.costTier)

    const created = await prisma.recipe.create({
      data: { title, slug, minutes, ingredients, steps, tags, kcal, macros, costTier }
    })
    res.status(201).json(created)
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ error: "slug already exists" })
    console.error("[POST /api/recipes] error:", err?.message || err)
    res.status(500).json({ error: "Internal server error" })
  }
})

const PORT = Number(process.env.PORT || 8083)
const HOST = process.env.HOST || "0.0.0.0"

app.listen(PORT, HOST, () => {
  console.log(`[API] listening on ${HOST}:${PORT}`)
})

// prisma/seed.ts — loads .env and seeds one CSV row

import "dotenv/config"              // <-- loads .env at runtime
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

function toArr(s?: string) {
  return s ? s.split("|").map(x => x.trim()).filter(Boolean) : []
}

async function main() {
  const csvPath = path.join(process.cwd(), "prisma", "seed", "recipes.csv")
  const rawFile = fs.readFileSync(csvPath, "utf8").trim()
  if (!rawFile) {
    console.log("No rows in CSV.")
    return
  }

  const lines = rawFile.split("\n")
  const header = lines.shift()!.split(",").map(h => h.trim())

  let okCount = 0
  let failCount = 0

  for (const line of lines) {
    if (!line.trim()) continue
    const values = line.split(",").map(v => v.trim())
    const row: Record<string, string> = {}
    header.forEach((h, i) => (row[h] = values[i] ?? ""))

    try {
      if (!row.slug || !row.title) throw new Error("Missing slug/title")

      const ingredients = toArr(row.ingredients)
      const steps = toArr(row.steps)
      const tags = toArr(row.tags)

      await prisma.recipe.upsert({
        where: { slug: row.slug },
        update: {
          title: row.title,
          minutes: row.minutes ? Number(row.minutes) : null,
          ingredients: { set: ingredients }, // Postgres text[] requires { set } on update
          steps: { set: steps },
          tags: { set: tags },
          kcal: row.kcal ? Number(row.kcal) : null,
          macros: {
            protein: row.protein ? Number(row.protein) : null,
            carbs: row.carbs ? Number(row.carbs) : null,
            fat: row.fat ? Number(row.fat) : null,
          } as any,
          costTier: row.cost_tier || null,
        },
        create: {
          title: row.title,
          slug: row.slug,
          minutes: row.minutes ? Number(row.minutes) : null,
          ingredients,
          steps,
          tags,
          kcal: row.kcal ? Number(row.kcal) : null,
          macros: {
            protein: row.protein ? Number(row.protein) : null,
            carbs: row.carbs ? Number(row.carbs) : null,
            fat: row.fat ? Number(row.fat) : null,
          } as any,
          costTier: row.cost_tier || null,
        },
      })

      okCount++
    } catch (e: any) {
      failCount++
      console.error("Row failed:", row)
      console.error("Error name:", e?.name)
      console.error("Error message:", e?.message)
      if (e?.meta) console.error("Meta:", JSON.stringify(e.meta, null, 2))
      if (e?.cause) console.error("Cause:", e.cause)
    }
  }

  console.log(`✅ Done. Upserts OK: ${okCount}, Failed: ${failCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() =>

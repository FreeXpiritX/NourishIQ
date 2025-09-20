// prisma/seed.mjs — ESM, no tsx/esbuild needed
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function toArr(s) {
  return s ? s.split("|").map(x => x.trim()).filter(Boolean) : [];
}

async function main() {
  const csvPath = path.join(process.cwd(), "prisma", "seed", "recipes.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found at:", csvPath);
    process.exit(1);
  }

  const rawFile = fs.readFileSync(csvPath, "utf8").trim();
  if (!rawFile) {
    console.log("No rows in CSV.");
    return;
  }

  const lines = rawFile.split("\n");
  const header = lines.shift().split(",").map(h => h.trim());

  let okCount = 0, failCount = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const values = line.split(",").map(v => v.trim());
    const row = {};
    header.forEach((h, i) => (row[h] = values[i] ?? ""));

    try {
      if (!row.slug || !row.title) throw new Error("Missing slug/title");

      const ingredients = toArr(row.ingredients);
      const steps = toArr(row.steps);
      const tags = toArr(row.tags);

      await prisma.recipe.upsert({
        where: { slug: row.slug },
        update: {
          title: row.title,
          minutes: row.minutes ? Number(row.minutes) : null,
          ingredients: { set: ingredients }, // scalar list update
          steps: { set: steps },
          tags: { set: tags },
          kcal: row.kcal ? Number(row.kcal) : null,
          macros: {
            protein: row.protein ? Number(row.protein) : null,
            carbs: row.carbs ? Number(row.carbs) : null,
            fat: row.fat ? Number(row.fat) : null,
          },
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
          },
          costTier: row.cost_tier || null,
        },
      });

      okCount++;
    } catch (e) {
      failCount++;
      console.error("Row failed:", row);
      console.error("Error:", e?.message || e);
    }
  }

  console.log(`✅ Done. Upserts OK: ${okCount}, Failed: ${failCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

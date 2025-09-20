import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const honeyData = JSON.parse(
    fs.readFileSync('data/evidence/honey.json', 'utf-8')
  )

  await prisma.encyclopaedia.upsert({
    where: { id: honeyData.id },
    update: honeyData,
    create: honeyData,
  })

  console.log('Honey evidence added to DB')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

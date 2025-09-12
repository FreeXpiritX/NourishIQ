import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const email = `founder+${Date.now()}@nourishiq.org`;
  const user = await prisma.user.create({ data: { email } });
  console.log("Created user:", user);
}
main().catch(console.error).finally(()=>process.exit());

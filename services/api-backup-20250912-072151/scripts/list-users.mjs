import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log("Recent users:", users);
}
main().catch(console.error).finally(()=>process.exit());

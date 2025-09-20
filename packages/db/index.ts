import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

// Utility for graceful shutdown
export async function disconnect(){
  await prisma.$disconnect();
}

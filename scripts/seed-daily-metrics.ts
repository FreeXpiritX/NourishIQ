import prisma from '../packages/db';

async function main(){
  const today = new Date();
  today.setHours(0,0,0,0);
  await prisma.dailyMetrics.create({
    data: { userId: null, day: today, sleepHours: 7.2, steps: 9000, hydration: 2.0 }
  });
  console.log('Seeded daily metrics');
}

main().finally(()=>prisma.$disconnect());

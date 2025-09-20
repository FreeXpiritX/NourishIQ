import prisma from '../index';

describe('DB Smoke Test', ()=>{
  it('connects and queries', async ()=>{
    const rows = await prisma.$queryRaw`SELECT 1+1 as result`;
    expect(rows).toBeTruthy();
  });
});

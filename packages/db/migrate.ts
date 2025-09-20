import { execSync } from 'child_process';

export function migrateDeploy(){
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
}

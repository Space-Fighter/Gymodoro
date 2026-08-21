import bcrypt from 'bcrypt';
import { prisma } from './lib/prisma.js';

async function main() {
  const email = 'claude-qa-test@example.com';
  const password = await bcrypt.hash('TestPass123!', 10);
  await prisma.user.upsert({
    where: { email },
    update: { password, emailVerified: true },
    create: { name: 'Claude QA', email, password, emailVerified: true },
  });
  console.log('seeded', email);
  await prisma.$disconnect();
}
main();

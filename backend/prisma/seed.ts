import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  const users = [
    {
      name: 'Carlos Solicitante',
      email: 'solicitante@kingspan.com',
      role: Role.REQUESTER,
    },
    {
      name: 'Ana Aprovadora',
      email: 'aprovador@kingspan.com',
      role: Role.APPROVER,
    },
    {
      name: 'Pedro Sênior',
      email: 'senior@kingspan.com',
      role: Role.APPROVER_SENIOR,
    },
    {
      name: 'Marina Admin',
      email: 'admin@kingspan.com',
      role: Role.ADMIN,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hash,
        role: u.role,
      },
    });
  }

  console.log('Seed concluído. Usuários criados:');
  console.log('solicitante@kingspan.com — senha: 123456 — role: REQUESTER');
  console.log('aprovador@kingspan.com   — senha: 123456 — role: APPROVER');
  console.log('senior@kingspan.com      — senha: 123456 — role: APPROVER_SENIOR');
  console.log('admin@kingspan.com       — senha: 123456 — role: ADMIN');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
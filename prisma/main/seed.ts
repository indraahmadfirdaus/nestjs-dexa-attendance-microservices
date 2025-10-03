import { PrismaClient } from '@prisma/client-main';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'Admin User',
      position: 'Administrator',
      phone: '+6281234567890',
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin.email);

  const employees = [
    {
      email: 'john.doe@company.com',
      name: 'John Doe',
      position: 'Frontend Developer',
      phone: '+6281234567891',
    },
    {
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      position: 'Backend Developer',
      phone: '+6281234567892',
    },
    {
      email: 'bob.johnson@company.com',
      name: 'Bob Johnson',
      position: 'Fullstack Developer',
      phone: '+6281234567893',
    },
  ];

  for (const emp of employees) {
    const employee = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });
    console.log('Employee created:', employee.email);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
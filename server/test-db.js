const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const student = await prisma.enrollment.findFirst();
    console.log('Student sample:', student);
  } catch (error) {
    console.error('Error fetching student:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

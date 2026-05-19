const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function migratePasswords() {
  console.log('--- AURA SECURITY: Starting Password Migration to Bcrypt ---');
  
  try {
    const students = await prisma.enrollment.findMany({
      where: {
        password: { not: null }
      }
    });

    console.log(`Found ${students.length} accounts with passwords.`);
    
    let updatedCount = 0;
    let skippedCount = 0;

    for (const student of students) {
      // Check if already hashed (bcrypt hashes start with '$2b$' or '$2a$')
      if (student.password.startsWith('$2b$') || student.password.startsWith('$2a$')) {
        skippedCount++;
        continue;
      }

      console.log(`Hashing password for student ID ${student.id} (${student.email})...`);
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(student.password, salt);

      await prisma.enrollment.update({
        where: { id: student.id },
        data: { password: hashedPassword }
      });
      
      updatedCount++;
    }

    console.log('----------------------------------------------------');
    console.log('Migration Complete.');
    console.log(`Total Updated: ${updatedCount}`);
    console.log(`Total Skipped (already hashed): ${skippedCount}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePasswords();

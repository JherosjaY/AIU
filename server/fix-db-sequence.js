const { PrismaClient } = require('@prisma/client');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const prisma = new PrismaClient();

async function fixSequence() {
  try {
    console.log('--- AURA: Institutional Registry Audit ---');
    
    // 1. Update the bloated ID 26 to 7
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "CourseQuota" SET id = 7 WHERE id = 26`
    );
    console.log(`Update result: ${result} record(s) modified.`);

    // 2. Reset the sequence to continue from the last valid ID
    // We get the max ID and set the sequence to that
    const maxIdResult = await prisma.$queryRawUnsafe(
      `SELECT max(id) FROM "CourseQuota"`
    );
    const maxId = maxIdResult[0].max || 0;
    
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"CourseQuota"', 'id'), ${maxId})`
    );
    
    console.log(`Institutional sequence recalibrated to: ${maxId}`);
    process.exit(0);
  } catch (error) {
    console.error('Audit Failure:', error);
    process.exit(1);
  }
}

fixSequence();

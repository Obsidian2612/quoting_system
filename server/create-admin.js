#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main(){
  const prisma = new PrismaClient();
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'changeme';

  if(!password || password.length < 6){
    console.error('ADMIN_PASS must be provided and at least 6 characters');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if(existing){
    console.log(`Admin user "${username}" already exists (id=${existing.id}).`);
    await prisma.$disconnect();
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { username, passwordHash: hash } });
  console.log('Created admin:', { id: admin.id, username: admin.username });
  await prisma.$disconnect();
}

main().catch(e=>{ console.error(e); process.exit(1); });

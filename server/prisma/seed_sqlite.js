import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main(){
  await prisma.student.upsert({ where: { roll: '01' }, update: { contact: '0300-1111111', gender: 'female', classGrade: 'One', address: 'Local City', dob: new Date('2018-01-01'), enrollmentDate: new Date('2024-08-01') }, create: { name: 'Local Alice', roll: '01', contact: '0300-1111111', gender: 'female', classGrade: 'One', address: 'Local City', admissionFees: 5000, monthlyFees: 300, dob: new Date('2018-01-01'), enrollmentDate: new Date('2024-08-01') } })
  await prisma.student.upsert({ where: { roll: '02' }, update: { contact: '0300-2222222', gender: 'male', classGrade: 'Two', address: 'Local City', dob: new Date('2017-05-05'), enrollmentDate: new Date('2024-08-01') }, create: { name: 'Local Bob', roll: '02', contact: '0300-2222222', gender: 'male', classGrade: 'Two', address: 'Local City', admissionFees: 5000, monthlyFees: 300, dob: new Date('2017-05-05'), enrollmentDate: new Date('2024-08-01') } })
  const existingStaff = await prisma.staff.findFirst({ where: { name: 'Local Mrs. Ahmed' } })
  if(!existingStaff) await prisma.staff.create({ data: { name: 'Local Mrs. Ahmed', role: 'Teacher' } })

  // create default user
  const passwordHash = bcrypt.hashSync('123', 10)
  await prisma.user.upsert({ where: { username: 'rehan' }, update: {}, create: { username: 'rehan', password: passwordHash } })

  console.log('Seed completed (sqlite)')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

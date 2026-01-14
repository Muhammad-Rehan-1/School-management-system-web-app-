const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main(){
  await prisma.student.create({ data: { name: 'Ali Khan', roll: '01', admissionFees: 5000, monthlyFees: 300 } })
  await prisma.student.create({ data: { name: 'Sara Noor', roll: '02', admissionFees: 5000, monthlyFees: 300 } })
  await prisma.staff.create({ data: { name: 'Mrs. Ahmed', role: 'Teacher' } })
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

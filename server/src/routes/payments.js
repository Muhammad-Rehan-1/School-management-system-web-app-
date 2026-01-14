import express from 'express'

export default function(prisma){
  const router = express.Router()

  // Create a payment for a student
  router.post('/:studentId', async (req, res) => {
    try{
      const { amount, method, note } = req.body
      const s = await prisma.student.findUnique({ where: { id: req.params.studentId } })
      if(!s) return res.status(404).json({ error: 'student not found' })
      const p = await prisma.payment.create({ data: { studentId: req.params.studentId, amount: Number(amount), method, note } })
      res.json(p)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  router.get('/:studentId', async (req, res) => {
    const payments = await prisma.payment.findMany({ where: { studentId: req.params.studentId } })
    res.json(payments)
  })

  return router
}
import express from 'express'
import multer from 'multer'
import path from 'path'

export default function(prisma){
  const router = express.Router()
  const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads/' })

  router.get('/', async (req, res) => {
    const students = await prisma.student.findMany({ include: { payments: true } })
    // fetch related uploads and attach to each student
    const uploads = await prisma.upload.findMany({ where: { ownerType: 'student', ownerId: { in: students.map(s => s.id) } } })
    const uploadsByOwner = uploads.reduce((acc, u) => { acc[u.ownerId] = acc[u.ownerId] || []; acc[u.ownerId].push(u); return acc }, {})
    const result = students.map(s => ({ ...s, uploads: uploadsByOwner[s.id] || [] }))
    res.json(result)
  })

  router.get('/:id', async (req, res) => {
    const s = await prisma.student.findUnique({ where: { id: req.params.id }, include: { payments: true } })
    if(!s) return res.status(404).json({ error: 'not found' })
    const uploads = await prisma.upload.findMany({ where: { ownerType: 'student', ownerId: s.id } })
    s.uploads = uploads
    res.json(s)
  })

  router.post('/', upload.single('bForm'), async (req, res) => {
    try{
      const data = req.body
      if(req.file){
        const url = `/uploads/${req.file.filename}`
        data.bformUrl = url
        // save upload record
        await prisma.upload.create({ data: { ownerType: 'student', ownerId: 'temp', url, filename: req.file.originalname, mime: req.file.mimetype, size: req.file.size } })
      }
      const student = await prisma.student.create({ data: {
        name: data.name || 'Unknown',
        roll: data.roll || undefined,
        dob: data.dob ? new Date(data.dob) : undefined,
        admissionFees: Number(data.admissionFees || 0),
        monthlyFees: Number(data.monthlyFees || 0),
        bformUrl: data.bformUrl
      }})

      // update the upload ownerId if we created one
      if(req.file){
        await prisma.upload.updateMany({ where: { url: data.bformUrl }, data: { ownerId: student.id } })
      }

      res.json(student)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  router.put('/:id', async (req, res) => {
    const patch = req.body
    try{
      const s = await prisma.student.update({ where: { id: req.params.id }, data: patch })
      res.json(s)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  // delete a student and related records
  router.delete('/:id', async (req, res) => {
    const id = req.params.id
    try{
      await prisma.payment.deleteMany({ where: { studentId: id } })
      await prisma.upload.deleteMany({ where: { ownerType: 'student', ownerId: id } })
      const s = await prisma.student.delete({ where: { id } })
      res.json({ ok: true, student: s })
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  return router
}

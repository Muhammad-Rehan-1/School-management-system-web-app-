import express from 'express'
import multer from 'multer'

export default function(prisma){
  const router = express.Router()
  const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads/' })

  router.get('/', async (req, res) => {
    const staff = await prisma.staff.findMany()
    const uploads = await prisma.upload.findMany({ where: { ownerType: 'staff', ownerId: { in: staff.map(s => s.id) } } })
    const uploadsByOwner = uploads.reduce((acc, u) => { acc[u.ownerId] = acc[u.ownerId] || []; acc[u.ownerId].push(u); return acc }, {})
    const result = staff.map(s => ({ ...s, uploads: uploadsByOwner[s.id] || [] }))
    res.json(result)
  })

  router.post('/', upload.single('cnic'), async (req, res) => {
    try{
      const data = req.body
      if(req.file){
        const url = `/uploads/${req.file.filename}`
        data.cnicUrl = url
        await prisma.upload.create({ data: { ownerType: 'staff', ownerId: 'temp', url, filename: req.file.originalname, mime: req.file.mimetype, size: req.file.size } })
      }
      const s = await prisma.staff.create({ data: { name: data.name || 'Unknown', role: data.role || undefined, cnicUrl: data.cnicUrl } })
      if(req.file){ await prisma.upload.updateMany({ where: { url: data.cnicUrl }, data: { ownerId: s.id } }) }
      res.json(s)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  router.put('/:id', async (req, res) => {
    try{
      const s = await prisma.staff.update({ where: { id: req.params.id }, data: req.body })
      res.json(s)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  // delete staff and related uploads
  router.delete('/:id', async (req, res) => {
    const id = req.params.id
    try{
      await prisma.upload.deleteMany({ where: { ownerType: 'staff', ownerId: id } })
      const s = await prisma.staff.delete({ where: { id } })
      res.json({ ok: true, staff: s })
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  return router
}

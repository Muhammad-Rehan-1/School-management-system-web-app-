import express from 'express'
import multer from 'multer'

export default function(prisma){
  const router = express.Router()
  const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads/' })

  router.post('/', upload.single('file'), async (req, res) => {
    try{
      if(!req.file) return res.status(400).json({ error: 'no file' })
      const url = `/uploads/${req.file.filename}`
      const u = await prisma.upload.create({ data: { ownerType: req.body.ownerType || 'generic', ownerId: req.body.ownerId || '', url, filename: req.file.originalname, mime: req.file.mimetype, size: req.file.size } })
      res.json(u)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  return router
}
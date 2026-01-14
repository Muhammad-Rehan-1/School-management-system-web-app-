import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default function(prisma){
  const router = express.Router()

  // POST /auth/login -> { username, password }
  router.post('/login', async (req, res) => {
    try{
      const { username, password } = req.body
      if(!username || !password) return res.status(400).json({ error: 'username and password required' })

      const user = await prisma.user.findUnique({ where: { username } })
      if(!user) return res.status(401).json({ error: 'invalid credentials' })

      const ok = bcrypt.compareSync(password, user.password)
      if(!ok) return res.status(401).json({ error: 'invalid credentials' })

      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
      res.json({ token })
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  // GET /auth/me -> return current user info (requires Bearer token)
  router.get('/me', async (req, res) => {
    try{
      const auth = req.headers.authorization
      if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
      const token = auth.slice('Bearer '.length)
      let payload
      try{ payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') }catch(e){ return res.status(401).json({ error: 'invalid token' }) }
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if(!user) return res.status(404).json({ error: 'user not found' })
      const { password, ...u } = user
      res.json(u)
    }catch(err){ console.error(err); res.status(500).json({ error: err.message }) }
  })

  return router
}

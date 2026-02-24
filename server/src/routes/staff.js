import express from 'express';
import multer from 'multer';

export default function createStaffRouter(prisma) {
  const router = express.Router();
  const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads/' });

  /**
   * GET /api/staff - Fetch all staff members with uploads
   */
  router.get('/', async (req, res) => {
    try {
      const staff = await prisma.staff.findMany();

      const staffIds = staff.map(s => s.id);
      const uploads = await prisma.upload.findMany({
        where: { ownerType: 'staff', ownerId: { in: staffIds } }
      });

      const uploadsByOwner = uploads.reduce((acc, u) => {
        if (!acc[u.ownerId]) acc[u.ownerId] = [];
        acc[u.ownerId].push(u);
        return acc;
      }, {});

      const result = staff.map(s => ({
        ...s,
        uploads: uploadsByOwner[s.id] || []
      }));

      res.json(result);
    } catch (err) {
      console.error('Error fetching staff:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/staff - Create a new staff member
   */
  router.post('/', upload.single('cnic'), async (req, res) => {
    try {
      const data = req.body;

      // Handle CNIC file upload if present
      if (req.file) {
        const url = `/uploads/${req.file.filename}`;
        data.cnicUrl = url;
        await prisma.upload.create({
          data: {
            ownerType: 'staff',
            ownerId: 'temp',
            url,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            size: req.file.size
          }
        });
      }

      // Create staff record
      const staff = await prisma.staff.create({
        data: {
          name: data.name || 'Unknown',
          role: data.role || undefined,
          cnicUrl: data.cnicUrl
        }
      });

      // Update upload record with actual staff ID
      if (req.file) {
        await prisma.upload.updateMany({
          where: { url: data.cnicUrl },
          data: { ownerId: staff.id }
        });
      }

      res.json(staff);
    } catch (err) {
      console.error('Error creating staff member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/staff/:id - Update a staff member
   */
  router.put('/:id', async (req, res) => {
    try {
      const staff = await prisma.staff.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(staff);
    } catch (err) {
      console.error('Error updating staff member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * DELETE /api/staff/:id - Delete a staff member and related uploads
   */
  router.delete('/:id', async (req, res) => {
    const staffId = req.params.id;
    try {
      // Delete related uploads
      await prisma.upload.deleteMany({
        where: { ownerType: 'staff', ownerId: staffId }
      });

      // Delete staff member
      const staff = await prisma.staff.delete({ where: { id: staffId } });
      res.json({ ok: true, staff });
    } catch (err) {
      console.error('Error deleting staff member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

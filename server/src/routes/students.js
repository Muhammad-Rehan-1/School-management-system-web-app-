import express from 'express';
import multer from 'multer';
import path from 'path';

export default function createStudentsRouter(prisma) {
  const router = express.Router();
  const upload = multer({ dest: process.env.UPLOAD_DIR || 'uploads/' });

  /**
   * GET /api/students - Fetch all students with payments and uploads
   */
  router.get('/', async (req, res) => {
    try {
      const students = await prisma.student.findMany({ include: { payments: true } });

      // Fetch related uploads and attach to each student
      const studentIds = students.map(s => s.id);
      const uploads = await prisma.upload.findMany({
        where: { ownerType: 'student', ownerId: { in: studentIds } }
      });

      const uploadsByOwner = uploads.reduce((acc, u) => {
        if (!acc[u.ownerId]) acc[u.ownerId] = [];
        acc[u.ownerId].push(u);
        return acc;
      }, {});

      const result = students.map(s => ({
        ...s,
        uploads: uploadsByOwner[s.id] || []
      }));

      res.json(result);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/students/:id - Fetch a single student with uploads
   */
  router.get('/:id', async (req, res) => {
    try {
      const student = await prisma.student.findUnique({
        where: { id: req.params.id },
        include: { payments: true }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const uploads = await prisma.upload.findMany({
        where: { ownerType: 'student', ownerId: student.id }
      });

      student.uploads = uploads;
      res.json(student);
    } catch (err) {
      console.error('Error fetching student:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/students - Create a new student
   */
  router.post('/', upload.single('bForm'), async (req, res) => {
    try {
      const data = req.body;

      // Handle B-Form file upload if present
      if (req.file) {
        const url = `/uploads/${req.file.filename}`;
        data.bformUrl = url;
        await prisma.upload.create({
          data: {
            ownerType: 'student',
            ownerId: 'temp',
            url,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            size: req.file.size
          }
        });
      }

      // Create student record
      const student = await prisma.student.create({
        data: {
          name: data.name || 'Unknown',
          roll: data.roll || undefined,
          dob: data.dob ? new Date(data.dob) : undefined,
          admissionFees: Number(data.admissionFees || 0),
          monthlyFees: Number(data.monthlyFees || 0),
          bformUrl: data.bformUrl
        }
      });

      // Update upload record with actual student ID
      if (req.file) {
        await prisma.upload.updateMany({
          where: { url: data.bformUrl },
          data: { ownerId: student.id }
        });
      }

      res.json(student);
    } catch (err) {
      console.error('Error creating student:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/students/:id - Update a student
   */
  router.put('/:id', async (req, res) => {
    try {
      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(student);
    } catch (err) {
      console.error('Error updating student:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * DELETE /api/students/:id - Delete a student and related records
   */
  router.delete('/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
      // Delete related payments
      await prisma.payment.deleteMany({ where: { studentId } });

      // Delete related uploads
      await prisma.upload.deleteMany({
        where: { ownerType: 'student', ownerId: studentId }
      });

      // Delete student
      const student = await prisma.student.delete({ where: { id: studentId } });
      res.json({ ok: true, student });
    } catch (err) {
      console.error('Error deleting student:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

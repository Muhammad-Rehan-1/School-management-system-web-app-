# school-m server

This is a minimal Express + Prisma backend for the School app.

Quick start (with docker-compose):

1. Copy `.env.example` to `.env` and edit if needed
2. Start Postgres + MinIO: `docker-compose up -d`
3. Install deps: `npm install`
4. Generate Prisma client: `npx prisma generate`
5. Run migrations: `npx prisma migrate dev --name init`
6. Seed DB: `node prisma/seed.js`
7. Start dev server: `npm run dev`

Endpoints:
- GET /api/students
- POST /api/students (multipart, field `bForm` for file)
- GET /api/staff
- POST /api/staff (multipart, field `cnic`)
- POST /api/uploads (multipart, field `file`)
- POST /api/payments/:studentId

Uploads are stored to a local `uploads/` directory by default (controlled by `UPLOAD_DIR`).

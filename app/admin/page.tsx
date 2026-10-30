import { prisma } from '../../lib/prisma';
import { Suspense } from 'react';

// Komponen internal untuk mengambil data
async function AdminContent() {
  const totalAttendance = await prisma.attendance.count();
  const recentList = await prisma.attendance.findMany({
    take: 10,
    orderBy: { checkInTime: 'desc' },
    include: { user: true, location: true },
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>
        <p className="mb-4">Total Kehadiran: {totalAttendance}</p>
        {/* ... sisa tampilan tabel/list Anda ... */}
      </div>
    </div>
  );
}

// Halaman utama dengan pembungkus Suspense
export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Memuat data admin...</div>}>
      <AdminContent />
    </Suspense>
  );
}
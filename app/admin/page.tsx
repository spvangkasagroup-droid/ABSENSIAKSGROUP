export const dynamic = 'force-dynamic';

import { prisma } from '../../lib/prisma';

// Fungsi untuk mengambil data dengan aman di Next.js 16
async function getAdminData() {
  const totalAttendance = await prisma.attendance.count();
  const recentList = await prisma.attendance.findMany({
    take: 10,
    orderBy: { checkInTime: 'desc' },
    include: { user: true, location: true },
  });

  return { totalAttendance, recentList };
}

export default async function AdminDashboard() {
  const { totalAttendance, recentList } = await getAdminData();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>
        <p className="mb-4">Total Kehadiran: {totalAttendance}</p>
        
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Absensi Terbaru</h2>
          <ul className="divide-y divide-slate-200">
            {recentList.map((item: any) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>{item.user?.name || 'Karyawan'}</span>
                <span className="text-slate-500 text-sm">
                  {new Date(item.checkInTime).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
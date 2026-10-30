import { prisma } from '../../lib/prisma';
import { Suspense } from 'react';

// Komponen internal untuk mengambil data riwayat
async function HistoryContent() {
  const historyList = await prisma.attendance.findMany({
    take: 50,
    orderBy: { checkInTime: 'desc' },
    include: { user: true, location: true },
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Absensi</h1>
        {/* Tampilkan data riwayat Anda di sini */}
        <ul className="divide-y divide-slate-200">
          {historyList.map((item: any) => (
            <li key={item.id} className="py-3 flex justify-between">
              <span>{item.user?.name || 'Karyawan'}</span>
              <span className="text-slate-500 text-sm">
                {new Date(item.checkInTime).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Halaman utama dengan pembungkus Suspense
export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Memuat riwayat...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
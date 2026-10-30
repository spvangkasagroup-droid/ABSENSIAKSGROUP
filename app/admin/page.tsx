import { prisma } from '../../lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export default async function AdminDashboard() {
  noStore(); 
  const totalAttendance = await prisma.attendance.count();
  const recentList = await prisma.attendance.findMany({
    take: 10,
    orderBy: { checkInTime: 'desc' },
    include: { user: true, location: true },
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin Absensi</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-xs font-medium text-indigo-600">Total Kehadiran Tercatat</p>
            <p className="text-2xl font-bold text-indigo-900">{totalAttendance}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-700 mb-3">Absensi Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase">
                <th className="py-2 px-3">Nama</th>
                <th className="py-2 px-3">Waktu</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Foto</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentList.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-800">{item.user?.name}</td>
                  <td className="py-3 px-3 text-slate-600">{new Date(item.checkInTime).toLocaleTimeString('id-ID')}</td>
                  <td className="py-3 px-3"><span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded font-semibold">{item.status}</span></td>
                  <td className="py-3 px-3">
                    {item.checkInPhoto && <img src={item.checkInPhoto} alt="Foto" className="w-10 h-10 object-cover rounded" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
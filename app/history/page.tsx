import { prisma } from '../../lib/prisma';

export default async function HistoryPage() {
  // Mengambil data absensi dari database
  const attendances = await prisma.attendance.findMany({
    orderBy: { checkInTime: 'desc' },
    include: { user: true, location: true },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-4">Riwayat Absensi Karyawan</h1>
        <div className="space-y-4">
          {attendances.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
              <div>
                <p className="font-semibold text-slate-700">{item.user?.name || 'Karyawan'}</p>
                <p className="text-xs text-slate-500">
                  {new Date(item.checkInTime).toLocaleString('id-ID')}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  {item.status}
                </span>
              </div>
              {item.checkInPhoto && (
                <img src={item.checkInPhoto} alt="Bukti" className="w-16 h-16 object-cover rounded-lg border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
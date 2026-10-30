'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getDistanceInMeters } from '../lib/geo';

// Sesuaikan koordinat kantor dengan posisi uji coba Anda
const OFFICE_LAT = 0.4853715299548307; 
const OFFICE_LNG = 101.39523548005656;
const MAX_RADIUS_METERS = 100;

export default function AttendancePage() {
  const [userId, setUserId] = useState<string>('emp-001'); // State untuk ID Karyawan dinamis
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loadingLoc, setLoadingLoc] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const getLocation = () => {
    setLoadingLoc(true);
    setErrorMsg(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          const dist = getDistanceInMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
          setDistance(Math.round(dist));
          setIsWithinRadius(dist <= MAX_RADIUS_METERS);
          setLoadingLoc(false);
        },
        () => {
          setErrorMsg('Gagal mengambil lokasi. Pastikan GPS aktif.');
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setErrorMsg('Browser Anda tidak mendukung Geolocation.');
      setLoadingLoc(false);
    }
  };

  useEffect(() => {
    getLocation();
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhoto(dataUrl);
      }
    }
  };

  const handleSubmitAttendance = async () => {
    if (!photo || !userLocation) return;
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'emp-001', // Menggunakan input dinamis dari pengguna
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          photo: photo,
          status: 'HADIR',
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        const msg = 'Absensi berhasil disimpan ke database!';
        setSuccessMessage(msg);
        alert(msg);
      } else {
        alert('Gagal: ' + (result.message || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error('Terjadi kesalahan:', err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">Absensi Kehadiran</h1>
        <p className="text-sm text-slate-500 text-center mb-6">Pastikan Anda berada di area kantor</p>

        {/* Input ID Karyawan Dinamis */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">ID / NIK Karyawan</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Contoh: emp-001"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> Lokasi Anda
            </span>
            <button
              onClick={getLocation}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingLoc ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {loadingLoc ? (
            <p className="text-xs text-slate-400">Mendeteksi koordinat GPS...</p>
          ) : errorMsg ? (
            <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
          ) : (
            <div>
              <p className="text-xs text-slate-500">
                Jarak ke Kantor: <strong className="text-slate-800">{distance} Meter</strong>
              </p>
              <div className="mt-2 flex items-center gap-2">
                {isWithinRadius ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dalam Radius Absensi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" /> Di Luar Jangkauan (Max {MAX_RADIUS_METERS}m)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center">
          {!photo ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <img src={photo} alt="Foto Absensi" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="space-y-3">
          {!photo ? (
            <button
              onClick={takePhoto}
              disabled={!isCameraActive}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition"
            >
              <Camera className="w-4 h-4" /> Ambil Foto Selfie
            </button>
          ) : (
            <button
              onClick={() => setPhoto(null)}
              className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium text-sm transition"
            >
              Foto Ulang
            </button>
          )}

          <button
            onClick={handleSubmitAttendance}
            disabled={!photo || !isWithinRadius || loadingLoc || isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white text-sm shadow-md transition flex items-center justify-center gap-2 ${
              photo && isWithinRadius && !loadingLoc
                ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Kehadiran (Check-In)'}
          </button>

          {successMessage && (
            <p className="mt-3 text-xs text-emerald-600 font-semibold text-center">{successMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
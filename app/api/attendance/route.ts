import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, latitude, longitude, photo, status } = body;

    let targetUserId = userId || "emp-001";
    let existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          id: targetUserId,
          name: "Karyawan Uji Coba",
          email: "karyawan@example.com",
          password: "passworddummy",
          role: "EMPLOYEE",
        },
      });
    }

    let defaultLocation = await prisma.location.findFirst();
    if (!defaultLocation) {
      defaultLocation = await prisma.location.create({
        data: {
          name: "Kantor Pusat",
          latitude: -6.200000,
          longitude: 106.816666,
          radiusInMeters: 100,
        },
      });
    }

    const attendance = await prisma.attendance.create({
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        checkInPhoto: photo,
        status: status || 'HADIR',
        user: {
          connect: { id: existingUser.id },
        },
        location: {
          connect: { id: defaultLocation.id },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan ke database!',
      data: attendance,
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan absensi ke database.' },
      { status: 500 }
    );
  }
}
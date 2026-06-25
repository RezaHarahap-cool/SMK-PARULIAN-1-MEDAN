import { describe, expect, it } from 'vitest';
import { hitungKetidakhadiranRapor } from '../services/raporAttendanceService.js';

describe('hitungKetidakhadiranRapor', () => {
  it('menghitung ketidakhadiran per tanggal, bukan per baris mapel', async () => {
    const prisma = {
      absensi: {
        findMany: async () => [
          { tgl_absensi: new Date('2026-01-05T00:00:00.000Z'), keterangan: 'Sakit' },
          { tgl_absensi: new Date('2026-01-05T00:00:00.000Z'), keterangan: 'Sakit' },
          { tgl_absensi: new Date('2026-01-06T00:00:00.000Z'), keterangan: 'Hadir' },
          { tgl_absensi: new Date('2026-01-07T00:00:00.000Z'), keterangan: 'Izin' },
          { tgl_absensi: new Date('2026-01-07T00:00:00.000Z'), keterangan: 'Alpha' },
        ],
      },
    };

    await expect(
      hitungKetidakhadiranRapor(prisma, {
        siswa_id: 'siswa-1',
        tahun_ajaran_id: 'ta-1',
        semester_id: 'semester-1',
        kelas_id: 'kelas-1',
      })
    ).resolves.toEqual({ sakit: 1, izin: 0, alpha: 1 });
  });
});

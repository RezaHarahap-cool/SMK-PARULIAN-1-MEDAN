import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../index.js';
import prisma from '../config/prisma.js';

const signToken = (user) => jwt.sign(
  { id_users: user.id_users, role: user.role },
  process.env.JWT_SECRET || 'fallback_secret',
  { expiresIn: '5m' }
);

const authHeader = (user) => `Bearer ${signToken(user)}`;
const PRAKERIN_MAPEL = 'Praktik Kerja Lapangan (Prakerin) 6 bulan';

describe('rapor wali API', () => {
  it('mengizinkan wali kelas membuka data rapor pendukung', async () => {
    const wali = await prisma.guruProfile.findFirst({
      where: {
        kelas_wali: { some: {} },
        user: { is: { is_active: true, role: 'guru' } }
      },
      include: { user: true }
    });

    if (!wali) return;

    const res = await request(app)
      .get('/api/wali-kelas/rapor-pendukung')
      .set('Authorization', authHeader(wali.user));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.siswa)).toBe(true);
    expect(res.body.data.ekstrakurikuler.nama).toBe('Pramuka');
  });

  it('menolak guru yang bukan wali kelas', async () => {
    const nonWali = await prisma.guruProfile.findFirst({
      where: {
        kelas_wali: { none: {} },
        user: { is: { is_active: true, role: 'guru' } }
      },
      include: { user: true }
    });

    if (!nonWali) return;

    const res = await request(app)
      .get('/api/wali-kelas/rapor-pendukung')
      .set('Authorization', authHeader(nonWali.user));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('rapor admin dan siswa API', () => {
  it('mengembalikan status kelengkapan rapor wali pada cetak rapor admin dan rapor siswa', async () => {
    const [admin, rapor] = await Promise.all([
      prisma.user.findFirst({ where: { role: 'admin', is_active: true } }),
      prisma.rapor.findFirst({
        where: { status_acc: 'DISETUJUI' },
        include: {
          riwayat_kelas_siswa: {
            include: {
              siswa: {
                include: { user: true }
              }
            }
          }
        }
      })
    ]);

    if (!admin || !rapor) return;

    const adminRes = await request(app)
      .get(`/api/admin/cetak-rapor/${rapor.riwayat_kelas_siswa_id}`)
      .set('Authorization', authHeader(admin));

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.kelengkapan_wali).toHaveProperty('lengkap');
    expect(Array.isArray(adminRes.body.data.kelengkapan_wali.kurang)).toBe(true);
    expect(adminRes.body.data.nilai.some((item) => item.mapel === PRAKERIN_MAPEL)).toBe(true);

    const siswaRes = await request(app)
      .get('/api/siswa-area/rapor')
      .query({
        riwayat_id: rapor.riwayat_kelas_siswa_id,
        semester_id: rapor.semester_id
      })
      .set('Authorization', authHeader(rapor.riwayat_kelas_siswa.siswa.user));

    expect(siswaRes.status).toBe(200);
    expect(siswaRes.body.success).toBe(true);
    expect(siswaRes.body.data.kelengkapan_wali).toHaveProperty('lengkap');
    expect(siswaRes.body.data.nilai.some((item) => item.mapel === PRAKERIN_MAPEL)).toBe(true);
  }, 20000);
});

describe('roster API', () => {
  it('tidak mengembalikan guru pada baris aktivitas les 0', async () => {
    const [admin, tahunAjaran, kelas, mapel, guru] = await Promise.all([
      prisma.user.findFirst({ where: { role: 'admin', is_active: true } }),
      prisma.tahunAjaran.findFirst({ where: { status: 'AKTIF' } }),
      prisma.kelas.findFirst(),
      prisma.mataPelajaran.findFirst(),
      prisma.guruProfile.findFirst()
    ]);

    if (!admin || !tahunAjaran || !kelas || !mapel || !guru) return;

    const aktivitas = await prisma.jadwal.create({
      data: {
        kelas_id: kelas.id_kelas,
        mapel_id: mapel.id_mapel,
        guru_id: guru.id_guru,
        tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
        hari: 'Senin',
        jam_mulai: '23:00',
        jam_berakhir: '23:05',
        les: 0
      }
    });

    try {
      const res = await request(app)
        .get('/api/jadwal')
        .query({ kelas_id: aktivitas.kelas_id })
        .set('Authorization', authHeader(admin));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const activityRow = res.body.data.find((item) => item.id_jadwal === aktivitas.id_jadwal);
      expect(activityRow).toBeTruthy();
      expect(activityRow.guru).toBeNull();
    } finally {
      await prisma.jadwal.delete({ where: { id_jadwal: aktivitas.id_jadwal } });
    }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const statusPriority = {
  hadir: 0,
  izin: 1,
  sakit: 2,
  alpha: 3,
};

const normalizeStatus = (value) => {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'tanpa keterangan' || status === 'alpa') return 'alpha';
  if (statusPriority[status] !== undefined) return status;
  return 'hadir';
};

export const hitungKetidakhadiranRapor = async (prisma, {
  siswa_id,
  tahun_ajaran_id,
  semester_id,
  kelas_id,
}) => {
  const absensi = await prisma.absensi.findMany({
    where: {
      siswa_id,
      tahun_ajaran_id,
      ...(semester_id ? { semester_id } : {}),
      ...(kelas_id ? { mengajar: { kelas_id } } : {}),
    },
    select: {
      tgl_absensi: true,
      keterangan: true,
    },
  });

  const statusPerTanggal = new Map();

  for (const item of absensi) {
    const tanggal = item.tgl_absensi.toISOString().slice(0, 10);
    const status = normalizeStatus(item.keterangan);
    const previous = statusPerTanggal.get(tanggal) || 'hadir';

    if (statusPriority[status] > statusPriority[previous]) {
      statusPerTanggal.set(tanggal, status);
    } else if (!statusPerTanggal.has(tanggal)) {
      statusPerTanggal.set(tanggal, previous);
    }
  }

  return [...statusPerTanggal.values()].reduce(
    (total, status) => {
      if (status === 'sakit') total.sakit += 1;
      if (status === 'izin') total.izin += 1;
      if (status === 'alpha') total.alpha += 1;
      return total;
    },
    { sakit: 0, izin: 0, alpha: 0 }
  );
};

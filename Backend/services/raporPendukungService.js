export const makeRaporPendukungKey = (riwayatId, semesterId) => `${riwayatId}|${semesterId}`;

export const buildRaporPendukungStatus = ({ ekstrakurikuler, catatan }) => {
  const kurang = [];

  if (!ekstrakurikuler?.predikat) {
    kurang.push('Predikat Pramuka');
  }

  if (!String(catatan?.catatan || '').trim()) {
    kurang.push('Catatan wali kelas');
  }

  return {
    lengkap: kurang.length === 0,
    kurang
  };
};

export const getRaporPendukungStatuses = async (prisma, pairs) => {
  const uniquePairs = Array.from(
    new Map(
      pairs
        .filter((pair) => pair?.riwayat_id && pair?.semester_id)
        .map((pair) => [makeRaporPendukungKey(pair.riwayat_id, pair.semester_id), pair])
    ).values()
  );

  const statuses = new Map();
  if (uniquePairs.length === 0) {
    return statuses;
  }

  const riwayatIds = [...new Set(uniquePairs.map((pair) => pair.riwayat_id))];
  const semesterIds = [...new Set(uniquePairs.map((pair) => pair.semester_id))];

  const pramuka = await prisma.ekstrakurikuler.findUnique({
    where: { nama: 'Pramuka' }
  });

  const [nilaiEkstrakurikuler, catatanWali] = await Promise.all([
    pramuka
      ? prisma.raporEkstrakurikuler.findMany({
          where: {
            riwayat_kelas_siswa_id: { in: riwayatIds },
            semester_id: { in: semesterIds },
            ekstrakurikuler_id: pramuka.id_ekstrakurikuler
          }
        })
      : [],
    prisma.raporCatatanWali.findMany({
      where: {
        riwayat_kelas_siswa_id: { in: riwayatIds },
        semester_id: { in: semesterIds }
      }
    })
  ]);

  const ekskulByPair = new Map(
    nilaiEkstrakurikuler.map((item) => [
      makeRaporPendukungKey(item.riwayat_kelas_siswa_id, item.semester_id),
      item
    ])
  );
  const catatanByPair = new Map(
    catatanWali.map((item) => [
      makeRaporPendukungKey(item.riwayat_kelas_siswa_id, item.semester_id),
      item
    ])
  );

  for (const pair of uniquePairs) {
    const key = makeRaporPendukungKey(pair.riwayat_id, pair.semester_id);
    statuses.set(
      key,
      buildRaporPendukungStatus({
        ekstrakurikuler: ekskulByPair.get(key),
        catatan: catatanByPair.get(key)
      })
    );
  }

  return statuses;
};

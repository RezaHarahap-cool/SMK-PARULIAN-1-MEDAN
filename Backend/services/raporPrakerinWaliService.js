export const PRAKERIN_MAPEL = 'Praktik Kerja Lapangan (Prakerin) 6 bulan';
export const PRAKERIN_KELOMPOK = 'KEJURUAN';

export const formatRaporPrakerinWaliItem = (item, fallbackWaliKelas = 'Wali Kelas') => ({
  id_rapor: item.id_rapor_prakerin_wali,
  mapel: PRAKERIN_MAPEL,
  kelompok: PRAKERIN_KELOMPOK,
  guru: item.wali_kelas?.nama_guru || fallbackWaliKelas,
  kktp: item.kktp || null,
  nilai_akhir: item.nilai_akhir,
  capaian_kompetensi: item.capaian_kompetensi || '',
  capaian: item.capaian_kompetensi || ''
});

export const formatEmptyRaporPrakerinWaliItem = (fallbackWaliKelas = 'Wali Kelas') => ({
  id_rapor: 'prakerin-wali-kosong',
  mapel: PRAKERIN_MAPEL,
  kelompok: PRAKERIN_KELOMPOK,
  guru: fallbackWaliKelas,
  kktp: null,
  nilai_akhir: null,
  capaian_kompetensi: '',
  capaian: ''
});

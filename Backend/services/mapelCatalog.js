export const kelompokMapelLabels = {
  UMUM: 'Umum',
  MULOK: 'Muatan Lokal',
  KEJURUAN: 'Kejuruan',
};

export const raporKelompokOrder = ['UMUM', 'MULOK', 'KEJURUAN'];

export const subjectCatalog = [
  { name: 'Pendidikan Agama dan Budi Pekerti', group: 'UMUM', aliases: ['AGAMA', 'Agama Kristen'] },
  { name: 'Pendidikan Pancasila dan Kewarganegaraan', group: 'UMUM', aliases: ['PKN', 'PPKN'] },
  { name: 'Bahasa Indonesia', group: 'UMUM', aliases: ['B.INDO', 'Bhs. Indonesia'] },
  { name: 'Bahasa Inggris', group: 'UMUM', aliases: ['B.INGG', 'B.ING', 'Bhs. Inggris'] },
  { name: 'Matematika', group: 'UMUM', aliases: ['MM', 'Matematika'] },
  { name: 'Sejarah', group: 'UMUM', aliases: ['SEJARAH', 'Sejarah Indonesia'] },
  { name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', group: 'UMUM', aliases: ['PJOK', 'Penjas'] },
  { name: 'Seni Budaya dan Keterampilan', group: 'UMUM', aliases: ['SBK', 'Seni Budaya'] },
  { name: 'IPAS', group: 'UMUM', aliases: ['IPAS'] },
  { name: 'Informatika', group: 'UMUM', aliases: ['INFOR/AI', 'Informatika', 'Komputer'] },
  { name: 'Mandarin', group: 'MULOK', aliases: ['MANDARIN', 'Bahasa Mandarin', 'Muatan Lokal'] },
  { name: 'Sistem Komputer', group: 'KEJURUAN', aliases: ['SISKOM'] },
  { name: 'Komputer dan Jaringan Dasar', group: 'KEJURUAN', aliases: ['KOMJAR'] },
  { name: 'Pemrograman Dasar', group: 'KEJURUAN', aliases: ['PEMDA'] },
  { name: 'Dasar Desain Grafis', group: 'KEJURUAN', aliases: ['D.GRAFIS', 'D GRAFIS', 'Desain Grafis'] },
  { name: 'Pemrograman Web', group: 'KEJURUAN', aliases: ['P.WEB', 'PWEB', 'Pemrograman Web'] },
  { name: 'Basis Data', group: 'KEJURUAN', aliases: ['B.DATA', 'BASIS DATA'] },
  { name: 'Pemrograman Berorientasi Objek', group: 'KEJURUAN', aliases: ['PBO', 'Rekayasa Perangkat Lunak'] },
  { name: 'Pemodelan Perangkat Lunak', group: 'KEJURUAN', aliases: ['PPL'] },
  { name: 'Administrasi Infrastruktur Jaringan', group: 'KEJURUAN', aliases: ['AIJ'] },
  { name: 'Administrasi Sistem Jaringan', group: 'KEJURUAN', aliases: ['ASJ'] },
  { name: 'Teknologi Layanan Jaringan', group: 'KEJURUAN', aliases: ['TLJ'] },
  { name: 'Wide Area Network', group: 'KEJURUAN', aliases: ['WAN'] },
  { name: 'Koding', group: 'KEJURUAN', aliases: ['KODING', 'KODING/AI'] },
  { name: 'Ekonomi Bisnis', group: 'KEJURUAN', aliases: ['EKBIS'] },
  { name: 'Administrasi Umum', group: 'KEJURUAN', aliases: ['ADUM', 'Administrasi Perkantoran'] },
  { name: 'Akuntansi Dasar', group: 'KEJURUAN', aliases: ['AKDAS', 'Akuntansi'] },
  { name: 'Perbankan Dasar', group: 'KEJURUAN', aliases: ['BANK'] },
  { name: 'Korespondensi', group: 'KEJURUAN', aliases: ['KORESPONDENSI'] },
  { name: 'Kearsipan', group: 'KEJURUAN', aliases: ['ARSIP', 'Arsip'] },
  { name: 'Teknologi Perkantoran', group: 'KEJURUAN', aliases: ['TEKPER'] },
  { name: 'Akuntansi Keuangan', group: 'KEJURUAN', aliases: ['AK.KEU', 'AK,KEU'] },
  { name: 'Administrasi Pajak', group: 'KEJURUAN', aliases: ['PAJAK'] },
  { name: 'Komputer Akuntansi', group: 'KEJURUAN', aliases: ['MYOB'] },
  { name: 'Praktikum Akuntansi Lembaga/Instansi Pemerintah', group: 'KEJURUAN', aliases: ['PALIP'] },
  { name: 'Praktikum Akuntansi Perusahaan Jasa, Dagang dan Manufaktur', group: 'KEJURUAN', aliases: ['PJDAM'] },
  { name: 'Aplikasi Pengolah Angka/Perkantoran', group: 'KEJURUAN', aliases: ['APL', 'Pengolahan Data'] },
];

export const activitySubjects = [
  'Upacara/Literasi',
  'Istirahat',
  'Ibadah dan Bina Mental',
];

const normalizeKey = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toUpperCase()
  .replace(/[,]+/g, '.')
  .replace(/\s*\/\s*/g, '/')
  .replace(/\s*\.\s*/g, '.');

const aliasToSubject = new Map();
const subjectGroup = new Map();
const subjectOrder = new Map();

subjectCatalog.forEach((subject, index) => {
  subjectGroup.set(subject.name, subject.group);
  subjectOrder.set(subject.name, index);
  aliasToSubject.set(normalizeKey(subject.name), subject.name);
  for (const alias of subject.aliases) {
    aliasToSubject.set(normalizeKey(alias), subject.name);
  }
});

activitySubjects.forEach((subject) => {
  aliasToSubject.set(normalizeKey(subject), subject);
  subjectGroup.set(subject, 'UMUM');
});
aliasToSubject.set(normalizeKey('MBG / Istirahat'), 'Istirahat');
aliasToSubject.set(normalizeKey('MBG/Istirahat'), 'Istirahat');

export const canonicalSubjectNames = [
  ...subjectCatalog.map((subject) => subject.name),
  ...activitySubjects,
];

export function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function normalizeSubjectName(value) {
  const text = cleanText(value);
  if (!text) return '';
  return aliasToSubject.get(normalizeKey(text)) || text;
}

export function getKelompokMapel(value) {
  const name = normalizeSubjectName(value);
  return subjectGroup.get(name) || 'UMUM';
}

export function compareMapelForRapor(a, b) {
  const groupA = a.kelompok || getKelompokMapel(a.mapel);
  const groupB = b.kelompok || getKelompokMapel(b.mapel);
  const groupDelta = raporKelompokOrder.indexOf(groupA) - raporKelompokOrder.indexOf(groupB);
  if (groupDelta !== 0) return groupDelta;

  const nameA = normalizeSubjectName(a.mapel);
  const nameB = normalizeSubjectName(b.mapel);
  const orderA = subjectOrder.has(nameA) ? subjectOrder.get(nameA) : Number.MAX_SAFE_INTEGER;
  const orderB = subjectOrder.has(nameB) ? subjectOrder.get(nameB) : Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;

  return nameA.localeCompare(nameB, 'id');
}

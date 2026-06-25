import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import XLSX from 'xlsx';
import {
  activitySubjects,
  canonicalSubjectNames,
  getKelompokMapel,
  normalizeSubjectName,
} from '../services/mapelCatalog.js';

const prisma = new PrismaClient();

const defaultDataDir = fs.existsSync(path.resolve(process.cwd(), '..', 'refrensi database'))
  ? path.resolve(process.cwd(), '..', 'refrensi database')
  : path.resolve(process.cwd(), '..', '..');
const DATA_DIR = process.env.SEED_DATA_DIR || defaultDataDir;
const STUDENT_FILE = path.join(DATA_DIR, 'DATA SISWA SMKS PARULIAN 1 - MICROSKILL.xlsx');
const GURU_FILE = path.join(DATA_DIR, 'LAPORAN BULANAN HAL 4.xls');
const GURU_BIRTH_FILE = path.join(DATA_DIR, 'LAPORAN BULANAN HAL 2.xls');
const STAFF_FILE = path.join(DATA_DIR, 'LAPORAN BULANAN HAL 3.xlsx');
const ROSTER_FILE = path.join(DATA_DIR, 'Roster terbaru.xlsx');

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'parulian123';
const LOCAL_EMAIL_DOMAIN = process.env.SEED_EMAIL_DOMAIN || 'smkparulian1.local';
const DEFAULT_PROFILE_FOTO = 'general_profil.png';
const FRONTEND_PROFILE_PHOTO = path.resolve(process.cwd(), '..', 'Frontend', 'public', DEFAULT_PROFILE_FOTO);
const BACKEND_PROFILE_PHOTO = path.resolve(process.cwd(), 'uploads', DEFAULT_PROFILE_FOTO);
const parsedMaxLessonsPerClassDay = Number.parseInt(process.env.SEED_MAX_LESSONS_PER_CLASS_DAY || '4', 10);
const MAX_LESSONS_PER_CLASS_DAY = Number.isFinite(parsedMaxLessonsPerClassDay) && parsedMaxLessonsPerClassDay > 0
  ? parsedMaxLessonsPerClassDay
  : 4;
const parsedMaxLessonsPerTeachingAssignment = Number.parseInt(process.env.SEED_MAX_LESSONS_PER_TEACHING_ASSIGNMENT || '4', 10);
const MAX_LESSONS_PER_TEACHING_ASSIGNMENT = Number.isFinite(parsedMaxLessonsPerTeachingAssignment) && parsedMaxLessonsPerTeachingAssignment > 0
  ? parsedMaxLessonsPerTeachingAssignment
  : 4;

const schoolDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const dailyLessonSlots = {
  Senin: [
    { les: 0, start: '07:15', end: '08:15', activity: 'Upacara/Literasi' },
    { les: 1, start: '08:15', end: '08:55' },
    { les: 2, start: '08:55', end: '09:35' },
    { les: 3, start: '09:35', end: '10:15' },
    { les: 0, start: '10:15', end: '10:45', activity: 'Istirahat' },
    { les: 4, start: '10:45', end: '11:25' },
    { les: 5, start: '11:25', end: '12:05' },
    { les: 6, start: '12:05', end: '12:45' },
    { les: 0, start: '12:45', end: '13:00', activity: 'Istirahat' },
    { les: 7, start: '13:00', end: '13:40' },
  ],
  Selasa: [
    { les: 1, start: '07:45', end: '08:25' },
    { les: 2, start: '08:25', end: '09:05' },
    { les: 3, start: '09:05', end: '09:45' },
    { les: 0, start: '09:45', end: '10:15', activity: 'Istirahat' },
    { les: 4, start: '10:15', end: '10:55' },
    { les: 5, start: '10:55', end: '11:35' },
    { les: 6, start: '11:35', end: '12:15' },
    { les: 0, start: '12:15', end: '12:30', activity: 'Istirahat' },
    { les: 7, start: '12:30', end: '13:10' },
    { les: 8, start: '13:10', end: '13:50' },
    { les: 9, start: '13:50', end: '14:30' },
  ],
  Rabu: [
    { les: 1, start: '07:45', end: '08:25' },
    { les: 2, start: '08:25', end: '09:05' },
    { les: 3, start: '09:05', end: '09:45' },
    { les: 0, start: '09:45', end: '10:15', activity: 'Istirahat' },
    { les: 4, start: '10:15', end: '10:55' },
    { les: 5, start: '10:55', end: '11:35' },
    { les: 6, start: '11:35', end: '12:15' },
    { les: 0, start: '12:15', end: '12:30', activity: 'Istirahat' },
    { les: 7, start: '12:30', end: '13:10' },
    { les: 8, start: '13:10', end: '13:50' },
    { les: 9, start: '13:50', end: '14:30' },
  ],
  Kamis: [
    { les: 1, start: '07:45', end: '08:25' },
    { les: 2, start: '08:25', end: '09:05' },
    { les: 3, start: '09:05', end: '09:45' },
    { les: 0, start: '09:45', end: '10:15', activity: 'Istirahat' },
    { les: 4, start: '10:15', end: '10:55' },
    { les: 5, start: '10:55', end: '11:35' },
    { les: 6, start: '11:35', end: '12:15' },
    { les: 0, start: '12:15', end: '12:30', activity: 'Istirahat' },
    { les: 7, start: '12:30', end: '13:10' },
    { les: 8, start: '13:10', end: '13:50' },
  ],
  Jumat: [
    { les: 1, start: '07:45', end: '08:25' },
    { les: 2, start: '08:25', end: '09:05' },
    { les: 3, start: '09:05', end: '09:45' },
    { les: 0, start: '09:45', end: '10:15', activity: 'Istirahat' },
    { les: 4, start: '10:15', end: '10:55' },
    { les: 5, start: '10:55', end: '11:35' },
    { les: 6, start: '11:35', end: '12:15' },
    { les: 0, start: '12:15', end: '12:30', activity: 'Istirahat' },
    { les: 7, start: '12:30', end: '13:10' },
    { les: 0, start: '14:00', end: '15:00', activity: 'Ibadah dan Bina Mental' },
  ],
};

const supplementalMapel = canonicalSubjectNames;

const majorAliases = new Map([
  ['Akuntansi dan Keuangan Lembaga', 'AKL'],
  ['Rekayasa Perangkat Lunak', 'RPL'],
  ['Teknik Komputer dan Jaringan', 'TKJ'],
  ['Otomatisasi Tata Kelola Perkantoran', 'OTKP'],
]);

const mapelAliases = new Map([
  ['Adm. Perkantoran', 'Administrasi Perkantoran'],
  ['Bhs. Indonesia', 'Bahasa Indonesia'],
  ['Bhs. Inggris', 'Bahasa Inggris'],
  ['PKN', 'PPKN'],
  ['Penjas', 'PJOK'],
  ['BK', 'Bimbingan Konseling'],
  ['RPL', 'Rekayasa Perangkat Lunak'],
]);

function readRows(file, sheetName = 'Sheet1') {
  const workbook = XLSX.readFile(file, { cellDates: true });
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" tidak ditemukan di ${file}`);
  }

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  });
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function isRemovedSubject(value) {
  const subject = clean(value).toUpperCase();
  return subject === 'PKK' || subject === 'PRODUK KREATIF DAN KEWIRAUSAHAAN';
}

function limitText(value, maxLength = 55) {
  const text = clean(value);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeName(value) {
  return clean(value)
    .toLowerCase()
    .replace(/,?\s+(s\.pd|m\.pd|s\.kom|ss|se|m\.ak|s\.ak)\.?/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function slugify(value) {
  const slug = clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return slug || 'user';
}

function teacherUsername(name) {
  const baseName = clean(name)
    .replace(/,?\s+(s\.pd|m\.pd|s\.kom|ss|se|m\.ak|s\.ak)\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `guru.${slugify(baseName)}`.slice(0, 50);
}

function genderFrom(value) {
  const normalized = clean(value).toUpperCase();
  return normalized.startsWith('L') ? 'Pria' : 'Wanita';
}

function parseUsDate(value, fallback = '1990-01-01') {
  const text = clean(value);
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (!match) {
    return new Date(`${fallback}T00:00:00.000Z`);
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) {
    year += year > 30 ? 1900 : 2000;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function parseIndonesianDate(value, fallback = '1990-01-01') {
  const text = clean(value);
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return new Date(`${fallback}T00:00:00.000Z`);
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

function mapelName(value) {
  const withoutPrefix = clean(value).replace(/^Guru\s+/i, '');
  return normalizeSubjectName(mapelAliases.get(withoutPrefix) || withoutPrefix || 'Umum');
}

function className(level, major) {
  const alias = majorAliases.get(clean(major)) || clean(major);
  return `${clean(level)} ${alias}`;
}

function educationFromName(name, explicitEducation = '') {
  const explicit = clean(explicitEducation);
  if (explicit) return explicit;
  if (/m\.pd|m\.ak/i.test(name)) return 'S.2';
  if (/s\.pd|s\.kom|s\.ak|se|ss/i.test(name)) return 'S.1';
  return 'S.1';
}

function ensureDefaultProfilePhoto() {
  if (!fs.existsSync(FRONTEND_PROFILE_PHOTO)) {
    console.warn(`Foto default tidak ditemukan: ${FRONTEND_PROFILE_PHOTO}`);
    return;
  }

  fs.mkdirSync(path.dirname(BACKEND_PROFILE_PHOTO), { recursive: true });
  fs.copyFileSync(FRONTEND_PROFILE_PHOTO, BACKEND_PROFILE_PHOTO);
}

function scoreFor(...parts) {
  const seed = parts.join('|');
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }

  return 70 + (hash % 26);
}

function clampScore(value) {
  return Math.max(60, Math.min(100, Math.round(value)));
}

function achievementText(mapel, score) {
  if (score >= 85) {
    return `Menunjukkan penguasaan yang sangat baik pada kompetensi ${mapel}.`;
  }

  if (score >= 75) {
    return `Menunjukkan penguasaan yang baik pada kompetensi ${mapel}.`;
  }

  return `Perlu bimbingan lanjutan untuk memperkuat kompetensi ${mapel}.`;
}

async function createManyInChunks(model, data, size = 1000) {
  for (let index = 0; index < data.length; index += size) {
    await model.createMany({ data: data.slice(index, index + size) });
  }
}

function pickHomeroomTeacherId(major, guruByMapel, usedHomeroomTeacherIds = new Set()) {
  const preferredMapel = {
    'Akuntansi dan Keuangan Lembaga': 'Akuntansi Dasar',
    'Rekayasa Perangkat Lunak': 'Pemrograman Berorientasi Objek',
    'Teknik Komputer dan Jaringan': 'Informatika',
    'Otomatisasi Tata Kelola Perkantoran': 'Administrasi Umum',
  }[major];

  const preferredTeachers = guruByMapel.get(preferredMapel) || [];
  const allTeachers = [...guruByMapel.values()].flat();
  const candidates = [...preferredTeachers, ...allTeachers];
  const selected = candidates.find((guru) => !usedHomeroomTeacherIds.has(guru.id_guru)) || candidates[0];

  if (!selected) return null;
  usedHomeroomTeacherIds.add(selected.id_guru);
  return selected.id_guru;
}

function getStudents() {
  const seenNisn = new Map();

  const students = readRows(STUDENT_FILE)
    .slice(2)
    .filter((row) => clean(row[0]).match(/^\d/))
    .map((row) => {
      const originalNisn = clean(row[4]);
      const duplicateIndex = seenNisn.get(originalNisn) || 0;
      seenNisn.set(originalNisn, duplicateIndex + 1);

      return {
        npsn: clean(row[1]),
        nis: clean(row[3]),
        nisn: duplicateIndex === 0 ? originalNisn : `${originalNisn}-${duplicateIndex + 1}`,
        nama_siswa: clean(row[5]),
        gender: genderFrom(row[6]),
        tempat_tgl_lahir: clean(row[7]),
        level: clean(row[8]),
        jurusan: clean(row[9]),
        nama_ayah: clean(row[10]) || '-',
        pekerjaan_ayah: clean(row[11]) || '-',
        nama_ibu: clean(row[12]) || '-',
        pekerjaan_ibu: clean(row[13]) || '-',
        alamat: clean(row[14]) || '-',
        desa_kelurahan: clean(row[15]) || '-',
        kecamatan: clean(row[16]) || '-',
        kabupaten_kota: clean(row[17]) || '-',
        provinsi: clean(row[18]) || '-',
        no_hp_wali: clean(row[19]) || '-',
      };
    });

  const hasClass = (level, major) => students.some((student) => student.level === level && student.jurusan === major);
  const otkp = 'Otomatisasi Tata Kelola Perkantoran';
  const supplementalStudents = [];

  for (const level of ['XI', 'XII']) {
    if (hasClass(level, otkp)) continue;

    for (let index = 1; index <= 8; index += 1) {
      const nisSuffix = `${level === 'XI' ? '11' : '12'}04${String(index).padStart(2, '0')}`;
      supplementalStudents.push({
        npsn: '10254321',
        nis: `OTKP-${nisSuffix}`,
        nisn: `99${nisSuffix}`,
        nama_siswa: `Siswa ${level} OTKP ${index}`,
        gender: index % 2 === 0 ? 'Pria' : 'Wanita',
        tempat_tgl_lahir: `Medan, ${String(10 + index).padStart(2, '0')}/0${(index % 9) + 1}/200${level === 'XI' ? '8' : '7'}`,
        level,
        jurusan: otkp,
        nama_ayah: `Ayah Siswa ${index}`,
        pekerjaan_ayah: 'Wiraswasta',
        nama_ibu: `Ibu Siswa ${index}`,
        pekerjaan_ibu: 'Ibu Rumah Tangga',
        alamat: `Jl. Pendidikan OTKP No. ${index}`,
        desa_kelurahan: 'Teladan Timur',
        kecamatan: 'Medan Kota',
        kabupaten_kota: 'Medan',
        provinsi: 'Sumatera Utara',
        no_hp_wali: `08126004${String(index).padStart(4, '0')}`,
      });
    }
  }

  return [...students, ...supplementalStudents];
}

function getTeacherDetailsByName() {
  const details = new Map();
  const rows = readRows(GURU_BIRTH_FILE)
    .slice(6)
    .filter((row) => clean(row[0]).match(/^\d/) && clean(row[9]));

  for (const row of rows) {
    details.set(normalizeName(row[1]), {
      tgl_lahir: parseUsDate(row[12]),
      mapel: mapelName(row[9]),
    });
  }

  return details;
}

function getTeachers() {
  const detailsByName = getTeacherDetailsByName();

  const teachers = readRows(GURU_FILE)
    .slice(6)
    .filter((row) => clean(row[0]).match(/^\d/) && clean(row[4]).toLowerCase().includes('guru'))
    .map((row) => {
      const nama_guru = clean(row[1]);
      const detail = detailsByName.get(normalizeName(nama_guru));
      const taskMapel = mapelName(row[13]);

      return {
        nama_guru,
        gender: genderFrom(row[2]),
        tgl_lahir: detail?.tgl_lahir || new Date('1990-01-01T00:00:00.000Z'),
        agama: 'Kristen',
        pendidikan_tertinggi: educationFromName(nama_guru, row[5]),
        no_hp: clean(row[14]) || '-',
        mapel: taskMapel === 'Operator Sekolah' ? detail?.mapel || 'Komputer' : taskMapel,
      };
    });

  if (!teachers.some((teacher) => teacher.mapel === 'Mandarin')) {
    teachers.push({
      nama_guru: 'Lina Wijaya, S.Pd',
      gender: 'Wanita',
      tgl_lahir: new Date('1992-08-17T00:00:00.000Z'),
      agama: 'Kristen',
      pendidikan_tertinggi: 'S.1',
      no_hp: '081260010021',
      mapel: 'Mandarin',
    });
  }

  return teachers;
}

function getStaffRows() {
  return readRows(STAFF_FILE)
    .slice(4)
    .filter((row) => clean(row[0]).match(/^\d/))
    .map((row) => ({
      nama: clean(row[1]),
      tugas: clean(row[7]),
      tgl_lahir: parseIndonesianDate(row[10]),
      no_hp: clean(row[13]) || '-',
    }));
}

const rosterClassColumns = [
  { className: 'X RPL', mapelColumn: 3, teacherColumn: 4 },
  { className: 'X TKJ', mapelColumn: 5, teacherColumn: 6 },
  { className: 'X AKL', mapelColumn: 7, teacherColumn: 12, teacherIndex: 0 },
  { className: 'X OTKP', mapelColumn: 8, teacherColumn: 12, teacherIndex: 1 },
  { className: 'XI RPL', mapelColumn: 13, teacherColumn: 16, teacherIndex: 0 },
  { className: 'XI TKJ', mapelColumn: 14, teacherColumn: 16, teacherIndex: 1 },
  { className: 'XI AKL', mapelColumn: 15, teacherColumn: 16, teacherIndex: 2 },
  { className: 'XII RPL', mapelColumn: 21, teacherColumn: 23, teacherIndex: 0 },
  { className: 'XII TKJ', mapelColumn: 22, teacherColumn: 23, teacherIndex: 1 },
  { className: 'XII AKL', mapelColumn: 24, teacherColumn: 25 },
];

const commonFallbackSubjects = [
  'Pendidikan Agama dan Budi Pekerti',
  'Pendidikan Pancasila dan Kewarganegaraan',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Sejarah',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan',
  'Seni Budaya dan Keterampilan',
  'IPAS',
  'Informatika',
  'Mandarin',
];

const majorFallbackSubjects = {
  RPL: [
    'Sistem Komputer',
    'Pemrograman Dasar',
    'Dasar Desain Grafis',
    'Pemrograman Web',
    'Basis Data',
    'Pemrograman Berorientasi Objek',
    'Pemodelan Perangkat Lunak',
    'Koding',
  ],
  TKJ: [
    'Sistem Komputer',
    'Komputer dan Jaringan Dasar',
    'Dasar Desain Grafis',
    'Administrasi Infrastruktur Jaringan',
    'Administrasi Sistem Jaringan',
    'Teknologi Layanan Jaringan',
    'Wide Area Network',
    'Koding',
  ],
  AKL: [
    'Ekonomi Bisnis',
    'Akuntansi Dasar',
    'Perbankan Dasar',
    'Akuntansi Keuangan',
    'Administrasi Pajak',
    'Komputer Akuntansi',
    'Praktikum Akuntansi Lembaga/Instansi Pemerintah',
    'Praktikum Akuntansi Perusahaan Jasa, Dagang dan Manufaktur',
    'Aplikasi Pengolah Angka/Perkantoran',
  ],
  OTKP: [
    'Ekonomi Bisnis',
    'Administrasi Umum',
    'Korespondensi',
    'Kearsipan',
    'Teknologi Perkantoran',
    'Aplikasi Pengolah Angka/Perkantoran',
  ],
};

function normalizeRosterDay(value) {
  const day = clean(value).replace(/\s+/g, '').toUpperCase();
  if (day === 'SENIN') return 'Senin';
  if (day === 'SELASA') return 'Selasa';
  if (day === 'RABU') return 'Rabu';
  if (day === 'KAMIS') return 'Kamis';
  if (day === 'JUMAT') return 'Jumat';
  return null;
}

function parseRosterTime(value) {
  const text = clean(value).replace(/WIB/gi, '').replace(/\s+/g, ' ');
  const match = text.match(/(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  return {
    start: `${match[1].padStart(2, '0')}:${match[2]}`,
    end: `${match[3].padStart(2, '0')}:${match[4]}`,
  };
}

function durationInMinutes(start, end) {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return ((endHour * 60) + endMinute) - ((startHour * 60) + startMinute);
}

function extractTeacherCode(value, index = 0) {
  const text = clean(value);
  if (!text || text.toUpperCase() === 'NN') return null;
  const codes = text.split('/').map((item) => clean(item)).filter(Boolean);
  const selected = codes[index] || codes[0];
  return selected && selected.toUpperCase() !== 'NN' ? selected : null;
}

function getRosterTeacherRows() {
  return readRows(ROSTER_FILE)
    .map((row) => clean(row[27]))
    .map((value) => value.match(/^(\d+)\.\s*(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      code: match[1],
      name: clean(match[2]),
    }));
}

function getRosterEntries() {
  if (!fs.existsSync(ROSTER_FILE)) {
    console.warn(`Roster terbaru tidak ditemukan: ${ROSTER_FILE}. Seed memakai fallback roster sintetis.`);
    return { lessons: [], activities: [] };
  }

  const rows = readRows(ROSTER_FILE);
  const lessons = [];
  const activities = [];
  let currentDay = 'Senin';

  rows.slice(3).forEach((row) => {
    const day = normalizeRosterDay(row[0]);
    if (day) currentDay = day;

    const time = parseRosterTime(row[2]);
    if (!time || !currentDay) return;

    const les = Number.parseInt(clean(row[1]), 10);
    const timeText = clean(row[2]);
    const firstSubject = normalizeSubjectName(row[3]);
    const firstSubjectIsActivity = activitySubjects.includes(firstSubject);
    const activityText = timeText.toUpperCase().includes('IBADAH')
      ? 'Ibadah dan Bina Mental'
      : firstSubjectIsActivity
        ? firstSubject
        : '';
    const hasLessonData = rosterClassColumns.some((column) => {
      const subject = normalizeSubjectName(row[column.mapelColumn]);
      return subject && !isRemovedSubject(subject) && !(column.mapelColumn === 3 && firstSubjectIsActivity);
    });

    if (!hasLessonData && (!Number.isInteger(les) || activityText || durationInMinutes(time.start, time.end) <= 20)) {
      const activity = activityText || 'Istirahat';
      activities.push({
        hari: currentDay,
        jam_mulai: time.start,
        jam_berakhir: time.end,
        mapel: activity === 'MBG / Istirahat' ? 'Istirahat' : normalizeSubjectName(activity),
      });
      return;
    }

    if (!Number.isInteger(les)) return;

    for (const column of rosterClassColumns) {
      const mapel = normalizeSubjectName(row[column.mapelColumn]);
      if (!mapel || isRemovedSubject(mapel)) continue;

      lessons.push({
        className: column.className,
        hari: currentDay,
        les,
        jam_mulai: time.start,
        jam_berakhir: time.end,
        mapel,
        teacherCode: extractTeacherCode(row[column.teacherColumn], column.teacherIndex || 0),
      });
    }
  });

  if (!activities.some((item) => item.hari === 'Jumat' && item.mapel === 'Ibadah dan Bina Mental')) {
    activities.push({
      hari: 'Jumat',
      jam_mulai: '14:00',
      jam_berakhir: '15:30',
      mapel: 'Ibadah dan Bina Mental',
    });
  }

  return { lessons, activities };
}

function teacherSlotKey(guru, slot) {
  return `${guru.id_guru}|${slot.hari}|${slot.start}|${slot.end}`;
}

function findExactMapelGurus(guruProfiles, subject) {
  return guruProfiles.filter((guru) => guru.mapel_name === subject);
}

function isTeacherBusyAtSlot(guru, occupiedTeacherSlots, slot) {
  return Boolean(slot && occupiedTeacherSlots?.has(teacherSlotKey(guru, slot)));
}

function sortTeacherCandidates(candidates, { occupiedTeacherSlots, slot, teacherLoad, preferredGuruId = null }) {
  return [...candidates].sort((a, b) => {
    const busyDelta = Number(isTeacherBusyAtSlot(a, occupiedTeacherSlots, slot))
      - Number(isTeacherBusyAtSlot(b, occupiedTeacherSlots, slot));
    if (busyDelta !== 0) return busyDelta;

    const loadDelta = (teacherLoad?.get(a.id_guru) || 0) - (teacherLoad?.get(b.id_guru) || 0);
    if (loadDelta !== 0) return loadDelta;

    const preferredDelta = Number(b.id_guru === preferredGuruId) - Number(a.id_guru === preferredGuruId);
    if (preferredDelta !== 0) return preferredDelta;

    return a.nama_guru.localeCompare(b.nama_guru, 'id');
  });
}

function resolveRosterTeacher({
  subject,
  teacherCode,
  rosterTeacherByCode,
  guruByNormalizedName,
  guruProfiles,
  occupiedTeacherSlots,
  teacherLoad,
  slot,
}) {
  const candidates = [];
  const rosterTeacher = teacherCode ? rosterTeacherByCode.get(String(teacherCode)) : null;
  let preferredGuruId = null;

  if (rosterTeacher) {
    const exactGuru = guruByNormalizedName.get(normalizeName(rosterTeacher.name));
    if (exactGuru?.mapel_name === subject) {
      candidates.push(exactGuru);
      preferredGuruId = exactGuru.id_guru;
    }
  }

  for (const guru of findExactMapelGurus(guruProfiles, subject)) {
    if (!candidates.some((candidate) => candidate.id_guru === guru.id_guru)) {
      candidates.push(guru);
    }
  }

  if (candidates.length > 0) {
    return sortTeacherCandidates(candidates, { occupiedTeacherSlots, slot, teacherLoad, preferredGuruId })
      .find((guru) => !isTeacherBusyAtSlot(guru, occupiedTeacherSlots, slot)) || null;
  }

  return null;
}

function classSlotKey(kelas, slot) {
  return `${kelas.id_kelas}|${slot.hari}|${slot.start}|${slot.end}`;
}

function classDayKey(kelas, hari) {
  return `${kelas.id_kelas}|${hari}`;
}

function classDaySubjectKey(kelas, hari, subject) {
  return `${kelas.id_kelas}|${hari}|${subject}`;
}

function teachingAssignmentKey(guru, kelas, mapel) {
  return `${guru.id_guru}|${kelas.id_kelas}|${mapel.id_mapel}`;
}

function createScheduleLimiter() {
  return {
    occupiedTeacherSlots: new Set(),
    occupiedClassSlots: new Set(),
    classDayLessonCount: new Map(),
    classDaySubjects: new Set(),
    teachingAssignmentLessonCount: new Map(),
    teacherLoad: new Map(),
    skipped: {
      batasLesHarian: 0,
      batasMengajarMapelKelas: 0,
      mapelBerulang: 0,
      kelasBentrok: 0,
      guruTidakTersedia: 0,
    },
  };
}

function tryCreateLessonSchedule({
  entry,
  kelas,
  mapel,
  guru,
  limiter,
  getOrCreateMengajarRecord,
  jadwalRecords,
  tahunAjaranId,
}) {
  const slot = {
    hari: entry.hari,
    start: entry.jam_mulai,
    end: entry.jam_berakhir,
  };
  const dayKey = classDayKey(kelas, entry.hari);
  const subjectKey = classDaySubjectKey(kelas, entry.hari, entry.mapel);
  const lessonCount = limiter.classDayLessonCount.get(dayKey) || 0;

  if (lessonCount >= MAX_LESSONS_PER_CLASS_DAY) {
    limiter.skipped.batasLesHarian += 1;
    return false;
  }

  if (limiter.classDaySubjects.has(subjectKey)) {
    limiter.skipped.mapelBerulang += 1;
    return false;
  }

  if (limiter.occupiedClassSlots.has(classSlotKey(kelas, slot))) {
    limiter.skipped.kelasBentrok += 1;
    return false;
  }

  if (!guru || isTeacherBusyAtSlot(guru, limiter.occupiedTeacherSlots, slot)) {
    limiter.skipped.guruTidakTersedia += 1;
    return false;
  }

  const assignmentKey = teachingAssignmentKey(guru, kelas, mapel);
  const assignmentLessonCount = limiter.teachingAssignmentLessonCount.get(assignmentKey) || 0;
  if (assignmentLessonCount >= MAX_LESSONS_PER_TEACHING_ASSIGNMENT) {
    limiter.skipped.batasMengajarMapelKelas += 1;
    return false;
  }

  const mengajar = getOrCreateMengajarRecord({ kelas, mapel, guru });
  limiter.occupiedClassSlots.add(classSlotKey(kelas, slot));
  limiter.occupiedTeacherSlots.add(teacherSlotKey(guru, slot));
  limiter.classDayLessonCount.set(dayKey, lessonCount + 1);
  limiter.classDaySubjects.add(subjectKey);
  limiter.teachingAssignmentLessonCount.set(assignmentKey, assignmentLessonCount + 1);
  limiter.teacherLoad.set(guru.id_guru, (limiter.teacherLoad.get(guru.id_guru) || 0) + 1);

  jadwalRecords.push({
    id_jadwal: randomUUID(),
    kelas_id: kelas.id_kelas,
    mapel_id: mapel.id_mapel,
    guru_id: guru.id_guru,
    tahun_ajaran_id: tahunAjaranId,
    mengajar_id: mengajar.id_mengajar,
    hari: entry.hari,
    jam_mulai: entry.jam_mulai,
    jam_berakhir: entry.jam_berakhir,
    les: entry.les,
  });

  return true;
}

function fallbackSubjectsForClass(classNameValue) {
  const [level, major] = clean(classNameValue).split(/\s+/);
  const subjects = [
    ...commonFallbackSubjects,
    ...(majorFallbackSubjects[major] || majorFallbackSubjects.RPL),
  ];

  if (level === 'X') {
    return subjects.filter((subject) => ![
      'Praktikum Akuntansi Lembaga/Instansi Pemerintah',
      'Praktikum Akuntansi Perusahaan Jasa, Dagang dan Manufaktur',
    ].includes(subject));
  }

  return subjects;
}

function compareRosterLesson(a, b) {
  return schoolDays.indexOf(a.hari) - schoolDays.indexOf(b.hari)
    || a.jam_mulai.localeCompare(b.jam_mulai)
    || a.les - b.les;
}

function fallbackTemplateClassesFor(classNameValue) {
  const [level, major] = clean(classNameValue).split(/\s+/);
  const candidates = [];

  if (major === 'OTKP') {
    candidates.push(`${level} AKL`);
  }

  candidates.push(`${level} ${major}`, `${level} RPL`, `${level} TKJ`, `${level} AKL`, 'X OTKP');

  return [...new Set(candidates.filter((candidate) => candidate !== clean(classNameValue)))];
}

function buildFallbackLessonTemplate(rosterLessons, classNameValue) {
  for (const templateClass of fallbackTemplateClassesFor(classNameValue)) {
    const templateLessons = rosterLessons
      .filter((entry) => entry.className === templateClass)
      .sort(compareRosterLesson);

    if (templateLessons.length > 0) {
      return templateLessons.map((entry) => ({
        hari: entry.hari,
        les: entry.les,
        start: entry.jam_mulai,
        end: entry.jam_berakhir,
      }));
    }
  }

  return schoolDays.flatMap((hari) => dailyLessonSlots[hari]
    .filter((slot) => !slot.activity)
    .map((slot) => ({
      hari,
      les: slot.les,
      start: slot.start,
      end: slot.end,
    })));
}

function buildScheduleDemandLessons(rosterLessons, classNames) {
  const lessons = rosterLessons.map((entry) => ({
    className: entry.className,
    hari: entry.hari,
    les: entry.les,
    jam_mulai: entry.jam_mulai,
    jam_berakhir: entry.jam_berakhir,
    mapel: entry.mapel,
  }));

  const classesWithRoster = new Set(rosterLessons.map((entry) => entry.className));

  for (const classNameValue of classNames) {
    if (classesWithRoster.has(classNameValue)) continue;

    const fallbackSubjects = fallbackSubjectsForClass(classNameValue);
    const fallbackLessonTemplate = buildFallbackLessonTemplate(rosterLessons, classNameValue);
    const pairSubjectByGroup = new Map();
    let rotationIndex = 0;

    for (const slot of fallbackLessonTemplate) {
      const pairGroup = `${slot.hari}|${Math.floor((slot.les - 1) / 2)}`;
      if (!pairSubjectByGroup.has(pairGroup)) {
        pairSubjectByGroup.set(pairGroup, fallbackSubjects[rotationIndex % fallbackSubjects.length]);
        rotationIndex += 1;
      }

      lessons.push({
        className: classNameValue,
        hari: slot.hari,
        les: slot.les,
        jam_mulai: slot.start,
        jam_berakhir: slot.end,
        mapel: pairSubjectByGroup.get(pairGroup),
      });
    }
  }

  return lessons;
}

function attendanceStatusForStudentDate(student, date) {
  const dayIndex = Math.floor((date.getTime() - Date.UTC(2026, 0, 5)) / 86400000);
  const seed = scoreFor(student.siswa_id, dayIndex);

  if (seed % 89 === 0) return 'Alpha';
  if (seed % 43 === 0) return 'Izin';
  if (seed % 37 === 0) return 'Sakit';
  return 'Hadir';
}

async function clearExistingData() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "rapor",
      "rapor_ekstrakurikuler",
      "rapor_catatan_wali",
      "ekstrakurikuler",
      "nilai_tugas",
      "penilaian_harian",
      "penilaian_tengah_semester",
      "penilaian_akhir_semester",
      "absensi",
      "jadwal",
      "mengajar",
      "riwayat_kelas_siswa",
      "berita",
      "siswa_profiles",
      "kepala_sekolah_profiles",
      "guru_profiles",
      "admin_profiles",
      "kelas",
      "jurusan",
      "mata_pelajaran",
      "tahun_ajaran",
      "semesters",
      "users"
    RESTART IDENTITY CASCADE
  `);
}

async function main() {
  const students = getStudents();
  const teachers = getTeachers();
  const staffRows = getStaffRows();
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const now = new Date();

  console.log(`Membaca ${students.length} siswa, ${teachers.length} guru, ${staffRows.length} tenaga kependidikan.`);

  ensureDefaultProfilePhoto();
  await clearExistingData();

  const tahunAjaran = {
    id_tahun_ajaran: randomUUID(),
    tahun: '2025/2026',
    status: 'AKTIF',
  };

  const tahunAjaranLalu = {
    id_tahun_ajaran: randomUUID(),
    tahun: '2024/2025',
    status: 'NON_AKTIF',
  };

  const semesterGenap = {
    id_semester: randomUUID(),
    semester: 'GENAP',
    status: 'AKTIF',
  };

  const semesterGanjil = {
    id_semester: randomUUID(),
    semester: 'GANJIL',
    status: 'NON_AKTIF',
  };

  const pramukaRecord = {
    id_ekstrakurikuler: randomUUID(),
    nama: 'Pramuka',
    status: 'AKTIF',
  };

  const majors = [...new Set(students.map((student) => student.jurusan))].sort();
  const jurusanByName = new Map();
  for (const major of majors) {
    const jurusan = {
      id_jurusan: randomUUID(),
      jurusan: major,
      status: 'AKTIF',
    };
    jurusanByName.set(major, jurusan);
  }

  const roster = getRosterEntries();
  const classNamesFromStudents = [...new Set(students.map((student) => className(student.level, student.jurusan)))].sort();
  const scheduleDemandLessons = buildScheduleDemandLessons(roster.lessons, classNamesFromStudents);

  const rosterMapel = scheduleDemandLessons.map((entry) => entry.mapel);
  const mapelValues = [...new Set([...teachers.map((teacher) => teacher.mapel), ...rosterMapel, ...supplementalMapel])]
    .filter((name) => name && !isRemovedSubject(name))
    .sort();
  const mapelByName = new Map();
  for (const name of mapelValues) {
    const mapel = {
      id_mapel: randomUUID(),
      mapel: name,
      kelompok: getKelompokMapel(name),
    };
    mapelByName.set(name, mapel);
  }

  const users = [];
  const adminProfiles = [];
  const kepsekProfiles = [];
  const guruProfiles = [];
  const siswaProfiles = [];
  const kelasRecords = [];
  const riwayatRecords = [];
  const mengajarRecords = [];
  const beritaRecords = [];
  const jadwalRecords = [];
  const absensiRecords = [];
  const nilaiTugasRecords = [];
  const penilaianHarianRecords = [];
  const ptsRecords = [];
  const pasRecords = [];
  const raporRecords = [];
  const raporEkstrakurikulerRecords = [];
  const raporCatatanWaliRecords = [];
  const siswaByKelasId = new Map();

  const staffByTask = new Map(staffRows.map((staff) => [staff.tugas.toLowerCase(), staff]));

  const adminStaff = staffByTask.get('operator sekolah') || staffRows[2];
  const adminUserId = randomUUID();
  users.push({
    id_users: adminUserId,
    username: 'admin',
    email: `admin@${LOCAL_EMAIL_DOMAIN}`,
    password,
    role: 'admin',
    is_active: true,
    created_at: now,
    updated_at: now,
  });
  adminProfiles.push({
    id_admin: randomUUID(),
    users_id: adminUserId,
    nama_admin: adminStaff?.nama || 'Admin SMK Parulian 1',
    jenis_kelamin: 'Perempuan',
    no_hp: adminStaff?.no_hp || '-',
    foto: DEFAULT_PROFILE_FOTO,
  });
  beritaRecords.push(
    {
      id_berita: randomUUID(),
      foto: DEFAULT_PROFILE_FOTO,
      judul: 'Kegiatan Belajar Semester Genap',
      content: 'SMK Swasta Parulian 1 Medan melaksanakan kegiatan belajar semester genap tahun ajaran 2025/2026 dengan jadwal pembelajaran aktif.',
      admin_id: adminProfiles[0].id_admin,
      jenis_berita: 'Akademik',
      tanggal_publikasi: new Date('2026-02-03T00:00:00.000Z'),
    },
    {
      id_berita: randomUUID(),
      foto: DEFAULT_PROFILE_FOTO,
      judul: 'Pengumuman Administrasi Siswa',
      content: 'Seluruh siswa diminta memastikan data biodata, kelas, dan nomor kontak orang tua atau wali sudah sesuai pada sistem sekolah.',
      admin_id: adminProfiles[0].id_admin,
      jenis_berita: 'Pengumuman',
      tanggal_publikasi: new Date('2026-02-10T00:00:00.000Z'),
    },
    {
      id_berita: randomUUID(),
      foto: DEFAULT_PROFILE_FOTO,
      judul: 'Pembinaan Kompetensi Keahlian',
      content: 'Program keahlian AKL, RPL, TKJ, dan OTKP melaksanakan pembinaan kompetensi untuk mendukung kesiapan akademik dan praktik siswa.',
      admin_id: adminProfiles[0].id_admin,
      jenis_berita: 'Kegiatan_Prestasi',
      tanggal_publikasi: new Date('2026-02-17T00:00:00.000Z'),
    },
  );

  const kepsekStaff = staffByTask.get('kepala sekolah') || staffRows[0];
  const kepsekUserId = randomUUID();
  users.push({
    id_users: kepsekUserId,
    username: 'kepsek',
    email: `kepsek@${LOCAL_EMAIL_DOMAIN}`,
    password,
    role: 'kepala_sekolah',
    is_active: true,
    created_at: now,
    updated_at: now,
  });
  kepsekProfiles.push({
    id_kepsek: randomUUID(),
    users_id: kepsekUserId,
    nama_ks: kepsekStaff?.nama || 'Kepala Sekolah',
    tgl_lahir: kepsekStaff?.tgl_lahir || new Date('1990-01-01T00:00:00.000Z'),
    gender: 'Wanita',
    agama: 'Kristen',
    pendidikan_tertinggi: educationFromName(kepsekStaff?.nama || ''),
    no_hp: kepsekStaff?.no_hp || '081265001001',
    mulai_menjabat: new Date('2025-07-01T00:00:00.000Z'),
    selesai_menjabat: null,
    status_jabatan: 'AKTIF',
    foto: DEFAULT_PROFILE_FOTO,
  });

  const guruByMapel = new Map();
  for (const teacher of teachers) {
    const teacherMapel = isRemovedSubject(teacher.mapel) ? '' : teacher.mapel;
    const teacherMapelRecord = teacherMapel ? mapelByName.get(teacherMapel) : null;
    const username = teacherUsername(teacher.nama_guru);
    const userId = randomUUID();
    const guru = {
      id_guru: randomUUID(),
      users_id: userId,
      nama_guru: teacher.nama_guru,
      tgl_lahir: teacher.tgl_lahir,
      gender: teacher.gender,
      agama: teacher.agama,
      pendidikan_tertinggi: teacher.pendidikan_tertinggi,
      no_hp: teacher.no_hp,
      foto: DEFAULT_PROFILE_FOTO,
      mapel_id: teacherMapelRecord?.id_mapel || null,
    };
    Object.defineProperty(guru, 'mapel_name', {
      value: teacherMapel,
      enumerable: false,
    });

    users.push({
      id_users: userId,
      username,
      email: `${username}@${LOCAL_EMAIL_DOMAIN}`,
      password,
      role: 'guru',
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    guruProfiles.push(guru);

    if (!teacherMapel) {
      continue;
    }

    if (!guruByMapel.has(teacherMapel)) {
      guruByMapel.set(teacherMapel, []);
    }
    guruByMapel.get(teacherMapel).push(guru);
  }

  const classKeys = [...new Set(students.map((student) => `${student.level}|${student.jurusan}`))].sort();
  const kelasByKey = new Map();
  const usedHomeroomTeacherIds = new Set();
  for (const key of classKeys) {
    const [level, major] = key.split('|');
    const namaKelas = className(level, major);
    const kelas = {
      id_kelas: randomUUID(),
      nama_kelas: namaKelas,
      ruang_kelas: `Ruang ${namaKelas}`,
      guru_id: pickHomeroomTeacherId(major, guruByMapel, usedHomeroomTeacherIds),
      jurusan_id: jurusanByName.get(major).id_jurusan,
      tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
      status: 'AKTIF',
    };
    kelasByKey.set(key, kelas);
    kelasRecords.push(kelas);
  }

  for (const student of students) {
    const username = `siswa.${student.nisn}`.slice(0, 50);
    const userId = randomUUID();
    const siswaId = randomUUID();
    const kelasId = kelasByKey.get(`${student.level}|${student.jurusan}`).id_kelas;
    const riwayatId = randomUUID();

    users.push({
      id_users: userId,
      username,
      email: `${username}@${LOCAL_EMAIL_DOMAIN}`,
      password,
      role: 'siswa',
      is_active: true,
      created_at: now,
      updated_at: now,
    });
    siswaProfiles.push({
      id_siswa: siswaId,
      users_id: userId,
      npsn: student.npsn,
      nis: student.nis,
      nisn: student.nisn,
      foto: DEFAULT_PROFILE_FOTO,
      nama_siswa: student.nama_siswa,
      gender: student.gender,
      tempat_tgl_lahir: student.tempat_tgl_lahir,
      nama_ayah: student.nama_ayah,
      pekerjaan_ayah: student.pekerjaan_ayah,
      nama_ibu: student.nama_ibu,
      pekerjaan_ibu: student.pekerjaan_ibu,
      alamat: student.alamat,
      desa_kelurahan: student.desa_kelurahan,
      kecamatan: student.kecamatan,
      kabupaten_kota: student.kabupaten_kota,
      provinsi: student.provinsi,
      no_hp_wali: student.no_hp_wali,
      status_siswa: 'Aktif',
    });
    riwayatRecords.push({
      id_riwayat: riwayatId,
      siswa_id: siswaId,
      kelas_id: kelasId,
      tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
      status_kenaikan: 'Sedang_Belajar',
    });

    if (!siswaByKelasId.has(kelasId)) {
      siswaByKelasId.set(kelasId, []);
    }
    siswaByKelasId.get(kelasId).push({
      siswa_id: siswaId,
      riwayat_id: riwayatId,
      nama_siswa: student.nama_siswa,
    });
  }

  const alumniSamples = students.filter((student) => student.level === 'XII').slice(0, 8);
  alumniSamples.forEach((student, index) => {
    const nomor = String(index + 1).padStart(3, '0');
    const username = `alumni.${nomor}`;
    const userId = randomUUID();
    const siswaId = randomUUID();
    const kelasId = kelasByKey.get(`${student.level}|${student.jurusan}`).id_kelas;

    users.push({
      id_users: userId,
      username,
      email: `${username}@${LOCAL_EMAIL_DOMAIN}`,
      password,
      role: 'siswa',
      is_active: false,
      created_at: now,
      updated_at: now,
    });
    siswaProfiles.push({
      id_siswa: siswaId,
      users_id: userId,
      npsn: student.npsn,
      nis: `AL-${nomor}`,
      nisn: `ALUMNI-${nomor}`,
      foto: DEFAULT_PROFILE_FOTO,
      nama_siswa: `${student.nama_siswa} Alumni`,
      gender: student.gender,
      tempat_tgl_lahir: student.tempat_tgl_lahir,
      nama_ayah: student.nama_ayah,
      pekerjaan_ayah: student.pekerjaan_ayah,
      nama_ibu: student.nama_ibu,
      pekerjaan_ibu: student.pekerjaan_ibu,
      alamat: student.alamat,
      desa_kelurahan: student.desa_kelurahan,
      kecamatan: student.kecamatan,
      kabupaten_kota: student.kabupaten_kota,
      provinsi: student.provinsi,
      no_hp_wali: student.no_hp_wali,
      status_siswa: 'Alumni',
      tahun_lulus: 2025,
    });
    riwayatRecords.push({
      id_riwayat: randomUUID(),
      siswa_id: siswaId,
      kelas_id: kelasId,
      tahun_ajaran_id: tahunAjaranLalu.id_tahun_ajaran,
      status_kenaikan: 'Tamat',
    });
  });

  const mapelNameById = new Map([...mapelByName.values()].map((mapel) => [mapel.id_mapel, mapel.mapel]));
  const kelasByName = new Map([...kelasByKey.values()].map((kelas) => [kelas.nama_kelas, kelas]));
  const rosterTeacherByCode = new Map(getRosterTeacherRows().map((teacher) => [teacher.code, teacher]));
  const guruByNormalizedName = new Map(guruProfiles.map((guru) => [normalizeName(guru.nama_guru), guru]));
  const mengajarByKey = new Map();
  const classIdsWithRosterLessons = new Set();
  const scheduleLimiter = createScheduleLimiter();

  const getOrCreateMengajarRecord = ({ kelas, mapel, guru }) => {
    const key = `${kelas.id_kelas}|${mapel.id_mapel}|${guru.id_guru}`;
    if (mengajarByKey.has(key)) return mengajarByKey.get(key);

    const record = {
      id_mengajar: randomUUID(),
      guru_id: guru.id_guru,
      mapel_id: mapel.id_mapel,
      kelas_id: kelas.id_kelas,
      tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
      semester_id: semesterGenap.id_semester,
      total_pertemuan: 24,
    };

    mengajarByKey.set(key, record);
    mengajarRecords.push(record);
    return record;
  };

  for (const entry of roster.lessons) {
    const kelas = kelasByName.get(entry.className);
    const mapel = mapelByName.get(entry.mapel);
    if (!kelas || !mapel) continue;

    const guru = resolveRosterTeacher({
      subject: entry.mapel,
      className: entry.className,
      teacherCode: entry.teacherCode,
      rosterTeacherByCode,
      guruByNormalizedName,
      guruProfiles,
      occupiedTeacherSlots: scheduleLimiter.occupiedTeacherSlots,
      teacherLoad: scheduleLimiter.teacherLoad,
      slot: {
        hari: entry.hari,
        start: entry.jam_mulai,
        end: entry.jam_berakhir,
      },
    });

    if (tryCreateLessonSchedule({
      entry,
      kelas,
      mapel,
      guru,
      limiter: scheduleLimiter,
      getOrCreateMengajarRecord,
      jadwalRecords,
      tahunAjaranId: tahunAjaran.id_tahun_ajaran,
    })) {
      classIdsWithRosterLessons.add(kelas.id_kelas);
    }
  }

  const activityKeys = new Set();
  for (const activity of roster.activities) {
    const activityMapel = mapelByName.get(activity.mapel);
    if (!activityMapel) continue;

    for (const kelas of kelasByKey.values()) {
      const defaultGuruId = kelas.guru_id || guruProfiles[0]?.id_guru;
      if (!defaultGuruId) continue;

      const key = `${kelas.id_kelas}|${activity.hari}|${activity.jam_mulai}|${activity.jam_berakhir}|${activity.mapel}`;
      if (activityKeys.has(key)) continue;
      activityKeys.add(key);

      jadwalRecords.push({
        id_jadwal: randomUUID(),
        kelas_id: kelas.id_kelas,
        mapel_id: activityMapel.id_mapel,
        guru_id: defaultGuruId,
        tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
        mengajar_id: null,
        hari: activity.hari,
        jam_mulai: activity.jam_mulai,
        jam_berakhir: activity.jam_berakhir,
        les: 0,
      });
    }
  }

  for (const kelas of kelasByKey.values()) {
    if (classIdsWithRosterLessons.has(kelas.id_kelas)) continue;

    const fallbackSubjects = fallbackSubjectsForClass(kelas.nama_kelas);
    const fallbackLessonTemplate = buildFallbackLessonTemplate(roster.lessons, kelas.nama_kelas);
    const pairSubjectByGroup = new Map();
    let rotationIndex = 0;

    for (const slot of fallbackLessonTemplate) {
      const pairGroup = `${slot.hari}|${Math.floor((slot.les - 1) / 2)}`;
      if (!pairSubjectByGroup.has(pairGroup)) {
        pairSubjectByGroup.set(pairGroup, fallbackSubjects[rotationIndex % fallbackSubjects.length]);
        rotationIndex += 1;
      }

      const subject = pairSubjectByGroup.get(pairGroup);
      const mapel = mapelByName.get(subject);
      if (!mapel) continue;

      const entry = {
        className: kelas.nama_kelas,
        hari: slot.hari,
        les: slot.les,
        jam_mulai: slot.start,
        jam_berakhir: slot.end,
        mapel: subject,
      };
      const guru = resolveRosterTeacher({
        subject,
        className: kelas.nama_kelas,
        teacherCode: null,
        rosterTeacherByCode,
        guruByNormalizedName,
        guruProfiles,
        occupiedTeacherSlots: scheduleLimiter.occupiedTeacherSlots,
        teacherLoad: scheduleLimiter.teacherLoad,
        slot: {
          hari: slot.hari,
          start: slot.start,
          end: slot.end,
        },
      });

      tryCreateLessonSchedule({
        entry,
        kelas,
        mapel,
        guru,
        limiter: scheduleLimiter,
        getOrCreateMengajarRecord,
        jadwalRecords,
        tahunAjaranId: tahunAjaran.id_tahun_ajaran,
      });
    }
  }

  console.log(
    `Roster disaring: ${jadwalRecords.filter((jadwal) => jadwal.les !== 0).length} jadwal pelajaran aktif, maksimal ${MAX_LESSONS_PER_CLASS_DAY} les/kelas/hari dan ${MAX_LESSONS_PER_TEACHING_ASSIGNMENT} les/guru-mapel-kelas. Dilewati karena batas harian ${scheduleLimiter.skipped.batasLesHarian}, batas guru-mapel-kelas ${scheduleLimiter.skipped.batasMengajarMapelKelas}, mapel berulang ${scheduleLimiter.skipped.mapelBerulang}, kelas bentrok ${scheduleLimiter.skipped.kelasBentrok}, guru tidak tersedia ${scheduleLimiter.skipped.guruTidakTersedia}.`
  );

  const pendingMengajarIds = new Set(
    mengajarRecords
      .filter((_, index) => index % 13 === 0)
      .map((mengajar) => mengajar.id_mengajar)
  );
  const mengajarByClassId = new Map();
  for (const mengajar of mengajarRecords) {
    if (!mengajarByClassId.has(mengajar.kelas_id)) {
      mengajarByClassId.set(mengajar.kelas_id, []);
    }
    mengajarByClassId.get(mengajar.kelas_id).push(mengajar);
  }

  for (const mengajar of mengajarRecords) {
    const classStudents = siswaByKelasId.get(mengajar.kelas_id) || [];
    const mapel = mapelNameById.get(mengajar.mapel_id) || 'Mata Pelajaran';

    for (const [studentIndex, student] of classStudents.entries()) {
      const base = scoreFor(student.siswa_id, mengajar.id_mengajar);
      const tugasScores = [
        clampScore(base - 2),
        clampScore(base + 1),
        clampScore(base + 3),
        clampScore(base),
      ];
      const phScores = [
        clampScore(base - 1),
        clampScore(base + 2),
        clampScore(base + 4),
        clampScore(base + 1),
      ];
      const pts = clampScore(base + 2);
      const pas = clampScore(base + 3);
      const rataTugas = tugasScores.reduce((total, score) => total + score, 0) / tugasScores.length;
      const rataPh = phScores.reduce((total, score) => total + score, 0) / phScores.length;
      const nilaiAkhir = Number(((rataTugas * 0.2) + (rataPh * 0.3) + (pts * 0.2) + (pas * 0.3)).toFixed(2));

      ['TUGAS_1', 'TUGAS_2', 'TUGAS_3', 'TUGAS_4'].forEach((penilaianKe, index) => {
        nilaiTugasRecords.push({
          id_nilai_tugas: randomUUID(),
          mengajar_id: mengajar.id_mengajar,
          siswa_id: student.siswa_id,
          penilaian_ke: penilaianKe,
          nilai_tugas: tugasScores[index],
          jenis_nilai: 'PENGETAHUAN',
        });
      });

      ['PH_1', 'PH_2', 'PH_3', 'PH_4'].forEach((penilaianKe, index) => {
        penilaianHarianRecords.push({
          id_penilaian_harian: randomUUID(),
          mengajar_id: mengajar.id_mengajar,
          siswa_id: student.siswa_id,
          penilaian_ke: penilaianKe,
          nilai_penilaian_harian: phScores[index],
          jenis_nilai: 'PENGETAHUAN',
        });
      });

      ptsRecords.push({
        id_penilaian_tengah_semester: randomUUID(),
        mengajar_id: mengajar.id_mengajar,
        siswa_id: student.siswa_id,
        pts,
      });

      pasRecords.push({
        id_penilaian_akhir_semester: randomUUID(),
        mengajar_id: mengajar.id_mengajar,
        siswa_id: student.siswa_id,
        pas,
      });

      const isPendingRapor = pendingMengajarIds.has(mengajar.id_mengajar);
      raporRecords.push({
        id_rapor: randomUUID(),
        riwayat_kelas_siswa_id: student.riwayat_id,
        mengajar_id: mengajar.id_mengajar,
        semester_id: semesterGenap.id_semester,
        kktp: '75',
        nilai_akhir: nilaiAkhir,
        capaian_kompetensi: achievementText(mapel, nilaiAkhir),
        status_acc: isPendingRapor ? 'PENDING' : 'DISETUJUI',
        kepala_sekolah_id: isPendingRapor ? null : kepsekProfiles[0].id_kepsek,
        tgl_acc: isPendingRapor ? null : new Date('2026-03-09T00:00:00.000Z'),
      });

      for (let meeting = 1; meeting <= 24; meeting += 1) {
        const tglAbsensi = new Date(Date.UTC(2026, 0, 5 + ((meeting - 1) * 7) + (studentIndex % 5)));
        const keterangan = attendanceStatusForStudentDate(student, tglAbsensi);
        absensiRecords.push({
          id_absensi: randomUUID(),
          tahun_ajaran_id: tahunAjaran.id_tahun_ajaran,
          semester_id: semesterGenap.id_semester,
          siswa_id: student.siswa_id,
          mengajar_id: mengajar.id_mengajar,
          tgl_absensi: tglAbsensi,
          topik: limitText(meeting === 1 ? `Pengenalan materi ${mapel}` : `Pertemuan ${meeting}: latihan kompetensi ${mapel}`),
          pertemuan: String(meeting),
          keterangan,
          catatan_sikap: limitText(keterangan === 'Hadir' ? 'Aktif mengikuti pembelajaran' : 'Perlu pemantauan wali kelas'),
        });
      }
    }
  }

  for (const kelas of kelasRecords) {
    const waliKelasId = kelas.guru_id || guruProfiles[0]?.id_guru;
    const classStudents = siswaByKelasId.get(kelas.id_kelas) || [];

    for (const [index, student] of classStudents.entries()) {
      const predikat = index % 9 === 0
        ? 'SANGAT_BAIK'
        : index % 7 === 0
          ? 'CUKUP'
          : 'BAIK';

      raporEkstrakurikulerRecords.push({
        id_rapor_ekstrakurikuler: randomUUID(),
        riwayat_kelas_siswa_id: student.riwayat_id,
        semester_id: semesterGenap.id_semester,
        ekstrakurikuler_id: pramukaRecord.id_ekstrakurikuler,
        wali_kelas_id: waliKelasId,
        predikat,
        keterangan: predikat === 'SANGAT_BAIK'
          ? 'Sangat aktif mengikuti kegiatan Pramuka'
          : predikat === 'CUKUP'
            ? 'Perlu lebih aktif mengikuti kegiatan Pramuka'
            : 'Aktif mengikuti kegiatan Pramuka',
      });

      raporCatatanWaliRecords.push({
        id_catatan_wali: randomUUID(),
        riwayat_kelas_siswa_id: student.riwayat_id,
        semester_id: semesterGenap.id_semester,
        wali_kelas_id: waliKelasId,
        catatan: `${student.nama_siswa} menunjukkan perkembangan belajar yang baik dan perlu terus mempertahankan kedisiplinan.`,
      });
    }
  }

  await prisma.tahunAjaran.createMany({ data: [tahunAjaranLalu, tahunAjaran] });
  await prisma.semester.createMany({ data: [semesterGenap, semesterGanjil] });
  await prisma.jurusan.createMany({ data: [...jurusanByName.values()] });
  await prisma.mataPelajaran.createMany({ data: [...mapelByName.values()] });
  await prisma.ekstrakurikuler.createMany({ data: [pramukaRecord] });
  await prisma.user.createMany({ data: users });
  await prisma.adminProfile.createMany({ data: adminProfiles });
  await prisma.kepalaSekolahProfile.createMany({ data: kepsekProfiles });
  await prisma.guruProfile.createMany({ data: guruProfiles });
  await prisma.berita.createMany({ data: beritaRecords });
  await prisma.kelas.createMany({ data: kelasRecords });
  await prisma.siswaProfile.createMany({ data: siswaProfiles });
  await prisma.riwayatKelasSiswa.createMany({ data: riwayatRecords });
  await prisma.mengajar.createMany({ data: mengajarRecords });
  await prisma.jadwal.createMany({ data: jadwalRecords });
  await createManyInChunks(prisma.absensi, absensiRecords);
  await createManyInChunks(prisma.nilaiTugas, nilaiTugasRecords);
  await createManyInChunks(prisma.penilaianHarian, penilaianHarianRecords);
  await createManyInChunks(prisma.penilaianTengahSemester, ptsRecords);
  await createManyInChunks(prisma.penilaianAkhirSemester, pasRecords);
  await createManyInChunks(prisma.rapor, raporRecords);
  await createManyInChunks(prisma.raporEkstrakurikuler, raporEkstrakurikulerRecords);
  await createManyInChunks(prisma.raporCatatanWali, raporCatatanWaliRecords);

  const counts = {
    users: await prisma.user.count(),
    admin: await prisma.adminProfile.count(),
    kepalaSekolah: await prisma.kepalaSekolahProfile.count(),
    guru: await prisma.guruProfile.count(),
    siswa: await prisma.siswaProfile.count(),
    jurusan: await prisma.jurusan.count(),
    kelas: await prisma.kelas.count(),
    mapel: await prisma.mataPelajaran.count(),
    ekstrakurikuler: await prisma.ekstrakurikuler.count(),
    tahunAjaran: await prisma.tahunAjaran.count(),
    semester: await prisma.semester.count(),
    riwayatKelas: await prisma.riwayatKelasSiswa.count(),
    mengajar: await prisma.mengajar.count(),
    berita: await prisma.berita.count(),
    jadwal: await prisma.jadwal.count(),
    absensi: await prisma.absensi.count(),
    nilaiTugas: await prisma.nilaiTugas.count(),
    penilaianHarian: await prisma.penilaianHarian.count(),
    pts: await prisma.penilaianTengahSemester.count(),
    pas: await prisma.penilaianAkhirSemester.count(),
    rapor: await prisma.rapor.count(),
    raporEkstrakurikuler: await prisma.raporEkstrakurikuler.count(),
    raporCatatanWali: await prisma.raporCatatanWali.count(),
  };

  console.table(counts);
  console.log(`Password default semua akun seed: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

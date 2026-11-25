/**
 * Master Data & Konfigurasi Lembaga
 * Diadopsi langsung dari Format Excel Raport STS MTs Al Amiriyyah Blokagung
 */

export const SCHOOL_INFO = {
  yayasan: "YAYASAN PONDOK PESANTREN DARUSSALAM",
  namaMadrasah: "MTs AL AMIRIYYAH",
  nsm: "121235100017",
  npsn: "20581701",
  alamatKop: "Blokagung Tegalsari Banyuwangi",
  alamatLengkap: "Jl. PP Darussalam Blokagung Karangdoro Tegalsari Banyuwangi Jawa Timur | Telp : 0333-845973 | web: blokagung.net | e-mail : mts.alamiriyyah@ymail.com",
  judulRaport: "LAPORAN HASIL (STS) SUMATIF TENGAH SEMESTER GANJIL",
  tahunAjaran: "2026/2027",
  semester: "GANJIL",
  ujian: "STS",
  tglRaport: "09 Oktober 2025",
  titimangsa: "Blokagung",
  kepalaMadrasah: "AHMADI, M.Pd.I",
  nipKepala: "-",
};

export const MATA_PELAJARAN = [
  { key: 'qurdist', code: '1.a', name: "Al-Qur'an Hadits", short: 'QURDIST', group: 'Pendidikan Agama', kkm: 70 },
  { key: 'aqidah', code: '1.b', name: "Akidah Akhlak", short: 'AQIDAH', group: 'Pendidikan Agama', kkm: 70 },
  { key: 'fiqih', code: '1.c', name: "Fikih", short: 'FIQIH', group: 'Pendidikan Agama', kkm: 70 },
  { key: 'ski', code: '1.d', name: "Sejarah Kebudayaan Islam", short: 'SKI', group: 'Pendidikan Agama', kkm: 70 },
  { key: 'pkn', code: '2', name: "Pendidikan Kewarganegaraan", short: 'PKn', group: 'Umum', kkm: 70 },
  { key: 'bindo', code: '3', name: "Bahasa Indonesia", short: 'B. INDONESIA', group: 'Umum', kkm: 70 },
  { key: 'barab', code: '4', name: "Bahasa Arab", short: 'BHS. ARAB', group: 'Umum', kkm: 70 },
  { key: 'bing', code: '5', name: "Bahasa Inggris", short: 'B. INGGRIS', group: 'Umum', kkm: 70 },
  { key: 'mat', code: '6', name: "Matematika", short: 'MATEMATIKA', group: 'Umum', kkm: 70 },
  { key: 'ipa', code: '7', name: "Ilmu Pengetahuan Alam", short: 'IPA', group: 'Umum', kkm: 70 },
  { key: 'ips', code: '8', name: "Ilmu Pengetahuan Sosial", short: 'IPS', group: 'Umum', kkm: 70 },
  { key: 'seni', code: '9', name: "Seni Budaya / Prakarya", short: 'SENI BUDAYA', group: 'Umum', kkm: 70 },
  { key: 'penjas', code: '10', name: "Pendidikan Jasmani, Olahraga, dan Kesehatan", short: 'PENJASKES', group: 'Umum', kkm: 70 },
  { key: 'ketrampilan', code: '11.a', name: "Pilihan: Seni Budaya / Prakarya", short: 'KETRAMPILAN', group: 'Pilihan', kkm: 70 },
  { key: 'tik', code: '11.b', name: "Teknologi Informasi dan Komunikasi / Informatika", short: 'TIK', group: 'Pilihan', kkm: 70 },
  { key: 'bdaerah', code: '12.a', name: "Mulok: Bahasa Daerah", short: 'B. DAERAH', group: 'Mulok', kkm: 70 },
  { key: 'kenuan', code: '12.b', name: "Mulok: Ke-NU-an", short: 'KE-NU-AN', group: 'Mulok', kkm: 70 },
];

export const DAFTAR_KELAS = [
  // Kelas 7 (7A - 7P)
  { id: '7A', tingkat: '7', nama: '7A', wali: 'Kumalasari, S.Pd', telp: '082340650400' },
  { id: '7B', tingkat: '7', nama: '7B', wali: 'Arbaiyah, S.Pd', telp: '085645997589' },
  { id: '7C', tingkat: '7', nama: '7C', wali: 'Umi Afifatur Rofiqoh, S.Pd', telp: '085706466127' },
  { id: '7D', tingkat: '7', nama: '7D', wali: "Rif'an Anas Fauzi, M.Pd", telp: '081515327481' },
  { id: '7E', tingkat: '7', nama: '7E', wali: 'H. Waras, S.Pd.I', telp: '085730610776' },
  { id: '7F', tingkat: '7', nama: '7F', wali: 'H. Mohammad Asrofi, S.Pd.I', telp: '081358281730' },
  { id: '7G', tingkat: '7', nama: '7G', wali: 'M. Toha, S.Pd', telp: '081615497274' },
  { id: '7H', tingkat: '7', nama: '7H', wali: 'Fahmi Nasri', telp: '085755855001' },
  { id: '7I', tingkat: '7', nama: '7I', wali: 'Dian Mufarika, S.Pd', telp: '081259349829' },
  { id: '7J', tingkat: '7', nama: '7J', wali: 'Vina Shofwil Widaad, S.Pd', telp: '082232168141' },
  { id: '7K', tingkat: '7', nama: '7K', wali: "Emil Naila Sa'da Dinina, S.Pd", telp: '085850094011' },
  { id: '7L', tingkat: '7', nama: '7L', wali: "Ulin Ni'mah, S.Pd, S.Ag", telp: '081335360122' },
  { id: '7M', tingkat: '7', nama: '7M', wali: 'Faya Riyaningsih, S.Pd', telp: '081328485250' },
  { id: '7N', tingkat: '7', nama: '7N', wali: 'Laila Ulfa Ayu, S.E', telp: '081328485250' },
  { id: '7O', tingkat: '7', nama: '7O', wali: 'Lilin Achsani Ulfa, S.E', telp: '085232648137' },
  { id: '7P', tingkat: '7', nama: '7P', wali: 'Eko Dewi Nugro Heti, S.Pd', telp: '081231627428' },

  // Kelas 8 (8A - 8R)
  { id: '8A', tingkat: '8', nama: '8A', wali: 'Mutmaina, S.Pd, Gr.', telp: '082231419809' },
  { id: '8B', tingkat: '8', nama: '8B', wali: 'Syafiudin, S.Pd', telp: '082143102459' },
  { id: '8C', tingkat: '8', nama: '8C', wali: 'M. Harun Al Rosyid, S.Pd', telp: '082139976202' },
  { id: '8D', tingkat: '8', nama: '8D', wali: 'Ahmad Syahdan Asmara, S.Pd', telp: '081331193970' },
  { id: '8E', tingkat: '8', nama: '8E', wali: 'M. Aufal Marom, S.Pd', telp: '085334834844' },
  { id: '8F', tingkat: '8', nama: '8F', wali: 'Aris Fadhilah, S.Pd', telp: '085204881262' },
  { id: '8G', tingkat: '8', nama: '8G', wali: 'Rijala Wanur, S.Pd', telp: '081359831111' },
  { id: '8H', tingkat: '8', nama: '8H', wali: 'Erlan Cahyaningsih, S.Pd', telp: '081336811223' },
  { id: '8I', tingkat: '8', nama: '8I', wali: 'Drs. Imam Tauhid', telp: '082334853773' },
  { id: '8J', tingkat: '8', nama: '8J', wali: 'Ismawati, S.Pd', telp: '085816609915' },
  { id: '8K', tingkat: '8', nama: '8K', wali: 'M. Arif Rohmatullah, S.Pd', telp: '082334756713' },
  { id: '8L', tingkat: '8', nama: '8L', wali: 'Aulia Shinta Rosyadi, S.Sos', telp: '083139353630' },
  { id: '8M', tingkat: '8', nama: '8M', wali: 'Zuraida Ardelina Larasati, S.Pd', telp: '085745224018' },
  { id: '8N', tingkat: '8', nama: '8N', wali: 'Jazilatun Naimah, S.Pd', telp: '082139294727' },
  { id: '8O', tingkat: '8', nama: '8O', wali: 'Nuril Imaniyyah, S.Pd', telp: '082318185872' },
  { id: '8P', tingkat: '8', nama: '8P', wali: 'Raudlatul Izza, S.Si', telp: '085335116548' },
  { id: '8Q', tingkat: '8', nama: '8Q', wali: 'Siti Lailatul Badriyah, S.Pd', telp: '081370054747' },
  { id: '8R', tingkat: '8', nama: '8R', wali: 'M. Ngainun Naim, S.Ag', telp: '087876658656' },

  // Kelas 9 (9A - 9O)
  { id: '9A', tingkat: '9', nama: '9A', wali: 'M. Mukhtar Latifil Ansori, SE', telp: '082231158565' },
  { id: '9B', tingkat: '9', nama: '9B', wali: 'Muhammad Fathul Qorib, S.Pd', telp: '085733556257' },
  { id: '9C', tingkat: '9', nama: '9C', wali: 'Muhammad Syifaun Niam, SE', telp: '081358259550' },
  { id: '9D', tingkat: '9', nama: '9D', wali: "Athi' Khoirotin, S.Pd.I", telp: '085749225322' },
  { id: '9E', tingkat: '9', nama: '9E', wali: "Mar'atus Sholihah, S.Pd", telp: '081230705612' },
  { id: '9F', tingkat: '9', nama: '9F', wali: 'Yazid Fatoni', telp: '082132444145' },
  { id: '9G', tingkat: '9', nama: '9G', wali: 'Nur Hasim', telp: '085335116548' },
  { id: '9H', tingkat: '9', nama: '9H', wali: 'M. Rizky Ilhamsyah, S.Pd', telp: '085850992728' },
  { id: '9I', tingkat: '9', nama: '9I', wali: 'Roisatul Azizah, S.Pd', telp: '083122774961' },
  { id: '9J', tingkat: '9', nama: '9J', wali: 'Athiyah Arifiyana, M.Pd', telp: '081238711173' },
  { id: '9K', tingkat: '9', nama: '9K', wali: 'Durotun Nafisah, S.Pd', telp: '082132892881' },
  { id: '9L', tingkat: '9', nama: '9L', wali: 'Dewi Lyien Ien, S.Ag, M.Pd', telp: '085722829856' },
  { id: '9M', tingkat: '9', nama: '9M', wali: 'Rini Nurdiana, S.Pd', telp: '082332305836' },
  { id: '9N', tingkat: '9', nama: '9N', wali: 'Ufiq Amalia, S.Pd', telp: '082131241624' },
  { id: '9O', tingkat: '9', nama: '9O', wali: 'Rara Imanda, S.Pd', telp: '082334748869' },
];

// DAFTAR GURU MTs AL AMIRIYYAH (Termasuk yang Wali Kelas maupun Guru Mapel Murni)
export const DAFTAR_GURU_SEKOLAH = [
  // 1. Akun Admin
  { id: 'admin', username: 'admin', nama: 'Administrator Kurikulum', isAdmin: true, telp: '081234567890', mapelNama: 'Semua' },

  // 2. Guru yang saat ini ditugaskan sebagai Wali Kelas (dari data excel)
  { id: 'g_mutmaina', username: 'mutmaina', nama: 'Mutmaina, S.Pd, Gr.', telp: '082231419809', mapelNama: 'Bahasa Indonesia' },
  { id: 'g_emil', username: 'emil', nama: "Emil Naila Sa'da Dinina, S.Pd", telp: '085850094011', mapelNama: 'Bahasa Inggris' },
  { id: 'g_kumalasari', username: 'kumalasari', nama: 'Kumalasari, S.Pd', telp: '082340650400', mapelNama: 'Bahasa Indonesia' },
  { id: 'g_arbaiyah', username: 'arbaiyah', nama: 'Arbaiyah, S.Pd', telp: '085645997589', mapelNama: 'Matematika' },
  { id: 'g_ahmad_syahdan', username: 'syahdan', nama: 'Ahmad Syahdan Asmara, S.Pd', telp: '081331193970', mapelNama: 'Matematika' },
  { id: 'g_zuraida', username: 'zuraida', nama: 'Zuraida Ardelina Larasati, S.Pd', telp: '085745224018', mapelNama: 'IPA' },
  { id: 'g_raudlatul', username: 'raudlatul', nama: 'Raudlatul Izza, S.Si', telp: '085335116548', mapelNama: 'IPA' },

  // 3. Guru Mapel Murni (TIDAK terdaftar sebagai wali kelas)
  { id: 'g_budi', username: 'budi', nama: 'Budi Santoso, S.Pd', telp: '081233445566', mapelNama: 'Matematika' },
  { id: 'g_hendra', username: 'hendra', nama: 'Hendra Wijaya, S.Kom', telp: '085677889900', mapelNama: 'Informatika / TIK' },
  { id: 'g_aminah', username: 'aminah', nama: 'Siti Aminah, S.Pd', telp: '082199887766', mapelNama: 'Ilmu Pengetahuan Alam' },
  { id: 'g_fauzan', username: 'fauzan', nama: 'Ahmad Fauzan, M.Pd.I', telp: '085711223344', mapelNama: 'Fikih' },
  { id: 'g_agus', username: 'agus', nama: 'Agus Setiawan, S.Pd', telp: '081344556677', mapelNama: 'PJOK / Penjas' },

  // 4. Guru-guru lainnya dari 49 kelas
  ...DAFTAR_KELAS.slice(4).map((c, i) => ({
    id: `g_${c.id.toLowerCase()}`,
    username: c.wali.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') + c.id.toLowerCase(),
    nama: c.wali,
    telp: c.telp,
    mapelNama: 'Mata Pelajaran'
  }))
];

// Helper kalkulasi jumlah, rerata, dan ranking
export function hitungStatistikSiswa(grades) {
  let total = 0;
  let countFilled = 0;
  
  MATA_PELAJARAN.forEach(m => {
    const val = grades[m.key];
    if (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) {
      total += Number(val);
      countFilled++;
    }
  });

  const avg = countFilled > 0 ? (total / MATA_PELAJARAN.length) : 0;
  const isComplete = countFilled === MATA_PELAJARAN.length;

  return {
    total,
    avg: Number(avg.toFixed(1)),
    countFilled,
    totalMapel: MATA_PELAJARAN.length,
    isComplete
  };
}

// 29 Siswa 8A Asli dari Excel STS User
export const INITIAL_STUDENTS_8A = [
  { no: 1, nis: "240005", nama: "ABIDZAR EL RAFIF RAMADHAN", lp: "L" },
  { no: 2, nis: "240037", nama: "AHMAD ELYAZ MAULANA ANWAR", lp: "L" },
  { no: 3, nis: "240054", nama: "AHMAD YAHYA NABIH BERRI", lp: "L" },
  { no: 4, nis: "240055", nama: "AHMAD ZAFIF LUTHFAN", lp: "L" },
  { no: 5, nis: "240132", nama: "BIMA FAZA RAMADHAN", lp: "L" },
  { no: 6, nis: "240148", nama: "DAFFA WAHYU ANUGRAH", lp: "L" },
  { no: 7, nis: "240178", nama: "EXCEL KEISHA FARELINO", lp: "L" },
  { no: 8, nis: "240182", nama: "FAHRI ARDIANSYAH FAIZ", lp: "L" },
  { no: 9, nis: "240186", nama: "FAQIH ARDIANSYAH FAIZ", lp: "L" },
  { no: 10, nis: "240192", nama: "FATIH ALIF ARDIANSAH", lp: "L" },
  { no: 11, nis: "240209", nama: "GHOZY AZIDAN FAZA", lp: "L" },
  { no: 12, nis: "240217", nama: "HAFIZ FIRZA MAULANA", lp: "L" },
  { no: 13, nis: "240219", nama: "HAIKAL ZAKARIYYA HENDRAWAN", lp: "L" },
  { no: 14, nis: "240265", nama: "KAFANA RIZQI OBBINA", lp: "L" },
  { no: 15, nis: "240295", nama: "M. KHOIRUL FAKHRONI AZZAMZAMI", lp: "L" },
  { no: 16, nis: "240303", nama: "M.FAKHRI MAULANA AZIDAN", lp: "L" },
  { no: 17, nis: "240328", nama: "MOCH. VIKRI HARIZ MAULANA", lp: "L" },
  { no: 18, nis: "240338", nama: "MOH. REZA ARDIANSYAH", lp: "L" },
  { no: 19, nis: "240355", nama: "MOHAMMAD SUBHAN AL HASANI", lp: "L" },
  { no: 20, nis: "240373", nama: "MUHAMMAD ALFIN MUBAROK", lp: "L" },
  { no: 21, nis: "240375", nama: "MUHAMMAD ALVIN ASH SHIDDIQI", lp: "L" },
  { no: 22, nis: "240376", nama: "MUHAMMAD AMADDANIAL HIKAM", lp: "L" },
  { no: 23, nis: "240382", nama: "MUHAMMAD AZAM NUR YUDHA", lp: "L" },
  { no: 24, nis: "240402", nama: "MUHAMMAD MAHBUB ALZAMI", lp: "L" },
  { no: 25, nis: "240417", nama: "MUHAMMAD RIZQI FIRMANSYAH", lp: "L" },
  { no: 26, nis: "240419", nama: "MUHAMMAD RUSYDI ASSABIQ", lp: "L" },
  { no: 27, nis: "240425", nama: "MUHAMMAD WILDAN MUDHOFAR", lp: "L" },
  { no: 28, nis: "240497", nama: "RAFI AHMAD AL-GHAZI", lp: "L" },
  { no: 29, nis: "240499", nama: "RAINAR SURYA NUGRAHA", lp: "L" },
];

// 24 Siswa Kelas 7K Asli dari DKN Excel Informatika User
export const INITIAL_STUDENTS_7K = [
  { no: 1, nis: "240701", nama: "AINUN HIKMAWAH", lp: "P", initScore: 75.5 },
  { no: 2, nis: "240702", nama: "AMIRA HASNA HAKIMAH", lp: "P", initScore: 72.5 },
  { no: 3, nis: "240703", nama: "ARINA NAJMA AQILA", lp: "P", initScore: 72.5 },
  { no: 4, nis: "240704", nama: "ARIQAH RIZQULLOHI NUR AINI", lp: "P", initScore: 73.5 },
  { no: 5, nis: "240705", nama: "ATHAYA KHOIRUNNISA", lp: "P", initScore: 78.5 },
  { no: 6, nis: "240706", nama: "ATSNA FAIZA LIULIN NUHA", lp: "P", initScore: 79.5 },
  { no: 7, nis: "240707", nama: "AYUNDA SOFI AZZAHRA", lp: "P", initScore: 71.5 },
  { no: 8, nis: "240708", nama: "AZIKA MALIDA AGISTA", lp: "P", initScore: 70.0 },
  { no: 9, nis: "240709", nama: "AZKIYA AMALIA WIRDA", lp: "P", initScore: 79.5 },
  { no: 10, nis: "240710", nama: "AZZAHRA ANNISA US SHOLIHAH", lp: "P", initScore: 85.5 },
  { no: 11, nis: "240711", nama: "DEANOVA YUMNA VINAZYA", lp: "P", initScore: 70.0 },
  { no: 12, nis: "240712", nama: "DEWI QOTHRUNNADA SEKAR ARUM", lp: "P", initScore: 77.5 },
  { no: 13, nis: "240713", nama: "DK DZAKIRA AFTANI", lp: "P", initScore: 70.0 },
  { no: 14, nis: "240714", nama: "HANSA SAIHANA SOHIBATUL ULYA", lp: "P", initScore: 72.5 },
  { no: 15, nis: "240715", nama: "INAS HAURA RANIA RAISYA", lp: "P", initScore: 70.0 },
  { no: 16, nis: "240716", nama: "KAYLA FATISYA RIZWANA", lp: "P", initScore: 73.5 },
  { no: 17, nis: "240717", nama: "KHOIRUNNISA", lp: "P", initScore: 88.5 },
  { no: 18, nis: "240718", nama: "MAGHFIROTUT TAZKIYAH", lp: "P", initScore: 74.5 },
  { no: 19, nis: "240719", nama: "NAFILA ZAHRA ARMELINDA", lp: "P", initScore: 80.5 },
  { no: 20, nis: "240720", nama: "NAYLA AZKIYA MUMTAZA MAS'UD", lp: "P", initScore: 76.5 },
  { no: 21, nis: "240721", nama: "REVALINA ELVAWWAZA", lp: "P", initScore: 75.5 },
  { no: 22, nis: "240722", nama: "SITI JAUHAROTUS SHOFIYAH", lp: "P", initScore: 73.5 },
  { no: 23, nis: "240723", nama: "TAHTA ALFIAH", lp: "P", initScore: 78.5 },
  { no: 24, nis: "240724", nama: "ZAHIRA ADDINA KAMILA", lp: "P", initScore: 70.0 },
];

export function generateInitialLegerData(classId = '8A') {
  if (classId === '7K') {
    const list = INITIAL_STUDENTS_7K.map((s, idx) => {
      const grades = {};
      MATA_PELAJARAN.forEach((m) => {
        if (m.key === 'tik') {
          grades[m.key] = s.initScore;
        } else {
          grades[m.key] = 72 + ((idx * 4) % 18);
        }
      });
      const stat = hitungStatistikSiswa(grades);
      return {
        no: s.no,
        nis: s.nis,
        nama: s.nama,
        lp: s.lp,
        grades,
        totalNilai: stat.total,
        rataRata: stat.avg,
        ranking: 1,
        pengembanganDiri: {
          jenis: "PMR / Pramuka",
          nilai: "A (Sangat Baik)",
          keterangan: "Sangat aktif dan disiplin"
        },
        akhlak: {
          kelakuan: { nilai: 88, ket: "Baik" },
          kerajinan: { nilai: 86, ket: "Baik" },
          kerapian: { nilai: 87, ket: "Baik" }
        },
        absensi: { sakit: 0, izin: 0, alpa: 0 },
        catatanWali: "Pertahankan ketekunan belajarmu dan terus berprestasi."
      };
    });
    return hitungRankingLeger(list);
  }

  const roster = classId === '8A' ? INITIAL_STUDENTS_8A : Array.from({ length: 24 }, (_, index) => ({
    no: index + 1,
    nis: `DEMO-${classId}-${String(index + 1).padStart(2, '0')}`,
    nama: `Siswa Demo ${classId}-${String(index + 1).padStart(2, '0')}`,
    lp: classId.charCodeAt(1) % 2 === 0 ? 'P' : 'L',
  }));
  const students = roster.map((s, idx) => {
    const isFullyFilled = idx < roster.length - 4;
    const baseScore = 72 + ((idx * 7) % 22);

    const grades = {};
    MATA_PELAJARAN.forEach((m, mIdx) => {
      if (isFullyFilled) {
        const variation = ((mIdx * 3 + idx) % 9) - 4;
        grades[m.key] = Math.min(98, Math.max(68, baseScore + variation));
      } else {
        if (mIdx < 10) {
          grades[m.key] = Math.min(95, Math.max(70, baseScore + (mIdx % 5)));
        } else {
          grades[m.key] = '';
        }
      }
    });

    const stat = hitungStatistikSiswa(grades);

    return {
      no: s.no,
      nis: s.nis,
      nama: s.nama,
      lp: s.lp,
      grades,
      totalNilai: stat.total,
      rataRata: stat.avg,
      ranking: 1,
      pengembanganDiri: {
        jenis: idx % 3 === 0 ? "Pramuka" : idx % 3 === 1 ? "Banjari / Hadrah" : "English Club",
        nilai: idx % 4 === 0 ? "A (Sangat Baik)" : "B (Baik)",
        keterangan: "Aktif dan disiplin mengikuti kegiatan"
      },
      akhlak: {
        kelakuan: { nilai: 88, ket: "Baik" },
        kerajinan: { nilai: 86, ket: "Baik" },
        kerapian: { nilai: 85, ket: "Baik" }
      },
      absensi: {
        sakit: (idx % 5 === 0) ? 1 : 0,
        izin: (idx % 7 === 0) ? 1 : 0,
        alpa: 0
      },
      catatanWali: idx < 5 
        ? "Pertahankan prestasimu, terus belajar dengan tekun dan rajin beribadah."
        : "Tingkatkan ketekunan dalam belajar serta keaktifan di kelas."
    };
  });

  return hitungRankingLeger(students);
}

export function hitungRankingLeger(studentsList) {
  const sorted = [...studentsList].map((s, originalIndex) => ({
    ...s,
    originalIndex
  })).sort((a, b) => {
    if (b.totalNilai !== a.totalNilai) return b.totalNilai - a.totalNilai;
    return b.rataRata - a.rataRata;
  });

  sorted.forEach((item, rIdx) => {
    item.ranking = rIdx + 1;
  });

  sorted.sort((a, b) => a.originalIndex - b.originalIndex);
  return sorted.map(({ originalIndex, ...rest }) => rest);
}

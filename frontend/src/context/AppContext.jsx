'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SCHOOL_INFO, 
  MATA_PELAJARAN, 
  DAFTAR_KELAS, 
  DAFTAR_GURU_SEKOLAH,
  generateInitialLegerData, 
  hitungRankingLeger,
  hitungStatistikSiswa
} from '@/lib/masterData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Pengaturan Sekolah & Raport
  const [schoolSettings, setSchoolSettings] = useState(SCHOOL_INFO);

  // Master Data 49 Kelas & Penugasan Wali Kelas
  const [classesList, setClassesList] = useState(DAFTAR_KELAS);

  // Daftar Seluruh Guru di Sekolah (baik wali kelas maupun guru mapel murni)
  const [teachersList, setTeachersList] = useState(DAFTAR_GURU_SEKOLAH);

  // User yang sedang Login (Mulai dengan salah satu wali kelas atau null)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Kelas Aktif yang sedang dibuka
  const [selectedClassId, setSelectedClassId] = useState('8A');

  // Database Leger per Kelas
  const [legerByClass, setLegerByClass] = useState({});

  // Status Kunci Nilai Fix per Kelas
  const [classStatus, setClassStatus] = useState({
    '8A': { isLocked: false, isReadyToPrint: true },
    '7K': { isLocked: false, isReadyToPrint: true }
  });

  // Notifikasi Toasts
  const [toasts, setToasts] = useState([]);

  // Notifikasi Setoran Guru Mapel (Inbox)
  const [pendingSubmissions, setPendingSubmissions] = useState([
    {
      id: 1,
      mapelKey: 'mat',
      mapelName: 'Matematika',
      kelasId: '8A',
      guru: 'Ahmad Syahdan Asmara, S.Pd',
      waktu: '10 menit lalu',
      count: 29,
      status: 'diterima'
    },
    {
      id: 2,
      mapelKey: 'tik',
      mapelName: 'Informatika (DKN)',
      kelasId: '7K',
      guru: 'Hendra Wijaya, S.Kom',
      waktu: '15 menit lalu',
      count: 24,
      status: 'diterima'
    }
  ]);

  // Siswa yang sedang di-preview untuk cetak raport
  const [previewStudent, setPreviewStudent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Inisialisasi Leger Awal (8A dan 7K)
  useEffect(() => {
    const initial8A = generateInitialLegerData('8A');
    const initial7K = generateInitialLegerData('7K');
    setLegerByClass({
      '8A': initial8A,
      '7K': initial7K
    });

    // Coba restore user dari localStorage jika ada
    try {
      const savedUser = localStorage.getItem('radistes_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Cek kembali rolenya terhadap penugasan kelas yang aktif
        const resolved = resolveTeacherRole(parsed, DAFTAR_KELAS);
        setCurrentUser(resolved);
        if (resolved.role === 'walikelas' && resolved.kelasWali) {
          setSelectedClassId(resolved.kelasWali);
        }
      } else {
        // Default awal: Otomatis login sebagai Guru Mutmaina (Wali 8A) agar langsung bisa ditinjau
        const defaultTeacher = DAFTAR_GURU_SEKOLAH[1]; // Mutmaina
        const resolved = resolveTeacherRole(defaultTeacher, DAFTAR_KELAS);
        setCurrentUser(resolved);
        setSelectedClassId('8A');
      }
    } catch (e) {
      console.error(e);
    }
    setIsAuthLoaded(true);
  }, []);

  // Helper menampilkan Toast
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  /**
   * FUNGSI INTI: DETEKSI ROLE OTOMATIS
   * Menentukan apakah seorang guru terdaftar sebagai Wali Kelas atau Guru Mapel
   * berdasarkan daftar penugasan kelas aktif (classesList)
   */
  const resolveTeacherRole = (teacherObj, currentClasses = classesList) => {
    if (!teacherObj) return null;

    // 1. Cek apakah Admin
    if (teacherObj.isAdmin || teacherObj.username === 'admin') {
      return {
        ...teacherObj,
        role: 'admin',
        kelasWali: null,
        badge: 'Administrator Kurikulum'
      };
    }

    // 2. Cek apakah nama guru terdaftar sebagai wali kelas di salah satu dari 49 kelas
    const assignedClass = currentClasses.find(c => {
      if (!c.wali) return false;
      const cleanWali = c.wali.trim().toLowerCase();
      const cleanTeacher = teacherObj.nama.trim().toLowerCase();
      return cleanWali === cleanTeacher || cleanWali.includes(cleanTeacher) || cleanTeacher.includes(cleanWali);
    });

    if (assignedClass) {
      // TERDAFTAR SEBAGAI WALI KELAS!
      return {
        ...teacherObj,
        role: 'walikelas',
        kelasWali: assignedClass.id, // misal '8A' atau '7K'
        badge: `Wali Kelas ${assignedClass.id}`
      };
    } else {
      // TIDAK TERDAFTAR SEBAGAI WALI KELAS -> OTOMATIS MASUK ROLE GURU MAPEL!
      return {
        ...teacherObj,
        role: 'gurumapel',
        kelasWali: null,
        badge: `Guru Mapel (${teacherObj.mapelNama || 'Pengajar'})`
      };
    }
  };

  // Fungsi Login: Guru memasukkan nama/username atau memilih namanya
  const loginGuru = (teacherIdentifier) => {
    // Cari guru berdasarkan username atau nama
    let found = teachersList.find(t => 
      t.username.toLowerCase() === teacherIdentifier.toLowerCase() ||
      t.nama.toLowerCase().includes(teacherIdentifier.toLowerCase()) ||
      teacherIdentifier.toLowerCase().includes(t.username.toLowerCase()) ||
      t.id === teacherIdentifier
    );

    // Fallback cerdas agar pengguna bisa login dengan username apapun
    if (!found) {
      const lower = teacherIdentifier.toLowerCase();
      if (lower.includes('admin')) {
        found = { id: 'admin', username: 'admin', nama: 'Administrator Kurikulum', isAdmin: true };
      } else if (lower.includes('wali') || lower.includes('mutmaina') || lower.includes('emil')) {
        found = lower.includes('emil') 
          ? { id: 'g_emil', username: 'emil', nama: "Emil Naila Sa'da Dinina, S.Pd" }
          : { id: 'g_mutmaina', username: 'mutmaina', nama: 'Mutmaina, S.Pd, Gr.' };
      } else {
        found = { id: 'g_' + lower, username: lower, nama: teacherIdentifier, mapelNama: 'Mata Pelajaran' };
      }
    }

    // Tentukan role otomatis berdasarkan penugasan kelas saat ini!
    const resolvedUser = resolveTeacherRole(found, classesList);
    setCurrentUser(resolvedUser);

    if (resolvedUser.role === 'walikelas' && resolvedUser.kelasWali) {
      setSelectedClassId(resolvedUser.kelasWali);
      // Inisialisasi data kelas jika belum ada
      setLegerByClass(prev => {
        if (!prev[resolvedUser.kelasWali]) {
          return {
            ...prev,
            [resolvedUser.kelasWali]: generateInitialLegerData(resolvedUser.kelasWali)
          };
        }
        return prev;
      });
      showToast(`Login berhasil! Anda terdeteksi sebagai Wali Kelas ${resolvedUser.kelasWali}.`, 'success');
    } else if (resolvedUser.role === 'gurumapel') {
      showToast(`Login berhasil sebagai Guru Mapel (${resolvedUser.mapelNama}). Menu raport kelas dinonaktifkan.`, 'info');
    } else {
      showToast(`Login berhasil sebagai Administrator Kurikulum.`, 'info');
    }

    try {
      localStorage.setItem('radistes_current_user', JSON.stringify(found));
    } catch (e) {}

    return { success: true, user: resolvedUser };
  };

  // Fungsi Logout
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('radistes_current_user');
    } catch (e) {}
    showToast('Anda telah logout dari sistem RADISTES.', 'info');
  };

  // Mendapatkan Wali Kelas Aktif
  const activeClassInfo = classesList.find(k => k.id === selectedClassId) || classesList[16];

  // Mendapatkan data leger untuk kelas yang sedang aktif
  const currentLeger = legerByClass[selectedClassId] || [];

  // Update nilai satu mapel untuk satu siswa
  const updateStudentGrade = (nis, mapelKey, newValue) => {
    setLegerByClass(prev => {
      const classData = prev[selectedClassId] ? [...prev[selectedClassId]] : [];
      const updatedList = classData.map(student => {
        if (student.nis === nis) {
          const newGrades = { ...student.grades, [mapelKey]: newValue };
          const stat = hitungStatistikSiswa(newGrades);
          return {
            ...student,
            grades: newGrades,
            totalNilai: stat.total,
            rataRata: stat.avg
          };
        }
        return student;
      });

      const rankedList = hitungRankingLeger(updatedList);
      return {
        ...prev,
        [selectedClassId]: rankedList
      };
    });
  };

  // Update data pendukung (Pengembangan Diri, Akhlak, Absensi, Catatan)
  const updateStudentMeta = (nis, field, subfield, value) => {
    setLegerByClass(prev => {
      const classData = prev[selectedClassId] ? [...prev[selectedClassId]] : [];
      const updatedList = classData.map(student => {
        if (student.nis === nis) {
          if (subfield) {
            return {
              ...student,
              [field]: {
                ...student[field],
                [subfield]: value
              }
            };
          }
          return {
            ...student,
            [field]: value
          };
        }
        return student;
      });
      return {
        ...prev,
        [selectedClassId]: updatedList
      };
    });
  };

  // Kunci / Buka Leger Kelas
  const toggleLockClass = (classId) => {
    setClassStatus(prev => {
      const current = prev[classId]?.isLocked || false;
      const nextLocked = !current;
      showToast(nextLocked ? `Leger Kelas ${classId} telah DIKUNCI (Fix siap cetak)!` : `Kunci Leger Kelas ${classId} DIBUKA untuk diedit.`, nextLocked ? 'info' : 'warning');
      return {
        ...prev,
        [classId]: {
          ...prev[classId],
          isLocked: nextLocked,
          isReadyToPrint: true
        }
      };
    });
  };

  // Import Nilai dari File Excel DKN ke Leger Kelas
  const importDknScores = (targetClass, targetMapelKey, parsedScores) => {
    setLegerByClass(prev => {
      const currentList = prev[targetClass] ? [...prev[targetClass]] : generateInitialLegerData(targetClass);

      const updatedList = currentList.map(student => {
        const matched = parsedScores.find(item => {
          if (item.nis && student.nis && item.nis === student.nis) return true;
          const normA = (item.nama || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const normB = (student.nama || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          return normA === normB || normA.includes(normB) || normB.includes(normA);
        });

        if (matched && matched.score !== undefined && matched.score !== null) {
          const newGrades = { ...student.grades, [targetMapelKey]: matched.score };
          const stat = hitungStatistikSiswa(newGrades);
          return {
            ...student,
            grades: newGrades,
            totalNilai: stat.total,
            rataRata: stat.avg
          };
        }
        return student;
      });

      const ranked = hitungRankingLeger(updatedList);
      return {
        ...prev,
        [targetClass]: ranked
      };
    });

    showToast(`Berhasil mengimpor nilai DKN untuk Kelas ${targetClass}!`, 'success');
  };

  // Update Penugasan Wali Kelas (Tunggal) - Otomatis merefleksikan role guru yang bersangkutan!
  const updateSingleWaliKelas = (classId, waliName, telp) => {
    const updatedClasses = classesList.map(c => {
      if (c.id === classId) {
        return { ...c, wali: waliName, telp: telp || c.telp };
      }
      return c;
    });
    setClassesList(updatedClasses);

    // Re-evaluasi role currentUser jika dia guru yang sedang login
    if (currentUser && !currentUser.isAdmin) {
      const reEvaluated = resolveTeacherRole(currentUser, updatedClasses);
      setCurrentUser(reEvaluated);
    }

    showToast(`Penugasan Wali Kelas ${classId} berhasil diperbarui menjadi ${waliName}!`, 'success');
  };

  // Bulk Import Penugasan Wali Kelas dari Excel SK / Pengusulan
  const bulkImportWaliKelas = (newList) => {
    const updatedClasses = classesList.map(cls => {
      const found = newList.find(item => {
        const idA = (item.kelas || item.id || '').toString().trim().toUpperCase();
        const idB = cls.id.toString().trim().toUpperCase();
        return idA === idB;
      });
      if (found) {
        return {
          ...cls,
          wali: found.wali || found.nama || cls.wali,
          telp: found.telp || found.noTelp || found.no_telpon || cls.telp
        };
      }
      return cls;
    });

    setClassesList(updatedClasses);

    // Re-evaluasi role currentUser
    if (currentUser && !currentUser.isAdmin) {
      const reEvaluated = resolveTeacherRole(currentUser, updatedClasses);
      setCurrentUser(reEvaluated);
    }

    showToast(`Berhasil mengimpor dan memperbarui penugasan 49 Wali Kelas!`, 'success');
  };

  // Modal Raport
  const openRaportModal = (student) => {
    setPreviewStudent(student);
    setIsPreviewOpen(true);
  };

  const closeRaportModal = () => {
    setIsPreviewOpen(false);
  };

  // Hak Akses (Permissions)
  const isSuperAdmin = currentUser?.role === 'admin';
  const isWaliKelas = currentUser?.role === 'walikelas';
  const isGuruMapelOnly = currentUser?.role === 'gurumapel';

  return (
    <AppContext.Provider
      value={{
        schoolSettings,
        setSchoolSettings,
        currentUser,
        isAuthLoaded,
        teachersList,
        loginGuru,
        logout,
        isSuperAdmin,
        isWaliKelas,
        isGuruMapelOnly,
        selectedClassId,
        setSelectedClassId,
        activeClassInfo,
        allClasses: classesList,
        setClassesList,
        updateSingleWaliKelas,
        bulkImportWaliKelas,
        allMapel: MATA_PELAJARAN,
        currentLeger,
        legerByClass,
        updateStudentGrade,
        updateStudentMeta,
        classStatus,
        toggleLockClass,
        importDknScores,
        pendingSubmissions,
        previewStudent,
        setPreviewStudent,
        isPreviewOpen,
        openRaportModal,
        closeRaportModal,
        toasts,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

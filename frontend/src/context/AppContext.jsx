'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  SCHOOL_INFO, 
  MATA_PELAJARAN, 
  DAFTAR_KELAS, 
  DAFTAR_GURU_SEKOLAH,
  findSubject,
  generateInitialLegerData, 
  hitungRankingLeger,
  hitungStatistikSiswa,
  roundLegerGrade
} from '@/lib/masterData';
import { normalizeTeacherAssignments } from '@/lib/teaching';
import { readStudentBiodata, storeStudentBiodata, STUDENT_BIODATA_KEY } from '@/lib/studentBiodata';
import { readWaliReportSettings, storeWaliReportSettings, WALI_REPORT_SETTINGS_KEY } from '@/lib/waliReportSettings';
import { activeLegerSubjects, readSubjectCatalog } from '@/lib/subjectCatalog';

const AppContext = createContext(null);
const SCHOOL_SETTINGS_KEY = 'radistes_school_settings';

function parseSchoolSettings(value) {
  const saved = JSON.parse(value);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return SCHOOL_INFO;
  return { ...SCHOOL_INFO, ...saved };
}

export function AppProvider({ children }) {
  // Pengaturan Sekolah & Raport
  const [schoolSettings, setSchoolSettings] = useState(SCHOOL_INFO);
  const subjectCatalog = schoolSettings.subjectCatalog;
  const allMapel = useMemo(() => activeLegerSubjects(readSubjectCatalog(subjectCatalog)), [subjectCatalog]);
  const [waliReportSettings, setWaliReportSettings] = useState({});
  const [studentBiodata, setStudentBiodata] = useState({});

  // Master Data 49 Kelas & Penugasan Wali Kelas
  const [classesList, setClassesList] = useState(DAFTAR_KELAS);

  // Daftar Seluruh Guru di Sekolah (baik wali kelas maupun guru mapel murni)
  const [teachersList, setTeachersList] = useState(DAFTAR_GURU_SEKOLAH);
  const [submissionRecords, setSubmissionRecords] = useState({});
  const [gradeDraftEdits, setGradeDraftEdits] = useState({});

  const recordSubmission = (classId, subjectKey, sent = false) => {
    if (!currentUser || currentUser.role === 'admin') return;
    const key = [currentUser.username, classId, subjectKey].join(':');
    const updatedAt = new Date().toISOString();
    setSubmissionRecords(previous => ({
      ...previous,
      [key]: {
        classId, subjectKey, teacher: currentUser.nama, username: currentUser.username, sent, updatedAt,
        sentAt: sent ? updatedAt : previous[key]?.sentAt,
      }
    }));
  };

  // User yang sedang Login (Default: null agar wajib login)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Kelas Aktif yang sedang dibuka
  const [selectedClassId, setSelectedClassId] = useState('8A');

  // Database Leger per Kelas
  const [storedLegerByClass, setLegerByClass] = useState({});
  const legerByClass = useMemo(() => Object.fromEntries(
    Object.entries(storedLegerByClass).map(([classId, students]) => [
      classId,
      hitungRankingLeger(students.map(student => {
        const { total, avg } = hitungStatistikSiswa(student.grades, allMapel);
        return { ...student, totalNilai: total, rataRata: avg };
      })),
    ])
  ), [storedLegerByClass, allMapel]);

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
  const [previewClassId, setPreviewClassId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Inisialisasi Leger Awal (8A dan 7K)
  useEffect(() => {
    setLegerByClass(Object.fromEntries(DAFTAR_KELAS.map(item => [item.id, generateInitialLegerData(item.id)])));

    try {
      setSchoolSettings(parseSchoolSettings(localStorage.getItem(SCHOOL_SETTINGS_KEY)));
    } catch (error) {
      console.error(error);
    }
    try {
      setWaliReportSettings(readWaliReportSettings(localStorage));
    } catch (error) {
      console.error(error);
    }
    try {
      setStudentBiodata(readStudentBiodata(localStorage));
    } catch (error) {
      console.error(error);
    }

    let loadedTeachers = DAFTAR_GURU_SEKOLAH;
    try {
      const savedTeachers = localStorage.getItem('radistes_teachers_list');
      if (savedTeachers) {
        const parsedTeachers = JSON.parse(savedTeachers);
        if (Array.isArray(parsedTeachers) && parsedTeachers.length > 0) {
          loadedTeachers = parsedTeachers.map(normalizeTeacherAssignments);
          setTeachersList(loadedTeachers);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Cek sesi login aktif dari sessionStorage (atau localStorage)
    try {
      // Hapus data lama yang tersimpan otomatis sebelumnya agar diarahkan ke login
      localStorage.removeItem('radistes_current_user');

      const savedUser = sessionStorage.getItem('radistes_session_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const latestTeacher = loadedTeachers.find(
          t => t.username === parsed.username || t.id === parsed.id
        );
        const mergedUser = normalizeTeacherAssignments(latestTeacher ? { ...parsed, ...latestTeacher } : parsed);
        const resolved = resolveTeacherRole(mergedUser, DAFTAR_KELAS);
        setCurrentUser(resolved);
        if (resolved.role === 'walikelas' && resolved.kelasWali) {
          setSelectedClassId(resolved.kelasWali);
        }
      } else {
        // Belum login: tetap null agar diarahkan ke halaman login terlebih dahulu
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
      setCurrentUser(null);
    }
    setIsAuthLoaded(true);
  }, []);

  // Simpan perubahan penugasan guru ke localStorage & sinkronkan antar tab
  useEffect(() => {
    if (!isAuthLoaded) return;
    try {
      localStorage.setItem('radistes_teachers_list', JSON.stringify(teachersList));
    } catch (e) {
      console.error(e);
    }
  }, [teachersList, isAuthLoaded]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.storageArea === localStorage && (event.key === SCHOOL_SETTINGS_KEY || event.key === null)) {
        try {
          setSchoolSettings(parseSchoolSettings(localStorage.getItem(SCHOOL_SETTINGS_KEY)));
        } catch (error) {
          console.error(error);
        }
      }
      if (event.storageArea === localStorage && (event.key === WALI_REPORT_SETTINGS_KEY || event.key === null)) {
        try {
          setWaliReportSettings(readWaliReportSettings(localStorage));
        } catch (error) {
          console.error(error);
        }
      }
      if (event.storageArea === localStorage && (event.key === STUDENT_BIODATA_KEY || event.key === null)) {
        try {
          setStudentBiodata(readStudentBiodata(localStorage));
        } catch (error) {
          console.error(error);
        }
      }
      if (event.key === 'radistes_teachers_list' && event.newValue) {
        try {
          const updated = JSON.parse(event.newValue);
          if (Array.isArray(updated)) {
            setTeachersList(updated.map(normalizeTeacherAssignments));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Helper menampilkan Toast
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const saveSchoolSettings = (settings) => {
    if (currentUser?.role !== 'admin') return false;
    try {
      localStorage.setItem(SCHOOL_SETTINGS_KEY, JSON.stringify(settings));
      setSchoolSettings(settings);
      return true;
    } catch (error) {
      console.error(error);
      showToast('Pengaturan gagal disimpan ke browser. Periksa ruang penyimpanan atau coba logo yang lebih kecil.', 'warning');
      return false;
    }
  };

  const saveWaliReportSettings = (settings) => {
    const classInfo = classesList.find(cls => cls.id === currentUser?.kelasWali);
    if (currentUser?.role !== 'walikelas' || !classInfo?.wali ||
      resolveTeacherRole(currentUser)?.kelasWali !== classInfo.id) {
      showToast('Pengaturan tanda tangan hanya tersedia untuk wali kelas yang bertugas.', 'warning');
      return false;
    }
    try {
      setWaliReportSettings(storeWaliReportSettings(localStorage, classInfo, settings));
      return true;
    } catch (error) {
      console.error(error);
      showToast('Pengaturan wali kelas gagal disimpan ke browser.', 'warning');
      return false;
    }
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
        badge: `Guru Mapel (${findSubject(MATA_PELAJARAN, teacherObj.mapelNama)?.name || teacherObj.mapelNama || 'Pengajar'})`
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
      sessionStorage.setItem('radistes_session_user', JSON.stringify(found));
    } catch (e) {}

    return { success: true, user: resolvedUser };
  };

  // Fungsi Logout
  const logout = () => {
    setCurrentUser(null);
    setGradeDraftEdits({});
    try {
      sessionStorage.removeItem('radistes_session_user');
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
          const newGrades = { ...student.grades, [mapelKey]: roundLegerGrade(newValue) };
          return { ...student, grades: newGrades };
        }
        return student;
      });

      return {
        ...prev,
        [selectedClassId]: updatedList
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
  const importDknScores = (targetClass, targetMapelKey, parsedScores, successMessage) => {
    if (classStatus[targetClass]?.isLocked) {
      showToast('Leger kelas ini terkunci.', 'warning');
      return;
    }
    setLegerByClass(prev => {
      const currentList = prev[targetClass] ? [...prev[targetClass]] : generateInitialLegerData(targetClass);

      const updatedList = currentList.map(student => {
        const matched = parsedScores.find(item => {
          if (item.nis) return String(item.nis) === String(student.nis);
          const normA = (item.nama || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const normB = (student.nama || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          return Boolean(normA && normB && normA === normB);
        });

        const score = roundLegerGrade(matched?.score);
        if (score !== '') {
          const newGrades = { ...student.grades, [targetMapelKey]: score };
          return { ...student, grades: newGrades };
        }
        return student;
      });

      return {
        ...prev,
        [targetClass]: updatedList
      };
    });

    showToast(successMessage || `Berhasil mengimpor nilai DKN untuk Kelas ${targetClass}!`, 'success');
    if (successMessage) recordSubmission(targetClass, targetMapelKey, true);
  };

  // Update Penugasan Wali Kelas (Tunggal) - Otomatis merefleksikan role guru yang bersangkutan!
  const updateSingleWaliKelas = (classId, waliName, telp, targetClassId = classId) => {
    const sourceClass = classesList.find(c => c.id === classId);
    const targetClass = classesList.find(c => c.id === targetClassId);
    if (!sourceClass || !targetClass || !waliName.trim()) {
      showToast('Periksa nama wali kelas dan rombel tujuan.', 'warning');
      return false;
    }

    const updatedClasses = classesList.map(c => {
      if (c.id === targetClassId) {
        return { ...c, wali: waliName.trim(), telp: telp?.trim() || sourceClass.telp || '' };
      }
      if (c.id === classId) {
        return { ...c, wali: targetClass.wali || '', telp: targetClass.wali ? targetClass.telp : '' };
      }
      return c;
    });
    setClassesList(updatedClasses);

    // Re-evaluasi role currentUser jika dia guru yang sedang login
    if (currentUser && !currentUser.isAdmin) {
      const reEvaluated = resolveTeacherRole(currentUser, updatedClasses);
      setCurrentUser(reEvaluated);
    }

    showToast(`Penugasan Wali Kelas ${targetClassId} berhasil disimpan.`, 'success');
    return true;
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
  const openRaportModal = (student, classId = selectedClassId) => {
    setPreviewStudent(student);
    setPreviewClassId(classId);
    setIsPreviewOpen(true);
  };

  const closeRaportModal = () => {
    setIsPreviewOpen(false);
  };

  // Hak Akses (Permissions)
  const isSuperAdmin = currentUser?.role === 'admin';
  const isWaliKelas = currentUser?.role === 'walikelas';
  const isGuruMapelOnly = currentUser?.role === 'gurumapel';

  const saveStudentBiodata = (classId, nis, details) => {
    if (!isWaliKelas || currentUser.kelasWali !== classId ||
      resolveTeacherRole(currentUser)?.kelasWali !== classId ||
      !legerByClass[classId]?.some(student => student.nis === nis)) {
      showToast('Biodata hanya dapat diubah oleh wali kelas siswa ini.', 'warning');
      return false;
    }
    try {
      setStudentBiodata(storeStudentBiodata(localStorage, classId, nis, details));
      return true;
    } catch (error) {
      console.error(error);
      showToast('Biodata siswa gagal disimpan ke browser.', 'warning');
      return false;
    }
  };

  const changeReportStudent = (classId, nis, details) => {
    if (classStatus[classId]?.isLocked || !(isSuperAdmin || (isWaliKelas && currentUser.kelasWali === classId))) return;
    setLegerByClass(previous => {
      const students = previous[classId] || [];
      const updated = details
        ? students.map(student => student.nis === nis ? { ...student, ...details } : student)
        : students.filter(student => student.nis !== nis);
      return { ...previous, [classId]: updated };
    });
  };

  return (
    <AppContext.Provider
      value={{
        schoolSettings,
        saveSchoolSettings,
        waliReportSettings,
        saveWaliReportSettings,
        currentUser,
        isAuthLoaded,
        teachersList,
        setTeachersList,
        submissionRecords,
        gradeDraftEdits,
        setGradeDraftEdits,
        recordSubmission,
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
        allMapel,
        currentLeger,
        legerByClass,
        studentBiodata,
        saveStudentBiodata,
        updateStudentGrade,
        updateStudentMeta,
        classStatus,
        toggleLockClass,
        importDknScores,
        pendingSubmissions,
        previewStudent,
        previewClassId,
        changeReportStudent,
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

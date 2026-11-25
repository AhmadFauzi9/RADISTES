/**
 * Helper Terbilang untuk Nilai Raport STS
 * Mengonversi angka 0 - 100 menjadi kata (Bahasa Indonesia)
 * Sesuai data lookup sheet Excel STS MTs Al Amiriyyah
 */

const ANGKA_KATA = {
  0: "Nol",
  1: "Satu",
  2: "Dua",
  3: "Tiga",
  4: "Empat",
  5: "Lima",
  6: "Enam",
  7: "Tujuh",
  8: "Delapan",
  9: "Sembilan",
  10: "Sepuluh",
  11: "Sebelas",
  12: "Dua Belas",
  13: "Tiga Belas",
  14: "Empat Belas",
  15: "Lima Belas",
  16: "Enam Belas",
  17: "Tujuh Belas",
  18: "Delapan Belas",
  19: "Sembilan Belas",
  20: "Dua Puluh",
  21: "Dua Puluh Satu",
  22: "Dua Puluh Dua",
  23: "Dua Puluh Tiga",
  24: "Dua Puluh Empat",
  25: "Dua Puluh Lima",
  26: "Dua Puluh Enam",
  27: "Dua Puluh Tujuh",
  28: "Dua Puluh Delapan",
  29: "Dua Puluh Sembilan",
  30: "Tiga Puluh",
  40: "Empat Puluh",
  50: "Lima Puluh",
  51: "Lima Puluh Satu",
  52: "Lima Puluh Dua",
  53: "Lima Puluh Tiga",
  54: "Lima Puluh Empat",
  55: "Lima Puluh Lima",
  56: "Lima Puluh Enam",
  57: "Lima Puluh Tujuh",
  58: "Lima Puluh Delapan",
  59: "Lima Puluh Sembilan",
  60: "Enam Puluh",
  61: "Enam Puluh Satu",
  62: "Enam Puluh Dua",
  63: "Enam Puluh Tiga",
  64: "Enam Puluh Empat",
  65: "Enam Puluh Lima",
  66: "Enam Puluh Enam",
  67: "Enam Puluh Tujuh",
  68: "Enam Puluh Delapan",
  69: "Enam Puluh Sembilan",
  70: "Tujuh Puluh",
  71: "Tujuh Puluh Satu",
  72: "Tujuh Puluh Dua",
  73: "Tujuh Puluh Tiga",
  74: "Tujuh Puluh Empat",
  75: "Tujuh Puluh Lima",
  76: "Tujuh Puluh Enam",
  77: "Tujuh Puluh Tujuh",
  78: "Tujuh Puluh Delapan",
  79: "Tujuh Puluh Sembilan",
  80: "Delapan Puluh",
  81: "Delapan Puluh Satu",
  82: "Delapan Puluh Dua",
  83: "Delapan Puluh Tiga",
  84: "Delapan Puluh Empat",
  85: "Delapan Puluh Lima",
  86: "Delapan Puluh Enam",
  87: "Delapan Puluh Tujuh",
  88: "Delapan Puluh Delapan",
  89: "Delapan Puluh Sembilan",
  90: "Sembilan Puluh",
  91: "Sembilan Puluh Satu",
  92: "Sembilan Puluh Dua",
  93: "Sembilan Puluh Tiga",
  94: "Sembilan Puluh Empat",
  95: "Sembilan Puluh Lima",
  96: "Sembilan Puluh Enam",
  97: "Sembilan Puluh Tujuh",
  98: "Sembilan Puluh Delapan",
  99: "Sembilan Puluh Sembilan",
  100: "Seratus"
};

export function terbilangNilai(val) {
  if (val === null || val === undefined || val === '') return '-';
  const num = Math.round(Number(val));
  if (isNaN(num)) return '-';
  if (ANGKA_KATA[num]) return ANGKA_KATA[num];

  // Algoritma standar jika di luar lookup
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (num < 12) return satuan[num];
  if (num < 20) return satuan[num - 10] + " Belas";
  if (num < 100) return satuan[Math.floor(num / 10)] + " Puluh" + (num % 10 !== 0 ? " " + satuan[num % 10] : "");
  if (num === 100) return "Seratus";
  return String(num);
}

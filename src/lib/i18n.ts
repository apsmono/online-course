export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

type Dict = {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroBody: string;
  startLearning: string;
  allModules: string;
  modules: string;
  topics: string;
  search: string;
  searchPlaceholder: string;
  searchEmpty: string;
  searchNoResults: string;
  lessons: string;
  lesson: string;
  minRead: string;
  level: string;
  levels: Record<Level, string>;
  onThisPage: string;
  previous: string;
  next: string;
  updated: string;
  partOf: string;
  alsoIn: string;
  browseTopics: string;
  planned: string;
  plannedNote: string;
  quizCheck: string;
  quizRetry: string;
  quizCorrect: string;
  quizWrong: string;
  quizScore: string;
  notFound: string;
  notFoundBody: string;
  goHome: string;
  footerNote: string;
  noLessonsYet: string;
  taggedWith: string;
};

export const levels = ["basic", "intermediate", "advanced"] as const;
export type Level = (typeof levels)[number];

export const dictionaries: Record<Locale, Dict> = {
  id: {
    siteName: "Course",
    tagline: "Belajar apa saja, gratis.",
    heroTitle: "Belajar hal baru, satu pelajaran setiap kali.",
    heroBody:
      "Materi terbuka dari dasar sampai lanjutan, ditulis ringkas dan bisa langsung dipraktikkan. Tanpa akun, tanpa biaya.",
    startLearning: "Mulai belajar",
    allModules: "Semua modul",
    modules: "Modul",
    topics: "Topik",
    search: "Cari",
    searchPlaceholder: "Cari pelajaran, topik, atau kata kunci...",
    searchEmpty: "Ketik untuk mulai mencari.",
    searchNoResults: "Tidak ada hasil untuk pencarian itu.",
    lessons: "pelajaran",
    lesson: "Pelajaran",
    minRead: "menit baca",
    level: "Tingkat",
    levels: { basic: "Dasar", intermediate: "Menengah", advanced: "Lanjutan" },
    onThisPage: "Di halaman ini",
    previous: "Sebelumnya",
    next: "Selanjutnya",
    updated: "Diperbarui",
    partOf: "Bagian dari",
    alsoIn: "Juga ada di",
    browseTopics: "Jelajahi topik",
    planned: "Direncanakan",
    plannedNote: "Materi berikut sedang disiapkan.",
    quizCheck: "Periksa jawaban",
    quizRetry: "Coba lagi",
    quizCorrect: "Benar",
    quizWrong: "Belum tepat",
    quizScore: "Skor",
    notFound: "Halaman tidak ditemukan",
    notFoundBody: "Materi yang kamu cari tidak ada atau sudah dipindahkan.",
    goHome: "Ke beranda",
    footerNote: "Dibuat untuk siapa saja yang ingin terus belajar.",
    noLessonsYet: "Belum ada pelajaran di sini.",
    taggedWith: "Bertanda",
  },
  en: {
    siteName: "Course",
    tagline: "Learn anything, for free.",
    heroTitle: "Learn something new, one lesson at a time.",
    heroBody:
      "Open material from the basics through to advanced topics, written to be short and immediately useful. No account, no cost.",
    startLearning: "Start learning",
    allModules: "All modules",
    modules: "Modules",
    topics: "Topics",
    search: "Search",
    searchPlaceholder: "Search lessons, topics, or keywords...",
    searchEmpty: "Start typing to search.",
    searchNoResults: "No results for that search.",
    lessons: "lessons",
    lesson: "Lesson",
    minRead: "min read",
    level: "Level",
    levels: { basic: "Basic", intermediate: "Intermediate", advanced: "Advanced" },
    onThisPage: "On this page",
    previous: "Previous",
    next: "Next",
    updated: "Updated",
    partOf: "Part of",
    alsoIn: "Also in",
    browseTopics: "Browse topics",
    planned: "Planned",
    plannedNote: "These lessons are being written.",
    quizCheck: "Check answer",
    quizRetry: "Try again",
    quizCorrect: "Correct",
    quizWrong: "Not quite",
    quizScore: "Score",
    notFound: "Page not found",
    notFoundBody: "The material you are looking for does not exist or has moved.",
    goHome: "Go home",
    footerNote: "Built for anyone who wants to keep learning.",
    noLessonsYet: "No lessons here yet.",
    taggedWith: "Tagged",
  },
};

export function t(locale: Locale) {
  return dictionaries[locale];
}

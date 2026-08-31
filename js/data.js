/**
 * Sumber data tunggal untuk seluruh koleksi buku.
 * Semua fitur (kartu, flipbook, pencarian, QR, unduh) membaca dari array ini,
 * sehingga menambahkan buku baru cukup dengan menambah satu object di sini.
 */
const BOOKS = [
  {
    id: "gratifikasi",
    slug: "pedoman-pengendalian-gratifikasi",
    title: "Pedoman Pengendalian Gratifikasi",
    subtitle: "",
    description:
      "Panduan lengkap untuk mencegah, menolak, melaporkan, dan mengendalikan gratifikasi di lingkungan BPSDMP.",
    category: "Integritas",
    keywords: ["gratifikasi", "pengendalian", "pelaporan", "integritas", "anti korupsi"],
    totalPages: 60,
    coverImage: "assets/books/gratifikasi/pages/1.jpg",
    pagesDir: "assets/books/gratifikasi/pages",
    thumbsDir: "assets/books/gratifikasi/thumbs",
    pdf: "assets/books/gratifikasi/pdf/Pedoman-Pengendalian-Gratifikasi-BPSDMP.pdf",
    pdfFileName: "Pedoman-Pengendalian-Gratifikasi-BPSDMP.pdf",
  },
  {
    id: "berintegritas",
    slug: "bpsdmp-berintegritas",
    title: "BPSDMP Berintegritas",
    subtitle: "",
    description:
      "Pedoman penguatan integritas ASN melalui nilai BerAKHLAK, kode etik, kode perilaku, dan budaya anti gratifikasi.",
    category: "Integritas",
    keywords: ["integritas", "berakhlak", "kode etik", "kode perilaku", "asn", "anti gratifikasi"],
    totalPages: 39,
    coverImage: "assets/books/berintegritas/pages/1.jpg",
    pagesDir: "assets/books/berintegritas/pages",
    thumbsDir: "assets/books/berintegritas/thumbs",
    pdf: "assets/books/berintegritas/pdf/BPSDMP-Berintegritas.pdf",
    pdfFileName: "BPSDMP-Berintegritas.pdf",
  },
  {
    id: "agen-perubahan",
    slug: "panduan-agen-perubahan",
    title: "Panduan Agen Perubahan",
    subtitle: "",
    description:
      "Panduan praktis bagi Agen Perubahan dalam menggerakkan perubahan positif di unit kerja.",
    category: "Agen Perubahan",
    keywords: ["agen perubahan", "perubahan", "reformasi birokrasi", "unit kerja"],
    totalPages: 32,
    coverImage: "assets/books/agen-perubahan/pages/1.jpg",
    pagesDir: "assets/books/agen-perubahan/pages",
    thumbsDir: "assets/books/agen-perubahan/thumbs",
    pdf: "assets/books/agen-perubahan/pdf/Panduan-Agen-Perubahan-BPSDMP.pdf",
    pdfFileName: "Panduan-Agen-Perubahan-BPSDMP.pdf",
  },
  {
    id: "smi",
    slug: "sistem-manajemen-integrasi-bpsdmp",
    title: "Sistem Manajemen Integrasi BPSDMP",
    subtitle: "Panduan Penerapan Mutu, Anti Penyuapan, dan Organisasi Pendidikan",
    description:
      "Panduan penerapan Sistem Manajemen Integrasi BPSDMP berbasis Sistem Manajemen Mutu, Sistem Manajemen Anti Penyuapan, dan Sistem Manajemen Organisasi Pendidikan.",
    category: "Sistem Manajemen",
    keywords: ["smi", "mutu", "anti penyuapan", "organisasi pendidikan", "iso", "sistem manajemen"],
    totalPages: 49,
    coverImage: "assets/books/smi/pages/1.jpg",
    pagesDir: "assets/books/smi/pages",
    thumbsDir: "assets/books/smi/thumbs",
    pdf: "assets/books/smi/pdf/Sistem-Manajemen-Integrasi-BPSDMP.pdf",
    pdfFileName: "Sistem-Manajemen-Integrasi-BPSDMP.pdf",
  },
];

// Helper agar file lain (main.js, flipbook.js) mudah mengambil buku
function getBookBySlug(slug) {
  return BOOKS.find((b) => b.slug === slug);
}
function getBookById(id) {
  return BOOKS.find((b) => b.id === id);
}
function pageImagePath(book, pageNumber) {
  return `${book.pagesDir}/${pageNumber}.jpg`;
}
function thumbImagePath(book, pageNumber) {
  return `${book.thumbsDir}/${pageNumber}.jpg`;
}

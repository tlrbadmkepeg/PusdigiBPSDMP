# Perpustakaan Digital BPSDMP

Website statis (HTML/CSS/JavaScript murni, tanpa backend) untuk membaca 4 buku
resmi BPSDMP secara online melalui flipbook interaktif.

## Cara menjalankan

Karena semua halaman buku dimuat sebagai file gambar, buka situs ini melalui
server lokal (bukan langsung dobel-klik `index.html`), misalnya:

```bash
cd perpustakaan-digital-bpsdmp
python3 -m http.server 8080
# lalu buka http://localhost:8080 di browser
```

Untuk deploy, unggah seluruh folder ini apa adanya ke hosting statis mana pun
(Netlify, Vercel, GitHub Pages, atau server web biasa).

## Struktur folder

```
index.html              Halaman utama (beranda, koleksi, tentang, footer)
css/style.css            Seluruh styling
js/data.js               Sumber data buku (tambah buku baru cukup di sini)
js/flipbook.js           Mesin flipbook (flip animation, zoom, fullscreen, dst.)
js/main.js               Logika aplikasi (render kartu, pencarian, modal QR, routing)
assets/img/               Logo & ilustrasi hero (lihat catatan di bawah)
assets/books/<slug>/pages/   Gambar tiap halaman buku (dipakai flipbook)
assets/books/<slug>/thumbs/  Thumbnail halaman (dipakai panel navigasi thumbnail)
assets/books/<slug>/pdf/     File PDF asli yang bisa diunduh pengguna
```

## Tentang sumber gambar halaman

4 file PDF yang diunggah ternyata berformat arsip berisi gambar JPEG per
halaman (bukan PDF biasa). Gambar-gambar itulah yang dipakai apa adanya
(tanpa diedit) untuk sampul, isi flipbook, dan thumbnail. File PDF yang bisa
diunduh pengguna (`assets/books/<slug>/pdf/*.pdf`) disusun ulang dari
gambar-gambar halaman asli tersebut (tanpa mengubah isi/urutan halaman) agar
menjadi file PDF yang valid dan bisa dibuka di pembaca PDF mana pun.

## Yang perlu diganti sebelum go-live

Dua aset berikut adalah placeholder buatan (bukan aset resmi Kementerian
Perdagangan), karena file logo resmi dan foto gedung tidak tersedia dalam
materi yang diunggah:

- `assets/img/logo-kemendag.svg` — ganti dengan file logo resmi Kementerian
  Perdagangan RI.
- `assets/img/hero-building.svg` — ganti dengan foto asli gedung
  BPSDMP/Kementerian Perdagangan.

Cukup timpa (replace) kedua file tersebut dengan nama file yang sama, atau
ubah path-nya di `index.html`.

Tautan Instagram/YouTube/Website di footer juga masih berupa `#` karena URL
resminya belum diberikan — isi `href` pada bagian `.footer-social` di
`index.html` setelah tersedia.

## Fitur yang sudah diimplementasikan

- Header sticky + hamburger menu di mobile
- Hero dengan CTA yang scroll otomatis ke Koleksi Buku
- 4 kartu buku (cover asli halaman pertama PDF, deskripsi, tombol Baca/Unduh/QR)
- Flipbook reader fullscreen: animasi balik halaman, 2 halaman berdampingan di
  desktop dan 1 halaman di mobile, navigasi tombol/keyboard/swipe, pinch-zoom,
  zoom in/out/reset, fullscreen, auto flip + pause, panel thumbnail (lazy
  loaded), slider halaman, unduh PDF
- QR Code fungsional per buku (dibuat dari URL aktif halaman, bisa diunduh
  sebagai PNG) — mengarah ke `#buku-<slug>` yang otomatis scroll & menyorot
  kartu buku terkait
- Pencarian judul/kategori/kata kunci
- Data-driven: seluruh fitur (kartu, flipbook, QR, unduh, pencarian) membaca
  dari satu array `BOOKS` di `js/data.js` — menambah buku baru cukup dengan
  menambah satu object baru di sana beserta folder asetnya
- Lazy loading gambar sampul & thumbnail, render halaman on-demand +
  preloading 1–2 halaman di sekitar halaman aktif
- Responsive penuh (desktop/tablet/mobile) dan aksesibilitas dasar (alt text,
  aria-label, fokus terlihat, navigasi keyboard)

## Menambah buku baru

1. Ekstrak gambar tiap halaman ke `assets/books/<slug-baru>/pages/1.jpg, 2.jpg, ...`
2. (Opsional) buat thumbnail kecil di `assets/books/<slug-baru>/thumbs/`
3. Taruh file PDF aslinya di `assets/books/<slug-baru>/pdf/`
4. Tambahkan satu object baru ke array `BOOKS` di `js/data.js`

Seluruh tampilan (kartu, flipbook, QR, unduh, pencarian) akan otomatis
menyesuaikan tanpa perlu mengubah kode lain.

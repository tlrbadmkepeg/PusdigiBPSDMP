(function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Referensi elemen                                                  */
  /* ---------------------------------------------------------------- */
  const bookGrid = document.getElementById("book-grid");
  const noResults = document.getElementById("no-results");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileNav = document.getElementById("mobile-nav");
  const btnJelajahi = document.getElementById("btn-jelajahi");

  const searchFormDesktop = document.getElementById("search-form-desktop");
  const searchInputDesktop = document.getElementById("search-input-desktop");
  const searchFormMobile = document.getElementById("search-form-mobile");
  const searchInputMobile = document.getElementById("search-input-mobile");

  const qrOverlay = document.getElementById("qr-overlay");
  const qrClose = document.getElementById("qr-close");
  const qrBookTitle = document.getElementById("qr-book-title");
  const qrCodeHolder = document.getElementById("qr-code-holder");
  const qrDownloadBtn = document.getElementById("qr-download");

  const flipbook = new Flipbook({
    reader: document.getElementById("reader"),
    readerTitle: document.getElementById("reader-title"),
    loading: document.getElementById("reader-loading"),
    loadingText: document.getElementById("reader-loading-text"),
    progressBar: document.getElementById("reader-progress-bar"),
    spread: document.getElementById("spread"),
    stage: document.getElementById("flipbook-stage"),
    zoomLayer: document.getElementById("flipbook-zoom"),
    prevBtn: document.getElementById("flip-prev"),
    nextBtn: document.getElementById("flip-next"),
    pageIndicator: document.getElementById("reader-page-indicator"),
    slider: document.getElementById("reader-slider"),
    thumbDrawer: document.getElementById("thumb-drawer"),
    thumbDrawerInner: document.getElementById("thumb-drawer-inner"),
    autoFlipBtn: document.getElementById("auto-flip"),
    fullscreenBtn: document.getElementById("reader-fullscreen"),
  });

  let currentQrBook = null;

  /* ---------------------------------------------------------------- */
  /* Render kartu buku (data-driven — dari BOOKS di data.js)           */
  /* ---------------------------------------------------------------- */
  function iconSvg(name) {
    const icons = {
      qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 19h2v2h-2zM14 19h2v2h-2zM19 14h2v2h-2z"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    };
    return icons[name] || "";
  }

  function renderBookCard(book) {
    const card = document.createElement("article");
    card.className = "book-card";
    card.id = `buku-${book.slug}`;

    card.innerHTML = `
      <div class="book-card__cover">
        <img src="${book.coverImage}" alt="Sampul buku ${book.title}" loading="lazy" width="924" height="1316">
      </div>
      <div class="book-card__body">
        <span class="book-card__category">${book.category}</span>
        <h3>${book.title}</h3>
        ${book.subtitle ? `<p class="book-card__subtitle">${book.subtitle}</p>` : ""}
        <p class="desc">${book.description}</p>
        <p class="book-card__meta">${book.totalPages} halaman</p>
        <div class="book-card__actions">
          <button class="btn btn--primary btn-baca" data-slug="${book.slug}">${iconSvg("book")} BACA BUKU</button>
          <button class="btn btn--outline btn-unduh" data-slug="${book.slug}">${iconSvg("download")} UNDUH PDF</button>
          <button class="btn btn--icon btn-qr" data-slug="${book.slug}" aria-label="Tampilkan QR Code untuk ${book.title}" title="QR Code">${iconSvg("qr")}</button>
        </div>
      </div>
    `;
    return card;
  }

  function renderGrid(list) {
    bookGrid.innerHTML = "";
    if (list.length === 0) {
      noResults.classList.add("is-visible");
      return;
    }
    noResults.classList.remove("is-visible");
    list.forEach((book) => bookGrid.appendChild(renderBookCard(book)));
  }

  renderGrid(BOOKS);

  // Statistik total halaman untuk bagian "Tentang"
  const totalPages = BOOKS.reduce((sum, b) => sum + b.totalPages, 0);
  document.getElementById("stat-pages").textContent = totalPages;
  document.getElementById("footer-year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------- */
  /* Aksi kartu: delegasi event                                        */
  /* ---------------------------------------------------------------- */
  bookGrid.addEventListener("click", (e) => {
    const bacaBtn = e.target.closest(".btn-baca");
    const unduhBtn = e.target.closest(".btn-unduh");
    const qrBtn = e.target.closest(".btn-qr");

    if (bacaBtn) {
      const book = getBookBySlug(bacaBtn.dataset.slug);
      if (book) openReader(book);
    } else if (unduhBtn) {
      const book = getBookBySlug(unduhBtn.dataset.slug);
      if (book) downloadPdf(book);
    } else if (qrBtn) {
      const book = getBookBySlug(qrBtn.dataset.slug);
      if (book) openQrModal(book);
    }
  });

  function downloadPdf(book) {
    const a = document.createElement("a");
    a.href = book.pdf;
    a.download = book.pdfFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------------------------------------------------------------- */
  /* Flipbook reader — buka/tutup & tombol kontrol                     */
  /* ---------------------------------------------------------------- */
  function openReader(book, page) {
    flipbook.open(book, page || 1);
  }

  document.getElementById("reader-close").addEventListener("click", () => flipbook.close());
  document.getElementById("reader-download").addEventListener("click", () => {
    if (flipbook.book) downloadPdf(flipbook.book);
  });
  document.getElementById("reader-fullscreen").addEventListener("click", () => flipbook.toggleFullscreen());
  document.getElementById("auto-flip").addEventListener("click", () => flipbook.toggleAutoFlip());
  document.getElementById("thumb-toggle").addEventListener("click", () => flipbook.toggleThumbs());
  document.getElementById("zoom-in").addEventListener("click", () => flipbook.zoomIn());
  document.getElementById("zoom-out").addEventListener("click", () => flipbook.zoomOut());
  document.getElementById("zoom-reset").addEventListener("click", () => flipbook.zoomReset());
  document.getElementById("reader-slider").addEventListener("input", (e) => {
    flipbook.goToPage(Number(e.target.value));
  });
  document.getElementById("reader-qr").addEventListener("click", () => {
    if (flipbook.book) openQrModal(flipbook.book);
  });

  /* ---------------------------------------------------------------- */
  /* Modal QR Code                                                     */
  /* ---------------------------------------------------------------- */
  function bookUrl(book) {
    const base = location.href.split("#")[0];
    return `${base}#buku-${book.slug}`;
  }

  function openQrModal(book) {
    currentQrBook = book;
    qrBookTitle.textContent = book.title;
    qrCodeHolder.innerHTML = "";
    const canvas = document.createElement("canvas");
    qrCodeHolder.appendChild(canvas);
    const url = bookUrl(book);

    if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
      window.QRCode.toCanvas(canvas, url, { width: 200, margin: 1, color: { dark: "#0b2c56" } }, (err) => {
        if (err) qrCodeHolder.innerHTML = `<p style="font-size:12px;word-break:break-all;">${url}</p>`;
      });
    } else {
      qrCodeHolder.innerHTML = `<p style="font-size:12px;word-break:break-all;">${url}</p>`;
    }
    qrOverlay.classList.add("is-open");
  }

  function closeQrModal() {
    qrOverlay.classList.remove("is-open");
    currentQrBook = null;
  }

  qrClose.addEventListener("click", closeQrModal);
  qrOverlay.addEventListener("click", (e) => {
    if (e.target === qrOverlay) closeQrModal();
  });
  qrDownloadBtn.addEventListener("click", () => {
    const canvas = qrCodeHolder.querySelector("canvas");
    if (!canvas || !currentQrBook) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `QR-${currentQrBook.slug}.png`;
    a.click();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qrOverlay.classList.contains("is-open")) closeQrModal();
  });

  /* ---------------------------------------------------------------- */
  /* Pencarian                                                          */
  /* ---------------------------------------------------------------- */
  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function searchBooks(query) {
    const q = normalize(query).trim();
    if (!q) return BOOKS;
    return BOOKS.filter((b) => {
      const haystack = normalize(
        [b.title, b.subtitle, b.description, b.category, ...(b.keywords || [])].join(" ")
      );
      return haystack.includes(q);
    });
  }

  function handleSearch(query) {
    renderGrid(searchBooks(query));
    document.getElementById("koleksi").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  searchFormDesktop.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch(searchInputDesktop.value);
  });
  searchFormMobile.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch(searchInputMobile.value);
    closeMobileNav();
  });
  searchInputDesktop.addEventListener("input", () => renderGrid(searchBooks(searchInputDesktop.value)));
  searchInputMobile.addEventListener("input", () => renderGrid(searchBooks(searchInputMobile.value)));

  /* ---------------------------------------------------------------- */
  /* Navigasi mobile                                                    */
  /* ---------------------------------------------------------------- */
  function openMobileNav() {
    mobileNav.classList.add("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  hamburgerBtn.addEventListener("click", () => {
    mobileNav.classList.contains("is-open") ? closeMobileNav() : openMobileNav();
  });
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileNav));

  /* ---------------------------------------------------------------- */
  /* Hero CTA — scroll ke koleksi                                      */
  /* ---------------------------------------------------------------- */
  btnJelajahi.addEventListener("click", () => {
    document.getElementById("koleksi").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------------------------------------------------------------- */
  /* Highlight menu aktif saat scroll                                  */
  /* ---------------------------------------------------------------- */
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = ["beranda", "koleksi", "tentang", "panduan", "kontak"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("is-active"));
          const match = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
          if (match) match.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => observer.observe(s));

  /* ---------------------------------------------------------------- */
  /* Routing sederhana via hash — dipakai oleh QR Code                 */
  /* Format: #buku-<slug>  → scroll & sorot kartu buku terkait          */
  /* ---------------------------------------------------------------- */
  function handleHashRoute() {
    const hash = location.hash.replace("#", "");
    if (!hash.startsWith("buku-")) return;
    const slug = hash.replace("buku-", "");
    const book = getBookBySlug(slug);
    if (!book) return;
    // pastikan grid menampilkan semua buku (bukan hasil filter kosong)
    renderGrid(BOOKS);
    requestAnimationFrame(() => {
      const card = document.getElementById(`buku-${slug}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("is-highlighted");
        setTimeout(() => card.classList.remove("is-highlighted"), 2600);
      }
    });
  }
  window.addEventListener("hashchange", handleHashRoute);
  window.addEventListener("load", handleHashRoute);
})();

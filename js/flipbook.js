/**
 * Flipbook — mesin flipbook ringan berbasis gambar halaman (JPEG) yang sudah
 * di-render sebelumnya, dengan animasi membalik halaman 3D (CSS transform),
 * zoom, fullscreen, auto flip, thumbnail, dan navigasi keyboard/swipe.
 */
class Flipbook {
  constructor(els) {
    this.els = els; // dom refs, lihat main.js
    this.book = null;
    this.currentRight = 1; // nomor halaman yang tampil di kanan (desktop) / halaman aktif (mobile)
    this.zoom = 1;
    this.isAnimating = false;
    this.autoFlipTimer = null;
    this.autoFlipOn = false;
    this.thumbsBuilt = false;
    this.imageCache = new Set();
    this.pan = { x: 0, y: 0, dragging: false, startX: 0, startY: 0 };

    this._bindStaticEvents();
    window.addEventListener("resize", () => this._renderStatic());
  }

  get isMobile() {
    return window.innerWidth <= 900;
  }
  get pairStep() {
    return this.isMobile ? 1 : 2;
  }

  /* ---------------------------------------------------------------- */
  open(book, startPage = 1) {
    this.book = book;
    this.currentRight = this.isMobile ? startPage : startPage % 2 === 0 ? startPage + 1 : startPage;
    this.zoom = 1;
    this.autoFlipOn = false;
    this.thumbsBuilt = false;
    this._clearAutoFlip();
    this.els.reader.classList.add("is-open");
    this.els.readerTitle.textContent = book.title;
    document.body.style.overflow = "hidden";
    this._showLoading(true, "Memuat buku…");
    this._preload(startPage, () => {
      this._showLoading(false);
      this._renderStatic();
    });
  }

  close() {
    this.els.reader.classList.remove("is-open");
    document.body.style.overflow = "";
    this._clearAutoFlip();
    this._setZoom(1);
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    this.els.thumbDrawer.classList.remove("is-open");
  }

  /* ---------------------------------------------------------------- */
  _preload(centerPage, done) {
    const total = this.book.totalPages;
    const toLoad = [];
    for (let p = Math.max(1, centerPage - 1); p <= Math.min(total, centerPage + 2); p++) {
      toLoad.push(p);
    }
    let loaded = 0;
    if (toLoad.length === 0) return done();
    toLoad.forEach((p) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        const pct = Math.round((loaded / toLoad.length) * 100);
        if (this.els.progressBar) this.els.progressBar.style.width = pct + "%";
        if (loaded === toLoad.length) done();
      };
      img.src = pageImagePath(this.book, p);
      this.imageCache.add(p);
    });
  }

  _preloadAround(page) {
    const total = this.book.totalPages;
    for (let p = page - 1; p <= page + 2; p++) {
      if (p >= 1 && p <= total && !this.imageCache.has(p)) {
        const img = new Image();
        img.src = pageImagePath(this.book, p);
        this.imageCache.add(p);
      }
    }
  }

  _showLoading(show, text) {
    this.els.loading.classList.toggle("is-hidden", !show);
    if (text) this.els.loadingText.textContent = text;
    if (this.els.progressBar) this.els.progressBar.style.width = "0%";
  }

  /* ---------------------------------------------------------------- */
  _pageSrc(n) {
    if (n < 1 || n > this.book.totalPages) return null;
    return pageImagePath(this.book, n);
  }

  _renderStatic() {
    if (!this.book) return;
    const spread = this.els.spread;
    spread.innerHTML = "";

    if (this.isMobile) {
      const leaf = this._makeLeaf("leaf--single", this.currentRight);
      spread.appendChild(leaf);
    } else {
      const leftNum = this.currentRight - 1 >= 1 ? this.currentRight - 1 : null;
      const leftLeaf = this._makeLeaf("leaf--left", leftNum);
      const rightLeaf = this._makeLeaf("leaf--right", this.currentRight);
      spread.appendChild(leftLeaf);
      spread.appendChild(rightLeaf);
    }
    this._updateUI();
    this._preloadAround(this.currentRight);
  }

  _makeLeaf(cls, pageNum) {
    const div = document.createElement("div");
    div.className = "leaf " + cls;
    const src = pageNum ? this._pageSrc(pageNum) : null;
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${this.book.title} — halaman ${pageNum}`;
      img.draggable = false;
      div.appendChild(img);
      div.dataset.page = pageNum;
    } else {
      div.style.visibility = "hidden";
    }
    return div;
  }

  /* ---------------------------------------------------------------- */
  next() {
    if (!this.book || this.isAnimating) return;
    const step = this.pairStep;
    const newRight = this.currentRight + step;
    if (this.currentRight > this.book.totalPages) return;
    if (this.currentRight >= this.book.totalPages && step === 2) return;
    if (this.currentRight >= this.book.totalPages && step === 1) return;

    this.isAnimating = true;

    if (this.isMobile) {
      this._animateFlip("forward-single", this.currentRight, newRight, () => {
        this.currentRight = Math.min(newRight, this.book.totalPages);
        this._renderStatic();
        this.isAnimating = false;
      });
    } else {
      const newLeft = this.currentRight + 1;
      this._animateFlip("forward", this.currentRight, newLeft, newRight, () => {
        this.currentRight = newRight;
        this._renderStatic();
        this.isAnimating = false;
      });
    }
  }

  prev() {
    if (!this.book || this.isAnimating) return;
    const step = this.pairStep;
    if (this.currentRight - step < (this.isMobile ? 1 : -0)) {
      if (this.isMobile && this.currentRight <= 1) return;
      if (!this.isMobile && this.currentRight <= 1) return;
    }

    this.isAnimating = true;

    if (this.isMobile) {
      const newRight = Math.max(1, this.currentRight - 1);
      if (newRight === this.currentRight) {
        this.isAnimating = false;
        return;
      }
      this._animateFlip("backward-single", this.currentRight, newRight, () => {
        this.currentRight = newRight;
        this._renderStatic();
        this.isAnimating = false;
      });
    } else {
      const curLeft = this.currentRight - 1;
      if (curLeft < 1) {
        this.isAnimating = false;
        return;
      }
      const newRight = curLeft - 1;
      const newLeft = curLeft - 2;
      this._animateFlip("backward", curLeft, newLeft, newRight, () => {
        this.currentRight = newRight >= 1 ? newRight : 1;
        this._renderStatic();
        this.isAnimating = false;
      });
    }
  }

  _animateFlip(mode, a, b, c, cb) {
    // Buat layer transisi di atas spread statis, lalu animasikan rotateY.
    const stage = this.els.spread;
    const rect = stage.getBoundingClientRect();
    const layer = document.createElement("div");
    let cbFinal = cb;
    let frontSrc, backSrc, originClass, rotateClass;

    if (mode === "forward") {
      frontSrc = this._pageSrc(a); // halaman kanan saat ini
      backSrc = this._pageSrc(b); // jadi halaman kiri baru
      layer.className = "flip-layer flip-layer--right";
      originClass = "flipping-forward";
    } else if (mode === "backward") {
      frontSrc = this._pageSrc(a); // halaman kiri saat ini
      backSrc = this._pageSrc(b); // jadi halaman kanan baru
      layer.className = "flip-layer flip-layer--left";
      originClass = "flipping-backward";
    } else if (mode === "forward-single") {
      frontSrc = this._pageSrc(a);
      backSrc = this._pageSrc(b);
      layer.className = "flip-layer flip-layer--right";
      layer.style.width = "100%";
      layer.style.left = "0";
      layer.style.right = "auto";
      originClass = "flipping-forward";
      cbFinal = cb;
    } else if (mode === "backward-single") {
      frontSrc = this._pageSrc(a);
      backSrc = this._pageSrc(b);
      layer.className = "flip-layer flip-layer--left";
      layer.style.width = "100%";
      layer.style.right = "auto";
      layer.style.left = "0";
      originClass = "flipping-backward";
    }

    const front = document.createElement("div");
    front.className = "flip-layer__face flip-layer__face--front";
    if (frontSrc) {
      const img = document.createElement("img");
      img.src = frontSrc;
      front.appendChild(img);
    }
    const back = document.createElement("div");
    back.className = "flip-layer__face flip-layer__face--back";
    if (backSrc) {
      const img = document.createElement("img");
      img.src = backSrc;
      back.appendChild(img);
    }
    layer.appendChild(front);
    layer.appendChild(back);
    stage.appendChild(layer);

    // paksa reflow lalu jalankan transisi
    // eslint-disable-next-line no-unused-expressions
    layer.offsetHeight;
    requestAnimationFrame(() => {
      layer.classList.add(originClass);
    });

    const onEnd = () => {
      layer.removeEventListener("transitionend", onEnd);
      layer.remove();
      cbFinal && cbFinal();
    };
    layer.addEventListener("transitionend", onEnd);
    // fallback jika transitionend tidak terpicu (misal display none tiba-tiba)
    setTimeout(() => {
      if (layer.parentNode) onEnd();
    }, 700);
  }

  /* ---------------------------------------------------------------- */
  goToPage(n) {
    if (!this.book || this.isAnimating) return;
    n = Math.max(1, Math.min(this.book.totalPages, n));
    if (this.isMobile) {
      this.currentRight = n;
    } else {
      this.currentRight = n % 2 === 0 ? n + 1 : n;
      if (this.currentRight > this.book.totalPages) this.currentRight = n;
    }
    this._renderStatic();
    this._preloadAround(n);
  }

  /* ---------------------------------------------------------------- */
  _updateUI() {
    const total = this.book.totalPages;
    const current = this.isMobile
      ? this.currentRight
      : Math.min(this.currentRight, total);
    this.els.pageIndicator.textContent = `${current} / ${total}`;
    this.els.slider.max = total;
    this.els.slider.value = current;

    const atStart = this.isMobile ? this.currentRight <= 1 : this.currentRight <= 1;
    const atEnd = this.isMobile
      ? this.currentRight >= total
      : this.currentRight >= total;
    this.els.prevBtn.disabled = atStart;
    this.els.nextBtn.disabled = atEnd;
    this.els.prevBtn.style.opacity = atStart ? 0.35 : 1;
    this.els.nextBtn.style.opacity = atEnd ? 0.35 : 1;

    if (this.thumbsBuilt) this._highlightThumb(current);
  }

  /* ---------------------------------------------------------------- */
  buildThumbnails() {
    if (this.thumbsBuilt || !this.book) return;
    const holder = this.els.thumbDrawerInner;
    holder.innerHTML = "";
    for (let p = 1; p <= this.book.totalPages; p++) {
      const item = document.createElement("div");
      item.className = "thumb-item";
      item.dataset.page = p;
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = thumbImagePath(this.book, p);
      img.alt = `Halaman ${p}`;
      const label = document.createElement("span");
      label.textContent = p;
      item.appendChild(img);
      item.appendChild(label);
      item.addEventListener("click", () => {
        this.goToPage(p);
        this.els.thumbDrawer.classList.remove("is-open");
      });
      holder.appendChild(item);
    }
    this.thumbsBuilt = true;
  }

  _highlightThumb(page) {
    this.els.thumbDrawerInner.querySelectorAll(".thumb-item").forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.page) === page);
    });
  }

  toggleThumbs() {
    if (!this.thumbsBuilt) this.buildThumbnails();
    this.els.thumbDrawer.classList.toggle("is-open");
  }

  /* ---------------------------------------------------------------- */
  _setZoom(z) {
    this.zoom = Math.max(1, Math.min(2.5, z));
    this.els.zoomLayer.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
    if (this.zoom === 1) {
      this.pan = { ...this.pan, x: 0, y: 0 };
      this.els.zoomLayer.style.transform = `scale(1)`;
    }
  }
  zoomIn() {
    this._setZoom(this.zoom + 0.25);
  }
  zoomOut() {
    this._setZoom(this.zoom - 0.25);
  }
  zoomReset() {
    this.pan = { x: 0, y: 0, dragging: false, startX: 0, startY: 0 };
    this._setZoom(1);
  }

  /* ---------------------------------------------------------------- */
  toggleAutoFlip() {
    this.autoFlipOn = !this.autoFlipOn;
    this.els.autoFlipBtn.classList.toggle("is-active", this.autoFlipOn);
    this.els.autoFlipBtn.setAttribute("title", this.autoFlipOn ? "Pause" : "Auto Flip");
    if (this.autoFlipOn) {
      this.autoFlipTimer = setInterval(() => {
        const total = this.book.totalPages;
        if (this.currentRight >= total) {
          this._clearAutoFlip();
          this.autoFlipOn = false;
          this.els.autoFlipBtn.classList.remove("is-active");
          return;
        }
        this.next();
      }, 5000);
    } else {
      this._clearAutoFlip();
    }
  }
  _clearAutoFlip() {
    if (this.autoFlipTimer) {
      clearInterval(this.autoFlipTimer);
      this.autoFlipTimer = null;
    }
  }

  /* ---------------------------------------------------------------- */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.els.reader.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ---------------------------------------------------------------- */
  _bindStaticEvents() {
    const { prevBtn, nextBtn, stage, zoomLayer } = this.els;
    prevBtn.addEventListener("click", () => this.prev());
    nextBtn.addEventListener("click", () => this.next());

    // klik area tepi halaman
    stage.addEventListener("click", (e) => {
      if (this.zoom > 1) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      if (e.target.closest(".flip-nav")) return;
      if (ratio > 0.82) this.next();
      else if (ratio < 0.18) this.prev();
    });

    // keyboard
    document.addEventListener("keydown", (e) => {
      if (!this.els.reader.classList.contains("is-open")) return;
      if (e.key === "ArrowRight") this.next();
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "Escape") this.close();
    });

    // swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let pinchStartDist = null;
    stage.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 2) {
          pinchStartDist = this._touchDist(e.touches);
        } else if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2 && pinchStartDist) {
          const dist = this._touchDist(e.touches);
          const delta = (dist - pinchStartDist) / 200;
          this._setZoom(this.zoom + delta);
          pinchStartDist = dist;
        }
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      (e) => {
        pinchStartDist = null;
        if (this.zoom > 1) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStartX;
        const dy = endY - touchStartY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) this.next();
          else this.prev();
        }
      },
      { passive: true }
    );

    // pan saat zoom (mouse)
    zoomLayer.addEventListener("mousedown", (e) => {
      if (this.zoom <= 1) return;
      this.pan.dragging = true;
      this.pan.startX = e.clientX - this.pan.x;
      this.pan.startY = e.clientY - this.pan.y;
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.pan.dragging) return;
      this.pan.x = e.clientX - this.pan.startX;
      this.pan.y = e.clientY - this.pan.startY;
      this.els.zoomLayer.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
    });
    window.addEventListener("mouseup", () => {
      this.pan.dragging = false;
    });

    document.addEventListener("fullscreenchange", () => {
      this.els.fullscreenBtn.classList.toggle("is-active", !!document.fullscreenElement);
    });
  }

  _touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

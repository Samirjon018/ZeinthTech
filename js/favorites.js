// Sevimlilar, ko'rilganlar va umumiy yordamchilar. Hammasi bitta ZT obyektida.
const ZT = {
  FAV_KEY: 'zenithtech_favorites',
  VIEWED_KEY: 'zenithtech_viewed',

  // Rasm topilmasa chiqadigan vaqtincha rasm
  placeholder:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="100%" height="100%" fill="#1A1A1F"/>' +
      '<text x="50%" y="50%" fill="#D4AF37" font-family="Arial" font-size="22" ' +
      'text-anchor="middle" dominant-baseline="middle">ZenithTech</text></svg>'
    ),

  formatPrice(n) {
    return n.toLocaleString('ru-RU') + " so'm";
  },

  // ----- Xotira bilan ishlash -----
  read(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  write(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // xotira yopiq bo'lsa ham sayt ishlayveradi
    }
  },

  // ----- Sevimlilar -----
  getFavorites() {
    return ZT.read(ZT.FAV_KEY);
  },

  isFavorite(id) {
    return ZT.getFavorites().includes(id);
  },

  // Qo'shadi yoki olib tashlaydi. true qaytarsa, endi sevimlilarda.
  toggleFavorite(id) {
    const favs = ZT.getFavorites();
    const index = favs.indexOf(id);
    if (index === -1) favs.push(id);
    else favs.splice(index, 1);
    ZT.write(ZT.FAV_KEY, favs);
    ZT.updateBadge();
    return index === -1;
  },

  updateBadge() {
    const el = document.getElementById('fav-count');
    if (!el) return;
    const n = ZT.getFavorites().length;
    el.textContent = n;
    el.hidden = n === 0;
  },

  // ----- Ko'rilganlar -----
  getViewed() {
    return ZT.read(ZT.VIEWED_KEY);
  },

  addViewed(id) {
    const list = ZT.getViewed().filter((x) => x !== id);
    list.unshift(id); // eng oxirgisi birinchi
    ZT.write(ZT.VIEWED_KEY, list.slice(0, 12));
  },

  renderViewed(products, { section, row, excludeId }) {
    if (!section || !row) return;
    const items = ZT.getViewed()
      .filter((id) => id !== excludeId)
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 8);

    if (items.length === 0) {
      section.hidden = true;
      return;
    }
    row.innerHTML = items.map((p) => ZT.miniCardHTML(p)).join('');
    section.hidden = false;
  },

  // ----- Kichik xabar (toast) -----
  toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    void el.offsetWidth; // animatsiya ishlashi uchun
    el.classList.add('show');
    clearTimeout(ZT.toastTimer);
    ZT.toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  },

  // Bir marta ulanadi, ichidagi hamma yurakchalar uchun ishlaydi
  bindFavButtons(container, onChange) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fav]');
      if (!btn) return;

      const id = Number(btn.dataset.fav);
      const on = ZT.toggleFavorite(id);

      btn.classList.toggle('active', on);
      btn.textContent = on ? '♥' : '♡';
      btn.setAttribute('aria-pressed', String(on));
      ZT.toast(on ? "Sevimlilarga qo'shildi ♥" : "Sevimlilardan olib tashlandi");

      if (onChange) onChange(id, on);
    });
  },

  // ----- Shablonlar -----
  heartHTML(id, extraClass = '') {
    const on = ZT.isFavorite(id);
    return `<button class="fav-btn ${on ? 'active' : ''} ${extraClass}" data-fav="${id}"
              aria-label="Sevimlilarga qo'shish" aria-pressed="${on}">${on ? '♥' : '♡'}</button>`;
  },

  // Katalogdagi to'liq kartochka
  cardHTML(p) {
    const hasDiscount = p.oldPrice && p.oldPrice > p.price;
    const discount = hasDiscount
      ? Math.round((1 - p.price / p.oldPrice) * 100)
      : 0;

    return `
      <article class="product-card ${p.inStock ? '' : 'out'}">
        ${hasDiscount ? `<span class="badge">-${discount}%</span>` : ''}
        ${ZT.heartHTML(p.id)}
        <a href="product.html?id=${p.id}" class="card-img-link">
          <img src="${p.image}" alt="${p.name}"
               onerror="this.onerror=null; this.src='${ZT.placeholder}'">
        </a>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <span class="rating">★ ${p.rating} <small>(${p.reviews})</small></span>
          <div class="price-row">
            <span class="price">${ZT.formatPrice(p.price)}</span>
            <span class="old-price ${hasDiscount ? '' : 'ghost'}">${hasDiscount ? ZT.formatPrice(p.oldPrice) : '&nbsp;'}</span>
          </div>
          <button class="btn" data-id="${p.id}" ${p.inStock ? '' : 'disabled'}>
            ${p.inStock ? 'Savatga' : "Sotuvda yo'q"}
          </button>
        </div>
      </article>`;
  },

  // Kichik kartochka (o'xshash va ko'rilgan mahsulotlar uchun)
  miniCardHTML(p) {
    return `
      <a class="related-card" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}"
             onerror="this.onerror=null; this.src='${ZT.placeholder}'">
        <div>
          <span>${p.name}</span>
          <strong>${ZT.formatPrice(p.price)}</strong>
        </div>
      </a>`;
  },
};

document.addEventListener('DOMContentLoaded', ZT.updateBadge);
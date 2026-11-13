const pageEl = document.getElementById('product-page');

// Manzildagi ?id=3 qismidan mahsulot raqamini oladi
const params = new URLSearchParams(window.location.search);
const id = Number(params.get('id'));

let products = [];
let qty = 1;
const MAX_QTY = 10;

function showNotFound() {
  pageEl.innerHTML = `
    <div class="empty-cart">
      <p>Mahsulot topilmadi.</p>
      <a href="index.html" class="btn-link">Bosh sahifaga qaytish</a>
    </div>`;
}

async function init() {
  if (!id) return showNotFound();

  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    products = await res.json();
  } catch (err) {
    console.error(err);
    pageEl.innerHTML = "<p>Sahifani yuklab bo'lmadi.</p>";
    return;
  }

  const product = products.find((p) => p.id === id);
  if (!product) return showNotFound();

  ZT.addViewed(id); // ko'rilganlar ro'yxatiga yozib qo'yamiz
  document.title = `${product.name} | ZenithTech`;
  render(product);

  ZT.renderViewed(products, {
    section: document.getElementById('viewed-section'),
    row: document.getElementById('viewed-row'),
    excludeId: id,
  });
}

function render(p) {
  const hasDiscount = p.oldPrice && p.oldPrice > p.price;
  const discount = hasDiscount
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;

  const specsRows = p.specs
    ? Object.entries(p.specs)
        .map(([key, value]) => `<tr><th>${key}</th><td>${value}</td></tr>`)
        .join('')
    : '';

  const related = products
    .filter((x) => x.category === p.category && x.id !== p.id)
    .slice(0, 4);

  pageEl.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Bosh sahifa</a> / <span>${p.category}</span> / <span>${p.name}</span>
    </nav>

    <div class="product-detail">
      <div class="detail-image">
        <img src="${p.image}" alt="${p.name}"
             onerror="this.onerror=null; this.src='${ZT.placeholder}'">
      </div>

      <div class="detail-info">
        ${p.brand ? `<span class="product-category">${p.brand}</span>` : ''}

        <div class="title-row">
          <h1>${p.name}</h1>
          ${ZT.heartHTML(p.id)}
        </div>

        ${p.rating ? `<span class="rating">★ ${p.rating} <small>(${p.reviews} ta sharh)</small></span>` : ''}

        <div class="detail-price">
          <span class="price-big">${ZT.formatPrice(p.price)}</span>
          ${hasDiscount ? `<span class="old-price">${ZT.formatPrice(p.oldPrice)}</span>
                           <span class="badge-inline">-${discount}%</span>` : ''}
        </div>

        <p class="stock ${p.inStock ? 'in' : 'out'}">
          ${p.inStock ? 'Sotuvda bor' : "Sotuvda yo'q"}
        </p>

        ${p.description ? `<p class="detail-desc">${p.description}</p>` : ''}

        ${
          p.inStock
            ? `<div class="buy-row">
                 <div class="qty">
                   <button class="qty-btn" id="qty-dec">−</button>
                   <span id="qty-value">1</span>
                   <button class="qty-btn" id="qty-inc">+</button>
                 </div>
                 <button class="btn" id="add-btn">Savatga qo'shish</button>
               </div>`
            : `<button class="btn" disabled>Sotuvda yo'q</button>`
        }
      </div>
    </div>

    ${specsRows ? `<section class="specs"><h3>Xususiyatlari</h3><table>${specsRows}</table></section>` : ''}

    ${
      related.length
        ? `<section class="related">
             <h3>O'xshash mahsulotlar</h3>
             <div class="related-grid">
               ${related.map((r) => ZT.miniCardHTML(r)).join('')}
             </div>
           </section>`
        : ''
    }

    <section class="viewed-section" id="viewed-section" hidden>
      <h3>Siz ko'rgan mahsulotlar</h3>
      <div class="viewed-row" id="viewed-row"></div>
    </section>
  `;
}

function updateQty() {
  document.getElementById('qty-value').textContent = qty;
}

pageEl.addEventListener('click', (e) => {
  if (e.target.closest('#qty-inc')) {
    qty = Math.min(qty + 1, MAX_QTY);
    updateQty();
  }

  if (e.target.closest('#qty-dec')) {
    qty = Math.max(qty - 1, 1);
    updateQty();
  }

  const addBtn = e.target.closest('#add-btn');
  if (addBtn) {
    addToCart(id, qty);
    addBtn.textContent = "Qo'shildi ✓";
    setTimeout(() => (addBtn.textContent = "Savatga qo'shish"), 1200);
  }
});

ZT.bindFavButtons(pageEl);

init();
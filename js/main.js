const grid = document.getElementById('product-grid');
const categoriesEl = document.getElementById('categories');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const countEl = document.getElementById('result-count');

let allProducts = [];
const state = { category: 'Hammasi', query: '', sort: 'default' };

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
    '<rect width="100%" height="100%" fill="#E3E6EB"/>' +
    '<text x="50%" y="50%" fill="#8A93A5" font-family="Arial" font-size="22" ' +
    'text-anchor="middle" dominant-baseline="middle">ZenithTech</text></svg>'
  );

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + " so'm";
}

async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    allProducts = await res.json();
    renderCategories();
    update();
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Mahsulotlarni yuklab bo'lmadi.</p>";
  }
}

// Kategoriya tugmalarini JSON'dagi kategoriyalardan o'zi yasaydi
function renderCategories() {
  const names = ['Hammasi', ...new Set(allProducts.map((p) => p.category))];
  categoriesEl.innerHTML = names
    .map(
      (n) =>
        `<button class="chip ${n === state.category ? 'active' : ''}" data-category="${n}">${n}</button>`
    )
    .join('');
}

// Filtr, qidiruv va saralashni qo'llaydi
function getVisibleProducts() {
  const q = state.query.trim().toLowerCase();

  const list = allProducts.filter((p) => {
    const matchCategory =
      state.category === 'Hammasi' || p.category === state.category;
    const text = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
    return matchCategory && (!q || text.includes(q));
  });

  switch (state.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
  }
  return list;
}

function update() {
  const list = getVisibleProducts();
  countEl.textContent = `${list.length} ta mahsulot topildi`;
  renderProducts(list);
}

function renderProducts(products) {
  if (products.length === 0) {
    grid.innerHTML = "<p class='empty'>Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.</p>";
    return;
  }

  grid.innerHTML = products
    .map((p) => {
      const hasDiscount = p.oldPrice && p.oldPrice > p.price;
      const discount = hasDiscount
        ? Math.round((1 - p.price / p.oldPrice) * 100)
        : 0;

      return `<div class="product-card">
        <a href="product.html?id=${p.id}" class="product-image">
          <img src="${p.image}" alt="${p.name}"
               onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
        </a>
        <div class="product-info">
          ${p.brand ? `<span class="product-category">${p.brand}</span>` : ''}
          <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
                      <div class="price-row">
              <span class="price">${formatPrice(p.price)}</span>
              <span class="old-price ${hasDiscount ? '' : 'ghost'}">${hasDiscount ? formatPrice(p.oldPrice) : '&nbsp;'}</span>
            </div>
          <button class="btn" data-id="${p.id}" ${!p.inStock ? 'disabled' : ''}>
            ${p.inStock ? "Savatga qo'shish" : "Sotuvda yo'q"}
          </button>
        </div>
      </div>`;
    })
    .join('');
}

categoriesEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  state.category = btn.dataset.category;
  renderCategories();
  update();
});

searchEl.addEventListener('input', (e) => {
  state.query = e.target.value;
  update();
});

sortEl.addEventListener('change', (e) => {
  state.sort = e.target.value;
  update();
});
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.disabled) return;

  addToCart(Number(btn.dataset.id));

  const oldText = btn.textContent;
  btn.textContent = "Qo'shildi ✓";
  setTimeout(() => (btn.textContent = oldText), 1000);
});
loadProducts();
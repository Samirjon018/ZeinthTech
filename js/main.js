const grid = document.getElementById('product-grid');
const categoriesEl = document.getElementById('categories');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const countEl = document.getElementById('result-count');

let allProducts = [];
const state = { category: 'Hammasi', query: '', sort: 'default' };

async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    allProducts = await res.json();
    renderCategories();
    update();
    ZT.renderViewed(allProducts, {
      section: document.getElementById('viewed-section'),
      row: document.getElementById('viewed-row'),
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p class='empty'>Mahsulotlarni yuklab bo'lmadi.</p>";
  }
}

// Kategoriya tugmalari JSON'dagi kategoriyalardan o'zi yasaladi
function renderCategories() {
  const names = ['Hammasi', ...new Set(allProducts.map((p) => p.category))];
  categoriesEl.innerHTML = names
    .map(
      (n) =>
        `<button class="chip ${n === state.category ? 'active' : ''}" data-category="${n}">${n}</button>`
    )
    .join('');
}

// Filtr, qidiruv va saralash
function getVisibleProducts() {
  const q = state.query.trim().toLowerCase();

  const list = allProducts.filter((p) => {
    const matchCategory =
      state.category === 'Hammasi' || p.category === state.category;
    const text = `${p.name} ${p.brand || ''} ${p.category}`.toLowerCase();
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
    grid.innerHTML =
      "<p class='empty'>Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.</p>";
    return;
  }
  grid.innerHTML = products.map((p) => ZT.cardHTML(p)).join('');
}

// ----- Hodisalar -----
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

// "Savatga" tugmasi
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.disabled) return;

  addToCart(Number(btn.dataset.id));

  const oldText = btn.textContent;
  btn.textContent = "Qo'shildi ✓";
  setTimeout(() => (btn.textContent = oldText), 1000);
});

// Yurakcha tugmalari
ZT.bindFavButtons(grid);

loadProducts();
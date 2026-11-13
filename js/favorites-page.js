const grid = document.getElementById('fav-grid');
const sub = document.getElementById('fav-sub');
let products = [];

async function init() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    products = await res.json();
    render();
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p class='empty'>Sahifani yuklab bo'lmadi.</p>";
  }
}

function render() {
  const items = ZT.getFavorites()
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (items.length === 0) {
    sub.textContent = '';
    grid.innerHTML = `
      <div class="empty">
        <p>Sevimlilar ro'yxati hozircha bo'sh.</p>
        <a href="index.html#catalog" class="btn-link">Mahsulotlarni ko'rish</a>
      </div>`;
    return;
  }

  sub.textContent = `${items.length} ta mahsulot`;
  grid.innerHTML = items.map((p) => ZT.cardHTML(p)).join('');
}

// Yurakchani o'chirsangiz, kartochka ro'yxatdan yo'qoladi
ZT.bindFavButtons(grid, (id, on) => {
  if (!on) render();
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

init();
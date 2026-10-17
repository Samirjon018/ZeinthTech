const content = document.getElementById('cart-content');
let products = [];

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

async function init() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    products = await res.json();
    render();
  } catch (err) {
    console.error(err);
    content.innerHTML = "<p>Savatni yuklab bo'lmadi.</p>";
  }
}

function render() {
  const cart = getCart();

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="empty-cart">
        <p>Savatingiz hozircha bo'sh.</p>
        <a href="index.html" class="btn-link">Xarid qilishni boshlash</a>
      </div>`;
    return;
  }

  let total = 0;
  let count = 0;

  const rows = cart
    .map((item) => {
      const p = products.find((x) => x.id === item.id);
      if (!p) return '';
      total += p.price * item.qty;
      count += item.qty;

      return `
        <div class="cart-item" data-id="${p.id}">
                   <div class="cart-thumb">
            <img src="${p.image}" alt="${p.name}"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER}'">
          </div>
          <div class="cart-item-info">
            <h3>${p.name}</h3>
            <span class="muted">${p.category}</span>
            <span class="price">${formatPrice(p.price)}</span>
          </div>
          <div class="qty">
            <button class="qty-btn" data-action="dec">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="inc">+</button>
          </div>
          <div class="cart-item-total">${formatPrice(p.price * item.qty)}</div>
          <button class="remove" data-action="remove" aria-label="O'chirish">✕</button>
        </div>`;
    })
    .join('');

  content.innerHTML = `
    <div class="cart-layout">
      <div class="cart-list">${rows}</div>
      <aside class="cart-summary">
        <div class="summary-row"><span>Mahsulotlar soni</span><strong>${count}</strong></div>
        <div class="summary-row total"><span>Jami</span><strong>${formatPrice(total)}</strong></div>
        <button class="btn" id="checkout">Buyurtma berish</button>
        <button class="link-btn" id="clear">Savatni tozalash</button>
      </aside>
    </div>`;
}

content.addEventListener('click', (e) => {
  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) {
    const id = Number(actionBtn.closest('.cart-item').dataset.id);
    const item = getCart().find((i) => i.id === id);
    const action = actionBtn.dataset.action;

    if (action === 'inc') setQty(id, item.qty + 1);
    if (action === 'dec') setQty(id, item.qty - 1);
    if (action === 'remove') removeFromCart(id);
    render();
    return;
  }

  if (e.target.closest('#clear')) {
    clearCart();
    render();
  }

  if (e.target.closest('#checkout')) {
    window.location.href = 'checkout.html';
  }
});

init();
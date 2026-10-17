const pageEl = document.getElementById('checkout-page');
const form = document.getElementById('checkout-form');
const summaryEl = document.getElementById('order-summary');

// Yetkazib berish sozlamalari (o'zingiz o'zgartirishingiz mumkin)
const DELIVERY_FEE = 30000;
const FREE_DELIVERY_FROM = 1000000;

const ORDERS_KEY = 'zenithtech_orders';
let products = [];

function formatPrice(n) {
  return n.toLocaleString('ru-RU') + " so'm";
}

// Foydalanuvchi kiritgan matnni HTML ichiga xavfsiz qo'yish uchun
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function init() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error('Xato: ' + res.status);
    products = await res.json();
  } catch (err) {
    console.error(err);
    pageEl.innerHTML = "<p>Sahifani yuklab bo'lmadi.</p>";
    return;
  }

  if (getCartLines().length === 0) {
    pageEl.innerHTML = `
      <div class="empty-cart">
        <p>Savatingiz bo'sh, buyurtma berish uchun avval mahsulot tanlang.</p>
        <a href="index.html" class="btn-link">Mahsulotlarga o'tish</a>
      </div>`;
    return;
  }

  renderSummary();
}

// Savatdagi elementlarni mahsulot ma'lumotlari bilan birlashtiradi
function getCartLines() {
  return getCart()
    .map((item) => ({
      product: products.find((p) => p.id === item.id),
      qty: item.qty,
    }))
    .filter((line) => line.product);
}

function calcTotals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  return { subtotal, delivery, total: subtotal + delivery };
}

function renderSummary() {
  const lines = getCartLines();
  const { subtotal, delivery, total } = calcTotals(lines);

  const items = lines
    .map(
      (l) => `
      <div class="summary-line">
        <span>${l.product.name} × ${l.qty}</span>
        <strong>${formatPrice(l.product.price * l.qty)}</strong>
      </div>`
    )
    .join('');

  summaryEl.innerHTML = `
    <h3>Buyurtmangiz</h3>
    ${items}
    <div class="summary-row"><span>Mahsulotlar</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row"><span>Yetkazib berish</span><span>${delivery === 0 ? 'Bepul' : formatPrice(delivery)}</span></div>
    <div class="summary-row total"><span>Jami</span><strong>${formatPrice(total)}</strong></div>
    <small class="muted">${formatPrice(FREE_DELIVERY_FROM)} dan yuqori buyurtmalarda yetkazib berish bepul.</small>`;
}

// ---------- Tekshiruv ----------

// "90 123 45 67", "+998901234567" kabi yozuvlarni "+998901234567" ga keltiradi
function normalizePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 9) return '+998' + digits;
  if (digits.length === 12 && digits.startsWith('998')) return '+' + digits;
  return null;
}

function setError(field, message) {
  const input = form.elements[field];
  const errorEl = form.querySelector(`[data-error-for="${field}"]`);
  if (errorEl) errorEl.textContent = message;
  if (input) input.classList.add('invalid');
}

function clearErrors() {
  form.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}

function validate() {
  clearErrors();
  let ok = true;

  const name = form.elements.name.value.trim();
  const phoneRaw = form.elements.phone.value.trim();
  const city = form.elements.city.value;
  const address = form.elements.address.value.trim();

  if (name.length < 3) {
    setError('name', "Ism va familiyani to'liq kiriting.");
    ok = false;
  }

  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    setError('phone', "Telefon raqamni to'g'ri kiriting (masalan: +998 90 123 45 67).");
    ok = false;
  }

  if (!city) {
    setError('city', 'Shaharni tanlang.');
    ok = false;
  }

  if (address.length < 5) {
    setError('address', "Manzilni batafsilroq yozing.");
    ok = false;
  }

  if (!ok) return null;

  return {
    name,
    phone,
    city,
    address,
    payment: form.elements.payment.value,
    note: form.elements.note.value.trim(),
  };
}

// Maydonga yozishni boshlaganda xato belgisi o'chadi
form.addEventListener('input', (e) => {
  e.target.classList.remove('invalid');
  const errorEl = form.querySelector(`[data-error-for="${e.target.name}"]`);
  if (errorEl) errorEl.textContent = '';
});

// ---------- Buyurtmani yuborish ----------

function saveOrder(order) {
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    orders = [];
  }
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const customer = validate();
  if (!customer) {
    const firstError = form.querySelector('.invalid');
    if (firstError) firstError.focus();
    return;
  }

  const lines = getCartLines();
  const totals = calcTotals(lines);

  const order = {
    id: 'ZT-' + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    customer,
    items: lines.map((l) => ({
      id: l.product.id,
      name: l.product.name,
      price: l.product.price,
      qty: l.qty,
    })),
    ...totals,
  };

  saveOrder(order);
  clearCart();
  showSuccess(order);
});

function showSuccess(order) {
  pageEl.innerHTML = `
    <div class="success">
      <div class="success-icon">✓</div>
      <h2>Buyurtmangiz qabul qilindi!</h2>
      <p>Buyurtma raqami: <strong class="order-number">${order.id}</strong></p>
      <p>${escapeHTML(order.customer.name)}, ${escapeHTML(order.customer.phone)} raqamiga aloqaga chiqiladi.</p>
      <p>Jami to'lov: <strong>${formatPrice(order.total)}</strong> (${escapeHTML(order.customer.payment)})</p>
      <p class="muted">Bu o'quv loyihasi: buyurtma faqat sizning brauzeringizda saqlandi.</p>
      <a href="index.html" class="btn-link">Bosh sahifaga qaytish</a>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

init();
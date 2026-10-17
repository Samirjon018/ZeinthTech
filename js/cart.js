const CART_KEY = 'zenithtech_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty });
  saveCart(cart);
}

function setQty(id, qty) {
  if (qty <= 0) return removeFromCart(id);
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty = qty;
  saveCart(cart);
}

function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
}

function clearCart() {
  saveCart([]);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// Headerdagi savat yonidagi raqamni yangilaydi
function updateCartBadge() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const n = cartCount();
  el.textContent = n;
  el.hidden = n === 0;
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
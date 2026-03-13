// ============================================================
// Sharon's Online Shopping System — script.js
// ============================================================

// ── Product Data ──────────────────────────────────────────────
const PRODUCTS = [
  // Laptops
  { id: 1,  name: 'Gaming Laptop',       category: 'Laptops',       price: 18999, img: 'pictures/gaming-laptop.png',       badge: 'Hot', desc: 'High-performance gaming rig with RTX GPU' },
  { id: 2,  name: 'Ultrabook Laptop',    category: 'Laptops',       price: 14499, img: 'pictures/ultrabook-laptop.png',    badge: 'New', desc: 'Ultra-thin, ultra-fast for professionals' },
  { id: 3,  name: 'Student Laptop',      category: 'Laptops',       price: 9999,  img: 'pictures/student-laptop.png',      badge: '',    desc: 'Reliable and affordable for everyday tasks' },
  // Smartphones
  { id: 4,  name: 'Smartphone Pro',      category: 'Smartphones',   price: 12999, img: 'pictures/smartphone-pro.png',      badge: 'New', desc: 'Pro-grade camera and performance' },
  { id: 5,  name: 'Smartphone Lite',     category: 'Smartphones',   price: 7499,  img: 'pictures/smartphone-lite.png',     badge: '',    desc: 'Smart features without the premium price' },
  { id: 6,  name: 'Smartphone Max',      category: 'Smartphones',   price: 15999, img: 'pictures/smartphone-max.png',      badge: 'Hot', desc: 'Massive display, massive battery' },
  // Accessories
  { id: 7,  name: 'Wireless Headphones', category: 'Accessories',   price: 899,   img: 'pictures/wireless-headphones.png', badge: '',    desc: 'Noise-cancelling with 30hr battery' },
  { id: 8,  name: 'Bluetooth Speaker',   category: 'Accessories',   price: 749,   img: 'pictures/bluetooth-speaker.png',   badge: '',    desc: '360° sound with deep bass' },
  { id: 9,  name: 'Gaming Mouse',        category: 'Accessories',   price: 599,   img: 'pictures/gaming-mouse.png',        badge: '',    desc: 'Precision optical sensor, 7 buttons' },
  { id: 10, name: 'Mechanical Keyboard', category: 'Accessories',   price: 1499,  img: 'pictures/mechanical-keyboard.png', badge: '',    desc: 'Tactile switches with RGB backlight' },
  { id: 11, name: 'Laptop Backpack',     category: 'Accessories',   price: 1199,  img: 'pictures/laptop-backpack.png',     badge: '',    desc: 'Waterproof with USB charging port' },
  // Smart Devices
  { id: 12, name: 'Smart Watch',         category: 'Smart Devices', price: 1299,  img: 'pictures/smart-watch.png',         badge: 'New', desc: 'Health tracking, GPS, always-on display' },
  { id: 13, name: 'Smart Home Speaker',  category: 'Smart Devices', price: 1899,  img: 'pictures/smart-home-speaker.png',  badge: '',    desc: 'Voice-controlled AI smart assistant' },
  { id: 14, name: 'Smart Lamp',          category: 'Smart Devices', price: 1099,  img: 'pictures/smart-lamp.png',          badge: '',    desc: 'Millions of colours, voice & app control' },
  // Networking
  { id: 15, name: 'WiFi Router',         category: 'Networking',    price: 999,   img: 'pictures/wifi-router.png',         badge: '',    desc: 'Wi-Fi 6, whole-home coverage' },
  { id: 16, name: 'Portable SSD',        category: 'Networking',    price: 1699,  img: 'pictures/portable-ssd.png',        badge: '',    desc: '1TB ultra-fast portable storage' },
];

const CATEGORIES = [
  { name: 'Laptops',       icon: '💻', color: '#2563EB' },
  { name: 'Smartphones',   icon: '📱', color: '#7c3aed' },
  { name: 'Accessories',   icon: '🎧', color: '#0891b2' },
  { name: 'Smart Devices', icon: '⌚', color: '#059669' },
  { name: 'Networking',    icon: '📡', color: '#d97706' },
];

const STATUSES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

// ── Shipping Helper (single source of truth — fixes R99 bug) ──
function getShipping(subtotal) {
  return subtotal > 5000 ? 0 : 99;
}

// ── Theme ─────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('sharon_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeUI(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sharon_theme', next);
  updateThemeUI(next);
}

function updateThemeUI(theme) {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.innerHTML = theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
}

// ── Cart ──────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('sharon_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('sharon_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
  updateCartBadge();
}

function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    showToast(`${item.name} removed from cart`, 'info');
  }
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
}

function clearCart() {
  localStorage.setItem('sharon_cart', '[]');
  updateCartBadge();
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    const prev = el.textContent;
    el.textContent = count;
    if (prev !== String(count)) {
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 400);
    }
  });
}

// ── Rendering ─────────────────────────────────────────────────
function renderProductCard(product, options = {}) {
  const { showCategory = true } = options;
  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-img">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <img
          src="${product.img}"
          alt="${product.name}"
          class="product-photo"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="product-img-fallback" style="display:none">
          <i class="fa-solid fa-image"></i>
        </div>
      </div>
      <div class="product-body">
        ${showCategory ? `<div class="product-category">${product.category}</div>` : ''}
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.desc}</div>
        <div class="product-footer">
          <div class="product-price">R${product.price.toLocaleString()}</div>
          <button class="add-cart-btn" onclick="handleAddToCart(${product.id}, this)">
            <i class="fa-solid fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </div>`;
}

function handleAddToCart(id, btn) {
  addToCart(id);
  btn.classList.add('added');
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add';
  }, 1500);
}

// ── Cart Page ─────────────────────────────────────────────────
function renderCart() {
  const cartEl    = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  const emptyEl   = document.getElementById('cart-empty');
  if (!cartEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartEl.innerHTML = '';
    if (summaryEl) summaryEl.style.display = 'none';
    if (emptyEl)   emptyEl.style.display   = 'block';
    return;
  }

  if (emptyEl)   emptyEl.style.display   = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  cartEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-icon">
        <img src="${item.img}" alt="${item.name}" class="cart-item-photo"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <div class="product-img-fallback" style="display:none">
          <i class="fa-solid fa-image"></i>
        </div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.category}</div>
        <div class="cart-item-price">R${(item.price * item.qty).toLocaleString()}</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
        <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove item">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');

  renderCartSummary(cart);
}

function renderCartSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = getShipping(subtotal);
  const total    = subtotal + shipping;

  document.getElementById('cart-subtotal').textContent    = `R${subtotal.toLocaleString()}`;
  document.getElementById('cart-shipping').textContent    = shipping === 0 ? 'FREE' : `R${shipping}`;
  document.getElementById('cart-total').textContent       = `R${total.toLocaleString()}`;
  document.getElementById('cart-count-label').textContent = `${cart.reduce((s,i) => s + i.qty, 0)} item(s)`;
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  removeFromCart(id);
  const el = document.getElementById(`cart-item-${id}`);
  if (el) {
    el.style.transition = 'all 0.3s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(20px)';
    setTimeout(() => renderCart(), 320);
  }
}

// ── Checkout ──────────────────────────────────────────────────
function renderOrderSummary() {
  const el = document.getElementById('order-items');
  if (!el) return;
  const cart     = getCart();
  const subtotal = getCartTotal();
  const shipping = getShipping(subtotal);

  if (cart.length === 0) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem">Your cart is empty.</p>';
  } else {
    el.innerHTML = cart.map(i => `
      <div class="summary-item">
        <span>
          <img src="${i.img}" alt="${i.name}"
            style="width:22px;height:22px;object-fit:cover;border-radius:4px;margin-right:6px;vertical-align:middle"
            onerror="this.style.display='none'" />
          ${i.name} × ${i.qty}
        </span>
        <span>R${(i.price * i.qty).toLocaleString()}</span>
      </div>`).join('');
  }

  document.getElementById('checkout-subtotal').textContent = `R${subtotal.toLocaleString()}`;
  document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `R${shipping}`;
  document.getElementById('checkout-total').textContent    = `R${(subtotal + shipping).toLocaleString()}`;
}

function validateCheckout(e) {
  e.preventDefault();
  let valid = true;
  const fields = [
    { id: 'c-name',    errId: 'err-name',    label: 'Full name',   min: 3 },
    { id: 'c-email',   errId: 'err-email',   label: 'Email',       pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: 'c-address', errId: 'err-address', label: 'Address',     min: 8 },
    { id: 'c-card',    errId: 'err-card',    label: 'Card number', pattern: /^\d{13,19}$/, transform: v => v.replace(/\s/g,'') },
    { id: 'c-expiry',  errId: 'err-expiry',  label: 'Expiry',      pattern: /^(0[1-9]|1[0-2])\/\d{2}$/ },
    { id: 'c-cvv',     errId: 'err-cvv',     label: 'CVV',         pattern: /^\d{3,4}$/ },
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const errEl = document.getElementById(f.errId);
    if (!input || !errEl) return;
    let val = input.value.trim();
    if (f.transform) val = f.transform(val);
    let ok  = true;
    let msg = '';
    if (!val)                                   { ok = false; msg = `${f.label} is required`; }
    else if (f.min && val.length < f.min)       { ok = false; msg = `${f.label} is too short`; }
    else if (f.pattern && !f.pattern.test(val)) { ok = false; msg = `Invalid ${f.label.toLowerCase()}`; }

    input.classList.toggle('error', !ok);
    errEl.textContent = msg;
    errEl.classList.toggle('show', !ok);
    if (!ok) valid = false;
  });

  if (valid) processPayment();
}

function processPayment() {
  const btn = document.getElementById('pay-btn');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled  = true;
  }

  setTimeout(() => {
    const orderId     = 'SOS-' + Date.now().toString(36).toUpperCase();
    const cart        = getCart();
    const subtotal    = getCartTotal();
    const shipping    = getShipping(subtotal);  // ✅ fixed — no more duplicate R99
    const total       = subtotal + shipping;
    const statusIndex = Math.floor(Math.random() * 3);

    const order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: cart,
      total,
      status: STATUSES[statusIndex],
      statusIndex,
    };

    const orders = JSON.parse(localStorage.getItem('sharon_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('sharon_orders', JSON.stringify(orders));
    clearCart();

    document.getElementById('modal-order-id').textContent = orderId;
    document.getElementById('modal-total').textContent    = `R${total.toLocaleString()}`;
    document.getElementById('success-modal').classList.add('open');
  }, 2200);
}

// ── Orders ────────────────────────────────────────────────────
function renderOrders() {
  const el = document.getElementById('orders-list');
  if (!el) return;
  const orders = JSON.parse(localStorage.getItem('sharon_orders') || '[]');

  if (orders.length === 0) {
    el.innerHTML = `
      <div class="empty-cart" style="padding:48px 24px">
        <i class="fa-solid fa-box" style="font-size:3rem;color:var(--border);display:block;margin-bottom:16px;text-align:center"></i>
        <h3 style="text-align:center">No orders yet</h3>
        <p style="text-align:center;margin:8px 0 20px">Your completed orders will appear here.</p>
        <div style="text-align:center">
          <a href="products.html" class="btn btn-primary"><i class="fa-solid fa-bag-shopping"></i> Start Shopping</a>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = orders.map(order => {
    const statusClass = order.status.toLowerCase().replace(/\s+/g, '-');
    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id-badge">
            <i class="fa-solid fa-receipt" style="color:var(--accent);margin-right:6px"></i>${order.id}
          </span>
          <span class="status-badge status-${statusClass}">${order.status}</span>
        </div>
        <div class="order-meta">
          <i class="fa-regular fa-calendar" style="margin-right:6px"></i>${order.date} &nbsp;·&nbsp;
          <i class="fa-solid fa-box" style="margin-right:6px"></i>${order.items.length} product(s)
        </div>
        <div class="order-items-preview">
          ${order.items.map(i => `
            <span class="order-item-chip">
              <img src="${i.img}" alt="${i.name}"
                style="width:16px;height:16px;object-fit:cover;border-radius:3px;margin-right:4px;vertical-align:middle"
                onerror="this.style.display='none'" />
              ${i.name} ×${i.qty}
            </span>`).join('')}
        </div>
        <div class="order-footer">
          <div class="order-total">R${order.total.toLocaleString()}</div>
          <div class="order-actions">
            <button class="btn btn-secondary btn-sm" onclick="trackOrder('${order.id}')">
              <i class="fa-solid fa-truck"></i> Track Order
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function trackOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem('sharon_orders') || '[]');
  const order  = orderId ? orders.find(o => o.id === orderId) : orders[0];
  showPanel('tracking');
  setTimeout(() => renderTracking(order), 100);
}

function renderTracking(order) {
  const el = document.getElementById('tracking-content');
  if (!el) return;

  if (!order) {
    el.innerHTML = `<div class="tracking-card"><p style="color:var(--text-muted)">No tracking data available. Place an order first.</p></div>`;
    return;
  }

  const statusIndex = order.statusIndex || 0;
  const steps = [
    { label: 'Order Placed',     icon: 'fa-box',          desc: 'Your order has been confirmed' },
    { label: 'Shipped',          icon: 'fa-truck',         desc: 'Your order is on the way' },
    { label: 'Out for Delivery', icon: 'fa-location-dot',  desc: 'Out for delivery today' },
    { label: 'Delivered',        icon: 'fa-check-circle',  desc: 'Package delivered' },
  ];
  const progressPct = statusIndex === 0 ? 0 : statusIndex === 1 ? 33 : statusIndex === 2 ? 66 : 100;

  el.innerHTML = `
    <div class="tracking-card">
      <div class="order-header">
        <div>
          <div class="order-id-badge" style="font-size:1.1rem">
            <i class="fa-solid fa-receipt" style="color:var(--accent);margin-right:8px"></i>${order.id}
          </div>
          <div class="order-meta" style="margin-top:6px;margin-bottom:0">
            <i class="fa-regular fa-calendar" style="margin-right:6px"></i>${order.date}
          </div>
        </div>
        <span class="status-badge status-${order.status.toLowerCase().replace(/\s+/g,'-')}"
          style="height:fit-content">${order.status}</span>
      </div>
      <div class="tracking-steps">
        <div class="tracking-progress" style="width: calc(${progressPct}% * 0.8)"></div>
        ${steps.map((step, i) => `
          <div class="tracking-step">
            <div class="step-icon ${i < statusIndex ? 'done' : i === statusIndex ? 'current' : ''}">
              <i class="fa-solid ${step.icon}"></i>
            </div>
            <span class="step-label ${i <= statusIndex ? 'active' : ''}">${step.label}</span>
          </div>`).join('')}
      </div>
      <p style="color:var(--text-muted);font-size:0.88rem;text-align:center;margin-top:8px">
        ${steps[statusIndex].desc}
      </p>
    </div>
    <h3 style="font-size:1rem;margin:24px 0 12px">Items in this order</h3>
    ${order.items.map(i => `
      <div class="cart-item" style="margin-bottom:10px">
        <div class="cart-item-icon" style="width:50px;height:50px;">
          <img src="${i.img}" alt="${i.name}"
            style="width:100%;height:100%;object-fit:cover;border-radius:8px"
            onerror="this.style.display='none'" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-cat">${i.category} · Qty: ${i.qty}</div>
        </div>
        <div class="cart-item-price">R${(i.price * i.qty).toLocaleString()}</div>
      </div>`).join('')}`;
}

// ── Profile Name Save / Load ───────────────────────────────────
function loadProfileData() {
  const data = JSON.parse(localStorage.getItem('sharon_profile') || '{}');
  const fields = {
    'profile-first-name': data.firstName || 'Sharon',
    'profile-last-name':  data.lastName  || 'Doe',
    'profile-email':      data.email     || 'sharon@example.com',
    'profile-phone':      data.phone     || '+27 82 000 0000',
    'profile-address':    data.address   || '',
    'profile-city':       data.city      || '',
    'profile-postal':     data.postal    || '',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  const displayName  = document.getElementById('sidebar-display-name');
  const displayEmail = document.getElementById('sidebar-display-email');
  const avatarEl     = document.getElementById('sidebar-avatar');
  if (displayName)  displayName.textContent  = (data.firstName || 'Sharon') + ' ' + (data.lastName || 'Doe');
  if (displayEmail) displayEmail.textContent = data.email || 'sharon@example.com';
  if (avatarEl)     avatarEl.textContent     = (data.firstName || 'S')[0].toUpperCase();
}

function saveProfileData() {
  const data = {
    firstName: document.getElementById('profile-first-name')?.value.trim() || '',
    lastName:  document.getElementById('profile-last-name')?.value.trim()  || '',
    email:     document.getElementById('profile-email')?.value.trim()      || '',
    phone:     document.getElementById('profile-phone')?.value.trim()      || '',
    address:   document.getElementById('profile-address')?.value.trim()   || '',
    city:      document.getElementById('profile-city')?.value.trim()      || '',
    postal:    document.getElementById('profile-postal')?.value.trim()    || '',
  };
  if (!data.firstName) { showToast('First name cannot be empty', 'error'); return; }
  localStorage.setItem('sharon_profile', JSON.stringify(data));
  loadProfileData();
  showToast('Profile saved!', 'success');
}

// ── Profile Panel Switching ────────────────────────────────────
function showPanel(name) {
  document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById(`panel-${name}`);
  const link  = document.querySelector(`[data-panel="${name}"]`);
  if (panel) panel.classList.add('active');
  if (link)  link.classList.add('active');

  if (name === 'orders') renderOrders();
  if (name === 'tracking') {
    const orders = JSON.parse(localStorage.getItem('sharon_orders') || '[]');
    renderTracking(orders[0] || null);
  }
}

// ── Search / Filter ───────────────────────────────────────────
function filterProducts(query, category = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const q     = query.toLowerCase();
  const cards = grid.querySelectorAll('.product-card');
  let shown   = 0;
  cards.forEach(card => {
    const name   = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const cat    = card.dataset.category || '';
    const matchQ = !q || name.includes(q);
    const matchC = category === 'all' || cat === category;
    const show   = matchQ && matchC;
    card.style.display = show ? '' : 'none';
    if (show) shown++;
  });
  const noResults = document.getElementById('no-results');
  if (noResults) noResults.style.display = shown === 0 ? 'block' : 'none';
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const icons     = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type]} toast-icon"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Mobile Nav ────────────────────────────────────────────────
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open');
}

// ── Navbar Active Link ────────────────────────────────────────
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}

// ── Global Search ─────────────────────────────────────────────
function handleGlobalSearch(e) {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateCartBadge();
  setActiveNav();

  // Theme toggle buttons
  document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', toggleTheme));

  // Theme options (settings panel)
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.documentElement.setAttribute('data-theme', opt.dataset.theme);
      localStorage.setItem('sharon_theme', opt.dataset.theme);
      updateThemeUI(opt.dataset.theme);
    });
  });

  // Mobile nav
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMobileNav);

  // Global search
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) globalSearch.addEventListener('keydown', handleGlobalSearch);

  // Cart page
  if (document.getElementById('cart-items')) renderCart();

  // Checkout page
  if (document.getElementById('order-items')) renderOrderSummary();
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) checkoutForm.addEventListener('submit', validateCheckout);

  // Card number formatting
  const cardInput = document.getElementById('c-card');
  if (cardInput) {
    cardInput.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  // Expiry formatting
  const expiryInput = document.getElementById('c-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
      e.target.value = val;
    });
  }

  // Products page
  if (document.getElementById('products-grid')) initProductsPage();

  // Profile page
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      const panel = link.dataset.panel;
      if (panel) showPanel(panel);
    });
  });
  if (document.getElementById('panel-profile')) {
    showPanel('profile');
    loadProfileData();
  }

  // Wire Save Profile button
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileData);

  // URL search param on products page
  const urlParams   = new URLSearchParams(location.search);
  const searchParam = urlParams.get('search');
  if (searchParam && document.getElementById('products-grid')) {
    const input = document.getElementById('product-search');
    if (input) { input.value = searchParam; filterProducts(searchParam); }
  }
});

// ── Products Page Init ────────────────────────────────────────
function initProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const byCategory = {};
  PRODUCTS.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  const catIcons = {
    Laptops:          'fa-laptop',
    Smartphones:      'fa-mobile-screen',
    Accessories:      'fa-headphones',
    'Smart Devices':  'fa-watch',
    Networking:       'fa-wifi',
  };

  let html = '';
  Object.entries(byCategory).forEach(([cat, products]) => {
    html += `
      <div class="cat-section" data-cat="${cat}">
        <div class="cat-section-title">
          <i class="fa-solid ${catIcons[cat] || 'fa-tag'}"></i>${cat}
        </div>
        <div class="product-grid">
          ${products.map(p => renderProductCard(p, { showCategory: false })).join('')}
        </div>
      </div>`;
  });
  grid.innerHTML = html;

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat       = btn.dataset.filter;
      const searchVal = document.getElementById('product-search')?.value || '';
      document.querySelectorAll('.cat-section').forEach(section => {
        section.style.display = (cat === 'all' || section.dataset.cat === cat) ? '' : 'none';
      });
      filterProducts(searchVal, cat);
    });
  });

  // Search input
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      filterProducts(searchInput.value, activeFilter);
    });
  }
}

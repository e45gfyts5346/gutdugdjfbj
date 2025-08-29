// Enhanced UMEDA static JS (responsive nav, search, filters, cart, favorites, quick view)
const PRODUCTS = [
  {
    id: "p1",
    name: "Шёлковое платье UMEDA",
    price: 139,
    category: "Платья",
    sizes: ["XS", "S", "M"],
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p2",
    name: "Твидовый жакет",
    price: 189,
    category: "Верхняя одежда",
    sizes: ["S", "M", "L"],
    image:
      "https://images.unsplash.com/photo-1520975922284-7b15d3a0f3f3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p3",
    name: "Костюм карго",
    price: 159,
    category: "Костюмы",
    sizes: ["M", "L", "XL"],
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p4",
    name: "Атласная блуза",
    price: 79,
    category: "Блузы",
    sizes: ["XS", "S", "M", "L"],
    image:
      "https://images.unsplash.com/photo-1520975693416-35a1a88f7e99?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p5",
    name: "Прямые джинсы",
    price: 99,
    category: "Джинсы",
    sizes: ["S", "M", "L", "XL"],
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "p6",
    name: "Мини-сумка UMEDA",
    price: 129,
    category: "Аксессуары",
    sizes: [],
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
  },
];

// Elements
const productsEl = document.getElementById("products");
const tpl = document.getElementById("productTpl");
const searchInput = document.getElementById("search");
const sizeFilter = document.getElementById("sizeFilter");
const sortSelect = document.getElementById("sort");
const categoryFilter = document.getElementById("categoryFilter");
const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const cartCountEl = document.getElementById("cartCount");
const favCountEl = document.getElementById("favCount");
const emptyMsg = document.getElementById("emptyMsg");
const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const quickView = document.getElementById("quickView");
const quickImg = document.getElementById("quickImg");
const quickTitle = document.getElementById("quickTitle");
const quickPrice = document.getElementById("quickPrice");
const quickCat = document.getElementById("quickCat");
const quickSizes = document.getElementById("quickSizes");
const quickAdd = document.getElementById("quickAdd");
const quickFav = document.getElementById("quickFav");

// Nav
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
const closeNav = document.getElementById("closeNav");
const searchToggle = document.getElementById("searchToggle");
const searchWrap = document.getElementById("searchWrap");
const clearSearch = document.getElementById("clearSearch");

// Storage
let CART = JSON.parse(localStorage.getItem("umeda_cart") || "[]");
let FAVS = JSON.parse(localStorage.getItem("umeda_favs") || "[]");

// Utils
function formatPrice(n) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function renderProducts(list) {
  productsEl.innerHTML = "";
  if (list.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";
  list.forEach((p) => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector("img");
    img.src = p.image;
    img.alt = p.name;
    node.querySelector(".card-title").textContent = p.name;
    node.querySelector(".card-cat").textContent = p.category;
    node.querySelector(".price").textContent = formatPrice(p.price);
    const favBtn = node.querySelector(".fav");
    if (FAVS.includes(p.id)) favBtn.classList.add("active");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(p.id, favBtn);
    });
    node
      .querySelector(".add-btn")
      .addEventListener("click", () => addToCart(p.id));
    // quick view on click
    node
      .querySelector("article")
      .addEventListener("click", () => openQuickView(p));
    productsEl.appendChild(node);
  });
}

function toggleFav(id, el) {
  if (FAVS.includes(id)) {
    FAVS = FAVS.filter((x) => x !== id);
    el.classList.remove("active");
  } else {
    FAVS.push(id);
    el.classList.add("active");
  }
  localStorage.setItem("umeda_favs", JSON.stringify(FAVS));
  updateFavUI();
}

function updateFavUI() {
  favCountEl.textContent = FAVS.length;
}

function addToCart(id) {
  const found = CART.find((x) => x.id === id);
  if (found) found.qty++;
  else CART.push({ id, qty: 1 });
  persistCart();
  updateCartUI();
  openCart();
}

function persistCart() {
  localStorage.setItem("umeda_cart", JSON.stringify(CART));
}

function updateCartUI() {
  cartCountEl.textContent = CART.reduce((s, c) => s + c.qty, 0);
  cartItemsEl.innerHTML = "";
  CART.forEach((c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    if (!p) return;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center">
        <img src="${
          p.image
        }" style="width:56px;height:56px;object-fit:cover;border-radius:8px" alt="${
      p.name
    }" />
        <div style="min-width:140px">
          <div style="font-weight:600">${p.name}</div>
          <div class="muted">${p.category}</div>
          <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
            <button class="small dec">−</button>
            <div>${c.qty}</div>
            <button class="small inc">+</button>
            <button class="small remove">Удалить</button>
          </div>
        </div>
      </div>
      <div style="font-weight:700">${formatPrice(p.price * c.qty)}</div>
    `;
    // handlers
    row.querySelector(".dec").addEventListener("click", () => {
      setQty(c.id, Math.max(1, c.qty - 1));
    });
    row.querySelector(".inc").addEventListener("click", () => {
      setQty(c.id, c.qty + 1);
    });
    row.querySelector(".remove").addEventListener("click", () => {
      CART = CART.filter((x) => x.id !== c.id);
      persistCart();
      updateCartUI();
    });
    cartItemsEl.appendChild(row);
  });
  const total = CART.reduce((s, c) => {
    const p = PRODUCTS.find((x) => x.id === c.id);
    return s + (p ? p.price * c.qty : 0);
  }, 0);
  cartTotalEl.textContent = formatPrice(total);
  cartCountEl.textContent = CART.reduce((s, c) => s + c.qty, 0);
}

function setQty(id, qty) {
  CART = CART.map((x) => (x.id === id ? { ...x, qty } : x));
  persistCart();
  updateCartUI();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

document.getElementById("cartBtn").addEventListener("click", () => openCart());
document
  .getElementById("closeCart")
  .addEventListener("click", () => closeCart());
document
  .getElementById("cartBackdrop")
  .addEventListener("click", () => closeCart());

// Quick view modal
function openQuickView(p) {
  quickImg.src = p.image;
  quickTitle.textContent = p.name;
  quickPrice.textContent = formatPrice(p.price);
  quickCat.textContent = p.category;
  quickSizes.innerHTML = "";
  (p.sizes || []).forEach((s) => {
    const b = document.createElement("button");
    b.className = "small";
    b.textContent = s;
    b.addEventListener("click", () => {
      document
        .querySelectorAll(".size-list .small")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
    });
    quickSizes.appendChild(b);
  });
  quickAdd.onclick = () => {
    addToCart(p.id);
    closeQuick();
  };
  quickFav.onclick = () => {
    toggleFav(p.id, quickFav);
  };
  quickView.classList.add("open");
  quickView.setAttribute("aria-hidden", "false");
}
function closeQuick() {
  quickView.classList.remove("open");
  quickView.setAttribute("aria-hidden", "true");
}

document.getElementById("closeQuick").addEventListener("click", closeQuick);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeQuick();
    closeCart();
  }
});

// Filters and search
function applyFilters() {
  const q = (searchInput?.value || "").toLowerCase().trim();
  let out = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  if (categoryFilter.value)
    out = out.filter((p) => p.category === categoryFilter.value);
  if (sizeFilter.value)
    out = out.filter((p) => p.sizes && p.sizes.includes(sizeFilter.value));
  const min = parseFloat(priceMin.value) || 0;
  const max = parseFloat(priceMax.value) || Infinity;
  out = out.filter((p) => p.price >= min && p.price <= max);
  if (sortSelect.value === "price-asc") out.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") out.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "name-asc")
    out.sort((a, b) => a.name.localeCompare(b.name));
  renderProducts(out);
}

// Debounce helper
function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Init
renderProducts(PRODUCTS);
updateCartUI();
updateFavUI();

// listeners
searchInput?.addEventListener("input", debounce(applyFilters, 300));
sizeFilter?.addEventListener("change", applyFilters);
sortSelect?.addEventListener("change", applyFilters);
categoryFilter?.addEventListener("change", applyFilters);
priceMin?.addEventListener("input", applyFilters);
priceMax?.addEventListener("input", applyFilters);

document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Спасибо! Промокод отправлен на e‑mail.");
  e.target.reset();
});

// hero CTA filter buttons
document.querySelectorAll(".hero-cta .btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    if (f === "all") {
      renderProducts(PRODUCTS);
      applyFilters();
      return;
    }
    categoryFilter.value = f;
    applyFilters();
    window.location.href = "#new";
  });
});

// Nav toggles
burger.addEventListener("click", () => {
  nav.classList.add("open");
  burger.setAttribute("aria-expanded", "true");
});
closeNav.addEventListener("click", () => {
  nav.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
});

// Search toggle for small screens
searchToggle.addEventListener("click", () => {
  if (searchWrap.hidden) {
    searchWrap.hidden = false;
    searchInput.focus();
  } else {
    searchWrap.hidden = true;
    searchInput.value = "";
    applyFilters();
  }
});
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  applyFilters();
  searchInput.focus();
});

// close drawer on backdrop click
document.getElementById("cartBackdrop").addEventListener("click", closeCart);

// checkout simulation
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (CART.length === 0) {
    alert("Корзина пуста");
    return;
  }
  alert("Переход к оформлению (симуляция).");
  CART = [];
  persistCart();
  updateCartUI();
  closeCart();
});

// small accessibility: focus visible on keyboard nav
document.body.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Tab") document.body.classList.add("user-is-tabbing");
  },
  { once: true }
);

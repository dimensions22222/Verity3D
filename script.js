const siteConfig = {
  saleEnabled: true,
  saleEnds: "2026-11-30T23:59:00+01:00",
  whatsappNumber: "2349031415386"
};

const products = [
  { id: "black-friday", title: "Black Friday / Objects", price: "$19", was: "$29", description: "A sale page that puts the product before the discount.", tags: ["sale", "fashion"], kind: "shoe", number: "01", animation: "template%20assets%20on%20hover/Black%20Friday%20Deals%20ball.lottie" },
  { id: "sneaker-study", title: "The Sneaker Study", price: "$24", was: "$34", description: "A product hero made for a shoe worth noticing.", tags: ["fashion"], kind: "shoe", number: "02", animation: "template%20assets%20on%20hover/Sneaker.lottie" },
  { id: "time-piece", title: "Time / Piece", price: "$24", was: "$34", description: "A quiet product page for a watch or accessory.", tags: ["fashion"], kind: "watch", number: "03" },
  { id: "sound-object", title: "Sound Object", price: "$24", was: "$34", description: "A tactile tech showcase for audio and everyday objects.", tags: ["tech"], kind: "headphones", number: "04", animation: "template%20assets%20on%20hover/headphone%20playing%20music%20(1).lottie" },
  { id: "folio-hero", title: "Folio / Motion", price: "$15", was: "$22", description: "An expressive 3D opening for a creative portfolio.", tags: ["portfolio"], kind: "camera", number: "05", animation: "template%20assets%20on%20hover/Folio%20%20Motion.lottie" },
  { id: "gift-study", title: "Gift Study", price: "$19", was: "$29", description: "A seasonal product story with room for a personal note.", tags: ["sale", "fashion"], kind: "gift", number: "06", animation: "template%20assets%20on%20hover/gift%20study.lottie" }
];

const glyphs = {
  shoe: '<svg class="product-glyph" viewBox="0 0 240 180" role="img" aria-label="Sneaker illustration"><path d="M27 111c25-4 43-16 60-38l26-38c8-11 17-14 27-9l32 15c12 6 18 17 23 29l13 27c8 15 23 20 40 22 17 2 27 9 25 21-2 11-13 15-31 15H44c-21 0-31-7-31-20 0-9 5-16 14-24Z" fill="#f4f2ec" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="m113 42 19 17 23 8 17 17m-49-33 14 16 24 8m-79 22 34 11 75 1 59 7M37 145h190" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  watch: '<svg class="product-glyph" viewBox="0 0 200 200" role="img" aria-label="Wristwatch illustration"><path d="M76 10h48l10 43H66Zm0 180h48l10-43H66Z" fill="#f4f2ec" stroke="currentColor" stroke-width="5"/><circle cx="100" cy="100" r="48" fill="#f4f2ec" stroke="currentColor" stroke-width="6"/><circle cx="100" cy="100" r="36" fill="none" stroke="currentColor" stroke-width="2"/><path d="M100 70v32l20 13" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  headphones: '<svg class="product-glyph" viewBox="0 0 200 200" role="img" aria-label="Headphones illustration"><path d="M42 102V78c0-38 25-63 58-63s58 25 58 63v24" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><path d="M39 92h31v66H48c-8 0-13-6-13-13v-40c0-7 1-11 4-13Zm122 0h-31v66h22c8 0 13-6 13-13v-40c0-7-1-11-4-13Z" fill="#f4f2ec" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/></svg>',
  camera: '<svg class="product-glyph" viewBox="0 0 200 180" role="img" aria-label="Camera illustration"><path d="M28 52h34l13-18h48l14 18h34c8 0 13 6 13 13v73c0 8-5 13-13 13H28c-8 0-13-5-13-13V65c0-7 5-13 13-13Z" fill="#f4f2ec" stroke="currentColor" stroke-width="6"/><circle cx="101" cy="103" r="34" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="101" cy="103" r="17" fill="none" stroke="currentColor" stroke-width="4"/></svg>',
  gift: '<svg class="product-glyph" viewBox="0 0 200 190" role="img" aria-label="Gift box illustration"><path d="M31 77h138v87H31zM21 51h158v29H21z" fill="#f4f2ec" stroke="currentColor" stroke-width="6"/><path d="M100 51v113M100 51C57 50 50 13 74 17c19 3 26 34 26 34Zm0 0c43-1 50-38 26-34-19 3-26 34-26 34Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/></svg>'
};

const productGrid = document.getElementById("productGrid");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
}

function setupHoverAnimation(host) {
  const player = host.querySelector(".product-hover-animation");
  if (!player) return;

  let isHovered = false;
  let isFocused = false;
  const syncPlayback = () => {
    if (!host.classList.contains("is-animation-ready")) return;
    if (isHovered || isFocused) {
      player.play();
    } else {
      player.stop();
    }
  };

  player.addEventListener("ready", () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.classList.add("is-animation-ready");
      syncPlayback();
    }
  }, { once: true });

  host.addEventListener("pointerenter", () => {
    isHovered = true;
    syncPlayback();
  });
  host.addEventListener("pointerleave", () => {
    isHovered = false;
    syncPlayback();
  });
  host.addEventListener("focusin", () => {
    isFocused = true;
    syncPlayback();
  });
  host.addEventListener("focusout", event => {
    if (!host.contains(event.relatedTarget)) {
      isFocused = false;
      syncPlayback();
    }
  });
}

function renderProducts(filter = "all") {
  const visibleProducts = products.filter(product => filter === "all" || product.tags.includes(filter));
  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-art hover-animation-host">
        <span class="art-number">V / ${product.number}</span>
        <span class="art-kind">${product.tags[0]}</span>
        ${glyphs[product.kind]}
        ${product.animation ? `<dotlottie-player class="product-hover-animation" src="${product.animation}" background="transparent" loop aria-hidden="true"></dotlottie-player>` : ""}
        ${siteConfig.saleEnabled ? '<span class="sale-tag">STUDIO SALE</span>' : ""}
      </div>
      <div class="product-body">
        <div class="product-title-row"><h3>${product.title}</h3><div class="price">${siteConfig.saleEnabled ? `<span class="old-price">${product.was}</span> ` : ""}${product.price}</div></div>
        <p>${product.description}</p>
        <div class="tags">${product.tags.map(tag => `<span class="tag">${tag.toUpperCase()}</span>`).join("")}</div>
        <div class="card-actions">
          <a class="button button-light" href="#demo-${product.id}" data-demo="${product.id}">Live demo ↗</a>
          <a class="button button-dark" href="#buy-${product.id}" data-buy="${product.id}">Buy ↗</a>
        </div>
      </div>
    </article>`).join("");

  productGrid.querySelectorAll(".product-card").forEach(card => {
    const host = card.querySelector(".hover-animation-host");
    if (host) setupHoverAnimation(host);
  });
}

renderProducts();
document.querySelectorAll(".about-skills").forEach(setupHoverAnimation);

document.querySelector(".filterbar").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  document.querySelectorAll(".filter").forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
  renderProducts(button.dataset.filter);
});

productGrid.addEventListener("click", event => {
  const link = event.target.closest("[data-buy], [data-demo]");
  if (!link) return;
  event.preventDefault();
  if (link.hasAttribute("data-buy")) {
    showToast("Add a hosted checkout URL for this template before launch.");
  } else {
    showToast(`Connect this template to its live demo: ${link.dataset.demo}.`);
  }
});

document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector(".faq-symbol").textContent = isOpen ? "−" : "+";
  });
});

document.querySelectorAll(".wa-link").forEach(link => {
  link.addEventListener("click", event => {
    if (siteConfig.whatsappNumber.includes("X")) {
      event.preventDefault();
      showToast("Set siteConfig.whatsappNumber to your international WhatsApp number before launch.");
      return;
    }
    const tier = link.dataset.tier || "a project";
    link.href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hi Verity3D, I’m interested in ${tier}. Can we talk about my product page?`)}`;
  });
});

const menu = document.getElementById("menu");
const navlinks = document.getElementById("navlinks");
menu.addEventListener("click", () => {
  const isOpen = navlinks.classList.toggle("is-open");
  menu.setAttribute("aria-expanded", String(isOpen));
  menu.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menu.textContent = isOpen ? "×" : "☰";
});
navlinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navlinks.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    menu.textContent = "☰";
  });
});

document.getElementById("year").textContent = String(new Date().getFullYear());

function updateCountdown() {
  const remaining = Math.max(0, new Date(siteConfig.saleEnds).getTime() - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining % 86400000 / 3600000),
    minutes: Math.floor(remaining % 3600000 / 60000),
    seconds: Math.floor(remaining % 60000 / 1000)
  };
  Object.entries(values).forEach(([unit, value]) => {
    document.getElementById(unit).textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const spinToggle = document.getElementById("spinToggle");
spinToggle.addEventListener("click", () => {
  const isSpinning = spinToggle.getAttribute("aria-pressed") === "true";
  spinToggle.setAttribute("aria-pressed", String(!isSpinning));
  spinToggle.textContent = isSpinning ? "Resume rotation" : "Pause rotation";
  window.dispatchEvent(new CustomEvent("velox-spin-change", { detail: { isSpinning: !isSpinning } }));
});

const revealSections = document.querySelectorAll(".scroll-reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("has-scroll-reveal");
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealSections.forEach(section => revealObserver.observe(section));
}

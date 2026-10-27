(function () {
  "use strict";

  // ===== i18n (Vietnamese source in the HTML, Chinese from js/i18n.js, English from js/i18n-en.js) =====
  var DICTS = { zh: window.I18N_ZH || {}, en: window.I18N_EN || {} };
  var HTML_LANG = { vi: "vi", zh: "zh-CN", en: "en" };
  var lang = "vi";
  var norm = function (s) { return s.replace(/\s+/g, " ").trim(); };
  function t(vi) {
    if (lang === "vi") return vi;
    var hit = DICTS[lang][norm(vi)];
    return hit === undefined ? vi : hit;
  }

  var TEXT_SEL = [
    "h1", "h2", "h3", "p:not(.lightbox-cap)", "dt", "dd", ".tags li", ".stat-label",
    ".marquee span", ".step-time", ".nav-links a", ".nav-mobile a", ".footer-links a",
    ".swatches span", ".results strong", ".results span", ".name-tag strong", ".name-tag span",
    ".btn-label", ".brand-label", ".skip-link", ".fb-cta-label", ".sr-only"
  ].join(",");
  var textEls = Array.prototype.slice.call(document.querySelectorAll(TEXT_SEL));
  textEls.forEach(function (el) { el.dataset.vi = el.innerHTML; });
  var imgs = Array.prototype.slice.call(document.querySelectorAll("img[alt]"));
  imgs.forEach(function (img) { img.dataset.viAlt = img.alt; });
  var labelled = Array.prototype.slice.call(document.querySelectorAll("[aria-label]:not([data-lightbox]):not(#navToggle)"));
  labelled.forEach(function (el) { el.dataset.viLabel = el.getAttribute("aria-label"); });
  var metaDesc = document.querySelector('meta[name="description"]');
  var vi = { title: document.title, desc: metaDesc.content };
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var langBtns = Array.prototype.slice.call(document.querySelectorAll("[data-lang]"));

  function labelShots() {
    shots.forEach(function (b) { b.setAttribute("aria-label", t("Xem ảnh lớn:") + (lang === "zh" ? "" : " ") + b.querySelector("img").alt); });
  }

  function applyLang(next) {
    lang = DICTS[next] ? next : "vi";
    document.documentElement.lang = HTML_LANG[lang];
    textEls.forEach(function (el) { el.innerHTML = t(el.dataset.vi); });
    imgs.forEach(function (img) { if (img.dataset.viAlt) img.alt = t(img.dataset.viAlt); });
    labelled.forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.viLabel)); });
    document.title = lang === "vi" ? vi.title : (DICTS[lang].__title || vi.title);
    metaDesc.content = lang === "vi" ? vi.desc : (DICTS[lang].__description || vi.desc);
    langBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    labelShots();
    setNav(toggle.getAttribute("aria-expanded") === "true");
    try { localStorage.setItem("lang", lang); } catch (e) {}
    var url = new URL(location.href);
    if (lang === "vi") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  }

  langBtns.forEach(function (b) {
    b.addEventListener("click", function () { if (b.dataset.lang !== lang) applyLang(b.dataset.lang); });
  });

  // ===== Mobile nav =====
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("navMobile");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", t(open ? "Đóng menu" : "Mở menu"));
    mobileNav.hidden = !open;
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  mobileNav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mobileNav.hidden) { setNav(false); toggle.focus(); }
  });

  // Initial language: ?lang= wins, then saved choice
  var initial = new URLSearchParams(location.search).get("lang");
  if (!initial) { try { initial = localStorage.getItem("lang"); } catch (e) {} }
  if (initial && initial !== "vi" && DICTS[initial]) applyLang(initial); else labelShots();

  // ===== Lightbox: shows the full-resolution file already used by the tile =====
  var box = document.getElementById("lightbox");
  var boxImg = box.querySelector("img");
  var boxCap = box.querySelector(".lightbox-cap");
  var opener = null;
  document.addEventListener("click", function (e) {
    var shot = e.target.closest("[data-lightbox]");
    if (!shot) return;
    var img = shot.querySelector("img");
    opener = shot;
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    boxCap.textContent = img.alt;
    box.showModal();
  });
  box.querySelector(".lightbox-close").addEventListener("click", function () { box.close(); });
  box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
  box.addEventListener("close", function () {
    boxImg.removeAttribute("src");
    if (opener) opener.focus();
  });

  // ===== Scroll reveal =====
  var items = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(function (el) { io.observe(el); });
})();

/* ============================================================
   AutoBook AI — app.js
   منطق التطبيق: اللغات، الشات الذكي، الباقات، FAQ، المودال، Reveal
   ============================================================ */
"use strict";

/* ---------- المراجع ---------- */
const T = window.TRANSLATIONS;
const CFG = window.AppConfig;

const $ = (id) => document.getElementById(id);
const body = document.body;
const htmlEl = document.documentElement;

let currentLang = localStorage.getItem("autobook_lang") || CFG.defaults.lang;
let billingMode = "monthly"; // monthly | yearly
let chatStarted = false;

/* ============================================================
   1) اللغة
   ============================================================ */
function initLangSelect() {
  const sel = $("langSelect");
  sel.innerHTML = "";
  Object.keys(T).forEach((code) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${T[code].flag} ${T[code].label}`;
    sel.appendChild(opt);
  });
  sel.value = currentLang;
  sel.addEventListener("change", (e) => setLanguage(e.target.value, true));
}

function t(key) {
  return (T[currentLang] && T[currentLang][key]) || (T[CFG.defaults.fallbackLang] && T[CFG.defaults.fallbackLang][key]) || key;
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}

function setLanguage(code, announce = false) {
  if (!T[code]) return;
  const prevLang = currentLang;
  currentLang = code;
  localStorage.setItem("autobook_lang", code);

  const dir = T[code].dir;
  htmlEl.setAttribute("lang", code);
  htmlEl.setAttribute("dir", dir);

  const isArabicFont = ["ar", "fa", "ur"].includes(code);
  body.classList.toggle("font-ar", isArabicFont);
  body.classList.toggle("font-en", !isArabicFont);

  applyStaticTranslations();
  renderStats();
  renderQuickActions();
  renderAgents();
  renderPricing();
  renderFaq();
  renderBillingButtons();

  if (announce && chatStarted) {
    const switched = t("lang_switched");
    if (switched && switched !== "lang_switched") addAgentMessage(switched);
  }
  if (prevLang !== code) $("langSelect").value = code;
}

/* ============================================================
   2) الإحصائيات
   ============================================================ */
function renderStats() {
  const row = $("statsRow");
  row.innerHTML = "";
  CFG.stats.forEach((s) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<p class="stat-value">${s.value}</p><p class="stat-label">${t(s.key)}</p>`;
    row.appendChild(card);
    // البيانات الثابتة في بطاقات الهيرو العائمة
  });
}

/* ============================================================
   3) الأزرار السريعة للشات
   ============================================================ */
function renderQuickActions() {
  const wrap = $("quickActions");
  wrap.innerHTML = "";
  CFG.quickActions.forEach((action) => {
    const btn = document.createElement("button");
    btn.className = "quick-btn";
    btn.textContent = t(`qa_${action}`);
    btn.addEventListener("click", () => {
      sendUserMessage(btn.textContent, action);
    });
    wrap.appendChild(btn);
  });
}

/* ============================================================
   4) الوكلاء
   ============================================================ */
function renderAgents() {
  const grid = $("agentsGrid");
  grid.innerHTML = "";
  window.AgentsData.forEach((agent) => {
    const caps = agent.capKeys
      .map((k) => `<li class="cap-item">${t(k)}</li>`)
      .join("");
    const card = document.createElement("div");
    card.className = "agent-card reveal";
    card.innerHTML = `
      <div class="agent-icon agent-icon-${agent.color}">${agent.icon}</div>
      <h3 class="agent-name">${t(`ag_${agent.id}_name`)}</h3>
      <p class="agent-desc">${t(`ag_${agent.id}_desc`)}</p>
      <ul class="cap-list">${caps}</ul>
    `;
    grid.appendChild(card);
  });
  observeReveals();
}

/* ============================================================
   5) الباقات والأسعار
   ============================================================ */
function renderBillingButtons() {
  const m = $("billingMonthly");
  const y = $("billingYearly");
  m.textContent = t("plan_month");
  y.textContent = `${t("plan_year")} · ${t("save_year")}`;
  m.classList.toggle("billing-active", billingMode === "monthly");
  y.classList.toggle("billing-active", billingMode === "yearly");
}

function renderPricing() {
  const grid = $("pricingGrid");
  grid.innerHTML = "";
  const yearly = billingMode === "yearly";

  CFG.pricing.forEach((plan) => {
    const price = yearly ? plan.yearly : plan.monthly;
    const period = plan.monthly === 0 ? t("plan_free") : `${t("plan_mo")}`;
    const periodY = plan.monthly === 0 ? t("plan_free") : `${t("plan_yr")}`;
    const per = yearly ? periodY : period;

    const ctaKey = plan.id === "starter" ? "plan_cta_free" : plan.id === "business" ? "plan_cta_biz" : "plan_cta";
    const features = plan.featureKeys.map((k) => `<li class="feature-item">${t(k)}</li>`).join("");

    const card = document.createElement("div");
    card.className = `price-card reveal${plan.popular ? " price-popular" : ""}`;
    card.innerHTML = `
      ${plan.popular ? `<span class="popular-badge">${t("plan_popular")}</span>` : ""}
      <div class="price-icon">${plan.icon}</div>
      <p class="plan-name">${plan.id === "starter" ? t("plan_free") : plan.id === "business" ? "Business" : "Pro"}</p>
      <p class="price-amount">$${price}<span class="price-period">${per}</span></p>
      <ul class="feature-list">${features}</ul>
      <button class="price-cta ${plan.popular ? "btn-primary" : "btn-ghost"}">${t(ctaKey)}</button>
    `;
    card.querySelector(".price-cta").addEventListener("click", () => openModal(plan.id));
    grid.appendChild(card);
  });
  observeReveals();
}

function initBillingToggle() {
  $("billingMonthly").addEventListener("click", () => {
    billingMode = "monthly";
    renderBillingButtons();
    renderPricing();
  });
  $("billingYearly").addEventListener("click", () => {
    billingMode = "yearly";
    renderBillingButtons();
    renderPricing();
  });
}

/* ============================================================
   6) الأسئلة الشائعة (أكورديون)
   ============================================================ */
function renderFaq() {
  const list = $("faqList");
  list.innerHTML = "";
  window.FaqData.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "faq-item reveal";
    wrapper.innerHTML = `
      <button class="faq-q" aria-expanded="false">
        <span class="faq-icon">${item.icon}</span>
        <span class="faq-q-text">${t(`faq_q${item.id}`)}</span>
        <svg class="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-a"><div class="faq-a-inner">${t(`faq_a${item.id}`)}</div></div>
    `;
    const btn = wrapper.querySelector(".faq-q");
    const ans = wrapper.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = wrapper.classList.contains("faq-open");
      // أغلق البقية
      list.querySelectorAll(".faq-item.faq-open").forEach((other) => {
        if (other !== wrapper) {
          other.classList.remove("faq-open");
          other.querySelector(".faq-a").style.maxHeight = "0";
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      wrapper.classList.toggle("faq-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      ans.style.maxHeight = !isOpen ? `${ans.scrollHeight}px` : "0";
    });
    list.appendChild(wrapper);
  });
  observeReveals();
}

/* ============================================================
   7) الشات الذكي (ديمو حي)
   ============================================================ */
const INTENTS = {
  book: ["حجز", "موعد", "أحجز", "احجز", "احجزي", "ميعاد", "book", "appoint", "reserv", "rendez", "cita", "reserva", "buchen", "termin", "prenot", "appunt", "agend", "marcar", "запис", "бронир", "randevu", "rezerv", "رزرو", "نوبت", "预约", "预订", "予約", "예약", "बुक", "बुकिं", "بکنگ", "بوکنگ", "pesan", "janji", "slot", "schedul", "meeting", "ميتينغ", "جلسة"],
  prices: ["سعر", "أسعار", "اسعار", "تكلفة", "بكم", "كم", "price", "prices", "cost", "pricing", "tarif", "prix", "coût", "precio", "costo", "kosten", "preis", "prezzo", "preço", "цена", "стоимост", "fiyat", "ücret", "قیمت", "价格", "价钱", "料金", "가격", "कीमत", "दाम", "harga", "biaya"],
  hours: ["مواعيد", "ساعات", "وقت", "دوام", "مفتوح", "hours", "hour", "open", "when", "heure", "horaire", "horario", "stunden", "öffn", "orari", "часы", "работ", "время", "saat", "çalışma", "ساعت", "营业", "时间", "営業", "시간", "घंट", "jam", "buka"],
  contact: ["تواصل", "اتصال", "رقم", "هاتف", "واتساب", "contact", "phone", "call", "whatsapp", "email", "mail", "reach", "contacter", "téléphone", "contacto", "teléfono", "kontakt", "telefon", "contatti", "telefono", "контакт", "телефон", "iletişim", "تماس", "ہیلپ", "联系电话", "联系", "連絡", "연락", "संपर्क", "राब्ता", "kontak", "hubungi"],
};

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const [intent, words] of Object.entries(INTENTS)) {
    if (words.some((w) => lower.includes(w))) return intent;
  }
  return "generic";
}

function scrollChat() {
  const box = $("chatBox");
  box.scrollTop = box.scrollHeight;
}

function addMessage(text, who) {
  const box = $("chatBox");
  const msg = document.createElement("div");
  msg.className = who === "user" ? "msg msg-user" : "msg msg-agent";
  if (who === "agent") {
    msg.innerHTML = `<div class="msg-agent-name">AutoBook</div>${text}`;
  } else {
    msg.textContent = text;
  }
  box.appendChild(msg);
  scrollChat();
}

function addAgentMessage(text) { addMessage(text, "agent"); }
function addUserMessage(text) { addMessage(text, "user"); }

function showTyping() {
  const tip = $("typingIndicator");
  tip.classList.remove("hidden");
  tip.classList.add("flex");
}
function hideTyping() {
  const tip = $("typingIndicator");
  tip.classList.add("hidden");
  tip.classList.remove("flex");
}

function agentReply(intentKey) {
  showTyping();
  const delay = Math.min(2200, Math.max(CFG.demo.typingDelay, 500 + Math.random() * 900));
  setTimeout(() => {
    hideTyping();
    addAgentMessage(t(`demo_reply_${intentKey}`));
  }, delay);
}

function sendUserMessage(text, forcedIntent) {
  if (!text || !text.trim()) return;
  chatStarted = true;
  addUserMessage(text.trim());
  const intent = forcedIntent || detectIntent(text);
  agentReply(intent);
}

function initChat() {
  const input = $("chatInput");
  const send = () => {
    const val = input.value;
    input.value = "";
    sendUserMessage(val);
  };
  $("sendBtn").addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  if (CFG.demo.autoStart) {
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        chatStarted = true;
        addAgentMessage(t("demo_welcome"));
      }, 900);
    }, 700);
  }
}

/* ============================================================
   8) مودال الدفع/الحجز
   ============================================================ */
function openModal(planId) {
  $("modalForm").classList.remove("hidden");
  $("modalSuccess").classList.add("hidden");
  const modal = $("paymentModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  body.style.overflow = "hidden";
  $("mName").focus();
}

function closeModal() {
  const modal = $("paymentModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  body.style.overflow = "";
}

function initModal() {
  $("ctaModalBtn").addEventListener("click", (e) => { e.preventDefault(); openModal(); });
  $("modalCloseX").addEventListener("click", closeModal);
  $("modalOverlay").addEventListener("click", closeModal);
  $("modalCloseBtn").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("paymentModal").classList.contains("hidden")) closeModal();
  });
  $("leadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("modalForm").classList.add("hidden");
    $("modalSuccess").classList.remove("hidden");
  });
}

/* ============================================================
   9) Reveal عند التمرير
   ============================================================ */
let revealObserver = null;
function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal-visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }
  document.querySelectorAll(".reveal:not(.reveal-visible)").forEach((el) => revealObserver.observe(el));
}

/* ============================================================
   10) تهيئة التطبيق
   ============================================================ */
function init() {
  $("yearNow").textContent = new Date().getFullYear();
  initLangSelect();
  setLanguage(currentLang);
  initBillingToggle();
  initChat();
  initModal();
  observeReveals();
  initInstallBtn();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", init);

/* ============================================================
   11) PWA — زر "تثبيت التطبيق"
   ============================================================ */
let deferredInstallPrompt = null;

function initInstallBtn() {
  const btn = $("installBtn");
  if (!btn) return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    btn.classList.remove("hidden");
  });

  btn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      btn.classList.add("hidden");
    }
    deferredInstallPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    btn.classList.add("hidden");
  });
}

/* ============================================================
   12) PWA — تسجيل Service Worker (العمل دون اتصال)
   ============================================================ */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  }
}

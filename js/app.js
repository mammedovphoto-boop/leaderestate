import { CONFIG } from "./config.js";
import { I18N } from "./i18n.js";

document.documentElement.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- state ---------- */
let lang = CONFIG.defaultLang;
try {
  const saved = localStorage.getItem("le_lang");
  if (CONFIG.langs.includes(saved)) lang = saved;
} catch (e) {}
const st = { intent: null, mode: null, ptype: null, rooms: null, cur: CONFIG.currencies[0] };
const errors = {}; // field -> i18n key
let ready = false;
let statusKey = null;

const t = (k) => I18N[lang][k] ?? I18N.ru[k] ?? k;

/* ---------- option sets ---------- */
const OPT = {
  intent: [["buy", "i_buy", "i_buy_h"], ["sell", "i_sell", "i_sell_h"], ["rent", "i_rent", "i_rent_h"], ["consult", "i_consult", "i_consult_h"]],
  mode: [["take", "m_take"], ["let", "m_let"]],
  ptype: [["flat", "pt_flat"], ["house", "pt_house"], ["land", "pt_land"], ["com", "pt_com"]],
  rooms: [["1"], ["2"], ["3"], ["4"], ["5+"]],
  cur: CONFIG.currencies.map((c) => [c]),
};
const OPTIONAL = new Set(["rooms"]); // chips that can be switched off again

function renderChips(name) {
  const box = $(`[data-chips="${name}"]`);
  box.textContent = "";
  for (const [id, key, hintKey] of OPT[name]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = name === "intent" ? "tile" : "chip";
    b.setAttribute("aria-pressed", String(st[name] === id));
    if (name === "intent") {
      const s = document.createElement("b"); s.textContent = t(key);
      const h = document.createElement("span"); h.textContent = t(hintKey);
      b.append(s, h);
    } else b.textContent = key ? t(key) : id;
    b.addEventListener("click", () => {
      st[name] = OPTIONAL.has(name) && st[name] === id ? null : id;
      delete errors[name];
      if (name === "intent") { delete errors.mode; delete errors.ptype; delete errors.question; delete errors.phone; }
      update();
    });
    box.append(b);
  }
}

function renderDistricts() {
  const sel = $("#district");
  const keep = sel.value;
  sel.textContent = "";
  const add = (parent, value, label) => {
    const o = document.createElement("option"); o.value = value; o.textContent = label; parent.append(o); return o;
  };
  add(sel, "", t("d_placeholder"));
  const searching = st.intent === "buy" || (st.intent === "rent" && st.mode !== "let");
  if (searching) { add(sel, "any", t("d_any")); add(sel, "undecided", t("d_undecided")); }
  for (const g of CONFIG.districts) {
    const og = document.createElement("optgroup"); og.label = t(g.group);
    for (const d of g.items) add(og, d.id, d[lang] || d.ru);
    sel.append(og);
  }
  add(sel, "other", t("d_other"));
  sel.value = [...sel.options].some((o) => o.value === keep) ? keep : "";
  $("#districtOther").hidden = sel.value !== "other";
}

function districtText() {
  const v = $("#district").value;
  if (!v) return "";
  if (v === "any") return t("d_any");
  if (v === "undecided") return t("d_undecided");
  if (v === "other") return $("#districtOther").value.trim() || t("d_other");
  for (const g of CONFIG.districts) for (const d of g.items) if (d.id === v) return d[lang] || d.ru;
  return "";
}

/* ---------- phone ---------- */
function parsePhone(raw) {
  raw = raw.trim();
  let d = raw.replace(/\D/g, "");
  if (!d) return { empty: true };
  if (raw.startsWith("+") && !d.startsWith("993")) {
    return d.length >= 8 && d.length <= 15 ? { ok: true, text: "+" + d } : { ok: false };
  }
  if (d.startsWith("993")) d = d.slice(3);
  else if (d.length === 9 && d[0] === "8") d = d.slice(1);
  if (!/^[1-7]\d{7}$/.test(d)) return { ok: false };
  return { ok: true, text: `+993 ${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6)}` };
}

/* ---------- request text ---------- */
const val = (id) => $("#" + id).value.trim();
const groupNum = (s) => s.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const inForm = (name) => {
  const el = $(`#fields [data-chips="${name}"], #${name}`);
  const f = el && el.closest(".field");
  return f ? f.dataset.for.split(" ").includes(st.intent) : false;
};

function buildMessage() {
  const L = [t("msg_head"), ""];
  const add = (k, v) => { if (v) L.push(`${t(k)}: ${v}`); };
  const i = st.intent;
  add("m_type", i === "rent" ? t(st.mode === "let" ? "t_rent_let" : "t_rent_take") : t("t_" + i));
  if (i !== "consult") {
    const p = OPT.ptype.find((o) => o[0] === st.ptype);
    add("m_prop", p ? t(p[1]) : "");
    add("m_loc", districtText());
    if (inForm("rooms")) add("m_rooms", st.rooms || "");
    if (inForm("area") && val("area")) add("m_area", val("area") + " " + t("sqm"));
    const money = groupNum(val("money"));
    if (money) {
      const offering = i === "sell" || (i === "rent" && st.mode === "let");
      add(offering ? "m_price" : "m_budget", `${money} ${st.cur}${i === "rent" ? " " + t("per_month") : ""}`);
    }
    add(i === "buy" ? "m_wishes" : "m_comment", val("note"));
  } else add("m_question", val("question"));
  add("m_contact", parsePhone(val("phone")).text);
  return L.join("\n");
}

/* ---------- render ---------- */
function update() {
  const i = st.intent;
  $("#fields").hidden = !i;
  $$("#fields .field").forEach((f) => { f.hidden = !f.dataset.for.split(" ").includes(i); });
  ["intent", "mode", "ptype", "rooms", "cur"].forEach(renderChips);
  renderDistricts();
  const letting = i === "rent" && st.mode === "let";
  $("#moneyLbl").textContent = t(i === "sell" ? "l_price" : i === "rent" ? (letting ? "l_rent_price" : "l_rent_budget") : "l_budget");
  $("#noteLbl").textContent = t(i === "buy" ? "l_wishes" : "l_comment");
  $("#note").placeholder = t(i === "buy" ? "wishes_ph" : "comment_ph");
  renderErrors();
  $("#formBody").hidden = ready;
  $("#ready").hidden = !ready;
  if (ready) {
    const msg = buildMessage();
    $("#msg").textContent = msg;
    const enc = encodeURIComponent(msg);
    $("#sendWa").href = `https://wa.me/${CONFIG.whatsapp}?text=${enc}`;
    $("#sendSms").href = `sms:${CONFIG.phone}?&body=${enc}`;
    $("#status").textContent = statusKey ? t(statusKey) : "";
  }
}

function renderErrors() {
  $$("[data-err]").forEach((p) => {
    const key = errors[p.dataset.err];
    p.textContent = key ? t(key) : "";
    p.closest(".field").classList.toggle("bad", !!key);
  });
  $("#phone").setAttribute("aria-invalid", String(!!errors.phone));
  $("#question").setAttribute("aria-invalid", String(!!errors.question));
}

function applyLang() {
  document.documentElement.lang = lang === "tm" ? "tk" : lang;
  document.title = t("meta_title");
  $('meta[name="description"]').content = t("meta_desc");
  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  const pp = $("#ppBody"); pp.textContent = "";
  for (const [h, p] of I18N[lang].pp) {
    const hh = document.createElement("h3"); hh.textContent = h;
    const pe = document.createElement("p"); pe.textContent = p;
    pp.append(hh, pe);
  }
  update();
}

/* ---------- events ---------- */
$$(".lang button").forEach((b) => b.addEventListener("click", () => {
  lang = b.dataset.lang;
  try { localStorage.setItem("le_lang", lang); } catch (e) {}
  applyLang();
}));

$("#district").addEventListener("change", () => {
  const other = $("#district").value === "other";
  $("#districtOther").hidden = !other;
  if (other) $("#districtOther").focus();
});
$("#money").addEventListener("input", (e) => { e.target.value = groupNum(e.target.value); });
$("#area").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/[^\d.,]/g, ""); });
$("#phone").addEventListener("focus", (e) => { if (!e.target.value) e.target.value = "+993 "; });
$("#phone").addEventListener("blur", (e) => {
  if (e.target.value.trim() === "+993") { e.target.value = ""; return; }
  const p = parsePhone(e.target.value);
  if (p.ok) e.target.value = p.text;
});
$("#phone").addEventListener("input", () => { if (errors.phone) { delete errors.phone; renderErrors(); } });
$("#question").addEventListener("input", () => { if (errors.question) { delete errors.question; renderErrors(); } });

$("#reqForm").addEventListener("submit", (e) => {
  e.preventDefault();
  for (const k of Object.keys(errors)) delete errors[k];
  const i = st.intent;
  if (!i) errors.intent = "e_intent";
  else {
    if (i === "rent" && !st.mode) errors.mode = "e_mode";
    if (i !== "consult" && !st.ptype) errors.ptype = "e_ptype";
    if (i === "consult" && !val("question")) errors.question = "e_question";
    const p = parsePhone(val("phone"));
    if (p.empty || val("phone") === "+993") errors.phone = "e_phone_empty";
    else if (!p.ok) errors.phone = "e_phone_bad";
  }
  const first = ["intent", "mode", "ptype", "question", "phone"].find((k) => errors[k]);
  if (first) {
    renderErrors();
    const field = $(`[data-field="${first}"]`);
    const target = $("input,textarea,button", field);
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target) target.focus({ preventScroll: true });
    return;
  }
  ready = true; statusKey = null;
  update();
  $("#ready").focus({ preventScroll: true });
  $("#request").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#editBtn").addEventListener("click", () => { ready = false; update(); });

function copyText(txt) {
  let ok = false;
  try {
    const ta = document.createElement("textarea");
    ta.value = txt; ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    document.body.append(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length);
    ok = document.execCommand("copy"); ta.remove();
  } catch (e) {}
  try { if (navigator.clipboard) { navigator.clipboard.writeText(txt).catch(() => {}); ok = true; } } catch (e) {}
  return ok;
}
$("#sendCopy").addEventListener("click", () => {
  statusKey = copyText($("#msg").textContent) ? "r_copied" : "r_copy_fail";
  $("#status").textContent = t(statusKey);
});

// Service buttons open the form with the service already chosen.
$$("[data-intent]").forEach((a) => a.addEventListener("click", () => {
  st.intent = a.dataset.intent; ready = false; update();
}));

// Privacy dialog
const dlg = $("#privacy");
$$('[data-open="privacy"]').forEach((b) => b.addEventListener("click", () => {
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
}));
$("[data-close]", dlg).addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

// Contact details come from the config.
$("#sendCall").href = $("#conPhone").href = $("#ftrPhone").href = "tel:" + CONFIG.phone;
$("#conPhone").textContent = $("#ftrPhone").textContent = CONFIG.phoneDisplay;
$("#conWa").href = "https://wa.me/" + CONFIG.whatsapp;
$("#conIg").href = `https://www.instagram.com/${CONFIG.instagram}/`;
$("#conIg").textContent = "Instagram @" + CONFIG.instagram;
$("#yr").textContent = new Date().getFullYear();

// Mobile "request" bar: shown after the first screen, hidden near the form and contacts.
if ("IntersectionObserver" in window) {
  const seen = new Map();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => seen.set(e.target, e.isIntersecting));
    const hide = [...seen.values()].some(Boolean);
    $("#mcta").classList.toggle("show", !hide);
  }, { rootMargin: "0px 0px -15% 0px" });
  [$(".hero-btns"), $("#request"), $("#contacts"), $(".ftr")].forEach((el) => { seen.set(el, false); io.observe(el); });
}

applyLang();

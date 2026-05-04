const BTN_ATTR = "data-followup-extension-btn";
const SLOT_ATTR = "data-followup-extension-slot";

function isLinkedInPersonProfile() {
  if (location.hostname !== "www.linkedin.com") return false;
  return /^\/in\/[^/]+/.test(location.pathname);
}

function profilePathKey(pathname) {
  const m = pathname.match(/^(\/in\/[^/]+)/i);
  return m ? m[1].toLowerCase() : "";
}

function removeFollowUpSlot() {
  document.querySelectorAll(`[${SLOT_ATTR}]`).forEach((el) => el.remove());
}

/**
 * Fila de acciones del hero: “Seguir”, “Mensaje”, “Más”.
 * El enlace a composer es estable (`/messaging/compose/`) frente a clases CSS hasheadas.
 */
function findMessagingActionCell() {
  const msg =
    document.querySelector('main a[href*="/messaging/compose/"]') ||
    document.querySelector('a[href*="/messaging/compose/"]');
  if (!msg) return null;

  const cell = msg.closest('div[data-display-contents="true"]');
  if (!cell) return null;

  const row = cell.parentElement;
  if (!row) return null;

  const displaySlots = [...row.children].filter(
    (c) => c.getAttribute("data-display-contents") === "true",
  );
  if (displaySlots.length < 2) return null;

  return { cell, row };
}

/** Clases copiadas del botón “Más” de LinkedIn (misma cáscara visual que el resto de la fila). */
const LI_BTN_CLASS =
  "_4f384a62 _91587c44 dd8fcdd5 _245d90bf d390f4b8 a2b3a7bc c96a7ab2 _5d2d3de5 _01691a8a _4f0b8dd1 d6b89358 _0aab5319 _79f92d9a";
const LI_BTN_SPAN_OUTER_CLASS =
  "_5d80957d _0066ddc7 d5f063cd _0aab5319 dd8fcdd5 _245d90bf d6b89358 _00a05460 _54208f2a a2b3a7bc c96a7ab2 _9979d9ea a8c268d5 eb45f2e0 _1510c155 b3587839 e08470e1 _36db672d fe166493";
const LI_BTN_SPAN_INNER_CLASS =
  "_9e348bbd _0fec4bad _4fde0dc2 c2540100 _37caf1ac fee0e818 _0b38bcd0 _51112094 _6c3dc65d _360e4ac3 _2441c67f c0283d7f d390f4b8 _4fb23d32 d91ea27d";

const ACCENT_BG = "transparent";
const COLOR = "#0A66C2";

function buildFollowUpButton(key) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = LI_BTN_CLASS;
  btn.setAttribute(BTN_ATTR, "1");
  btn.dataset.profileKey = key;
  btn.setAttribute("aria-label", "Add follow-up");
  btn.setAttribute("aria-expanded", "false");
  btn.style.backgroundColor = ACCENT_BG;
  btn.style.color = COLOR;

  const spanOuter = document.createElement("span");
  spanOuter.className = LI_BTN_SPAN_OUTER_CLASS;
  spanOuter.style.color = COLOR;

  const spanInner = document.createElement("span");
  spanInner.className = LI_BTN_SPAN_INNER_CLASS;
  spanInner.textContent = "Add follow-up";
  spanInner.style.color = COLOR;

  spanOuter.appendChild(spanInner);
  btn.appendChild(spanOuter);

  return btn;
}

function injectFollowUpIntoActionBar(key) {
  const found = findMessagingActionCell();
  if (!found) return false;

  const { cell } = found;

  const outer = document.createElement("div");
  outer.setAttribute(SLOT_ATTR, "1");
  outer.dataset.profileKey = key;
  outer.className = cell.className;
  outer.setAttribute("data-display-contents", "true");

  outer.appendChild(buildFollowUpButton(key));
  cell.insertAdjacentElement("afterend", outer);
  return true;
}

let pollTimer = null;
let pollAttempts = 0;
const POLL_MS = 400;
const POLL_MAX = 50;

function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  pollAttempts = 0;
}

function tryInjectFollowUp() {
  if (!isLinkedInPersonProfile()) {
    removeFollowUpSlot();
    stopPolling();
    return true;
  }

  const key = profilePathKey(location.pathname);

  const existing = document.querySelector(`[${SLOT_ATTR}]`);
  if (
    existing?.dataset.profileKey === key &&
    document.documentElement.contains(existing)
  ) {
    return true;
  }
  if (existing) existing.remove();

  const ok = injectFollowUpIntoActionBar(key);
  return ok;
}

function tickInject() {
  pollAttempts += 1;
  if (tryInjectFollowUp() || pollAttempts >= POLL_MAX) {
    stopPolling();
  }
}

function startPolling() {
  stopPolling();
  pollAttempts = 0;
  if (tryInjectFollowUp()) return;
  pollTimer = setInterval(tickInject, POLL_MS);
}

function installHistoryNavigationHooks() {
  const onNav = () => {
    removeFollowUpSlot();
    startPolling();
  };
  const wrap = (methodName) => {
    const orig = history[methodName];
    history[methodName] = function (...args) {
      const ret = orig.apply(this, args);
      onNav();
      return ret;
    };
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", onNav);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    startPolling();
    installHistoryNavigationHooks();
  });
} else {
  startPolling();
  installHistoryNavigationHooks();
}

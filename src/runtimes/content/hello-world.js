const BTN_ATTR = "data-followup-extension-btn";
const SLOT_ATTR = "data-followup-extension-slot";
const OPEN_FOLLOW_UP_FORM_ACTION = "OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE";

function isLinkedInPersonProfile() {
  if (location.hostname !== "www.linkedin.com") return false;
  return /^\/in\/[^/]+/.test(location.pathname);
}

function profilePathKey(pathname = location.pathname) {
  const m = pathname.match(/^(\/in\/[^/]+)/i);
  return m ? m[1].toLowerCase() : "";
}

function removeFollowUpSlot() {
  document.querySelectorAll(`[${SLOT_ATTR}]`).forEach((el) => el.remove());
}

function findFollowUpSlot() {
  return document.querySelector(`[${SLOT_ATTR}]`);
}

function slotIsHealthy(key) {
  const slot = findFollowUpSlot();
  return (
    slot != null &&
    slot.dataset.profileKey === key &&
    document.documentElement.contains(slot)
  );
}

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

  return { cell };
}

function extractProfileData() {
  const nameEl =
    document.querySelector('[componentkey^="ProfileVerificationTriggerRef-"] h2') ||
    document.querySelector('main h2') ||
    document.querySelector('h2');

  let name = nameEl ? nameEl.textContent.trim() : '';

  if (!name) {
    const match = window.location.pathname.match(/^\/in\/([^/]+)/i);
    if (match) {
      name = match[1]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  // Build the canonical profile URL without query parameters or fragments.
  const profileUrl = `${window.location.origin}${window.location.pathname}`;

  return { name, profileUrl };
}

function buildFollowUpButton(key) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute(BTN_ATTR, "1");
  btn.dataset.profileKey = key;
  btn.setAttribute("aria-label", "Add follow-up");

  Object.assign(btn.style, {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: "1.6rem",
    padding: "6px 16px",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "1.5",
    color: "rgba(0,0,0,0.6)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "rgba(0,0,0,0.08)";
    btn.style.color = "rgba(0,0,0,0.9)";
    btn.style.textDecoration = "none";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "transparent";
    btn.style.color = "rgba(0,0,0,0.6)";
  });

  const spanOuter = document.createElement("span");
  spanOuter.className = "artdeco-button__text";

  spanOuter.textContent = "Add follow-up";
  btn.appendChild(spanOuter);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const data = extractProfileData();
    const originalText = spanOuter.textContent;
    spanOuter.textContent = "Opening...";
    btn.disabled = true;

    const restoreButton = () => {
      spanOuter.textContent = originalText;
      btn.disabled = false;
    };

    const showError = () => {
      spanOuter.textContent = "✗ Error";
      setTimeout(restoreButton, 2000);
    };

    try {
      chrome.runtime.sendMessage(
        {
          action: OPEN_FOLLOW_UP_FORM_ACTION,
          payload: data,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("[follow-up] Runtime error:", chrome.runtime.lastError.message);
            showError();
          } else if (response && response.ok) {
            restoreButton();
          } else {
            console.error("[follow-up] Server error:", response?.error, "| Full response:", response);
            showError();
          }
        }
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      showError();
    }
  });

  return btn;
}

function injectFollowUpIntoActionBar(key) {
  if (slotIsHealthy(key)) return true;

  const found = findMessagingActionCell();
  if (!found) return false;

  const stale = findFollowUpSlot();
  if (stale) stale.remove();

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

/** Active profile, it works when enter and out from /in/... */
let trackedProfileKey = "";

let pollTimer = null;
let pollAttempts = 0;
const POLL_MS = 400;
const POLL_MAX = 80;

function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  pollAttempts = 0;
}

function syncForCurrentUrl() {
  const onProfile = isLinkedInPersonProfile();
  const key = profilePathKey();

  if (!onProfile) {
    if (trackedProfileKey) removeFollowUpSlot();
    trackedProfileKey = "";
    stopPolling();
    return true;
  }

  if (key !== trackedProfileKey) {
    removeFollowUpSlot();
    trackedProfileKey = key;
  }

  if (slotIsHealthy(key)) return true;
  return injectFollowUpIntoActionBar(key);
}

function tickInject() {
  pollAttempts += 1;
  const ok = syncForCurrentUrl();
  if (ok || pollAttempts >= POLL_MAX) stopPolling();
}

function startPolling() {
  stopPolling();
  pollAttempts = 0;
  if (syncForCurrentUrl()) return;
  pollTimer = setInterval(tickInject, POLL_MS);
}

let locationSyncTimer = null;
function scheduleLocationSync() {
  if (locationSyncTimer != null) clearTimeout(locationSyncTimer);
  locationSyncTimer = setTimeout(() => {
    locationSyncTimer = null;
    startPolling();
  }, 100);
}

function installHistoryNavigationHooks() {
  const onNav = () => scheduleLocationSync();

  const wrap = (methodName) => {
    const orig = history[methodName];
    if (orig.__followUpWrapped) return;
    history[methodName] = function (...args) {
      const ret = orig.apply(this, args);
      onNav();
      return ret;
    };
    history[methodName].__followUpWrapped = true;
  };

  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", onNav);
}

let reinjectTimer = null;
function scheduleReinjectIfNeeded() {
  if (!isLinkedInPersonProfile()) return;
  const key = profilePathKey();
  if (key !== trackedProfileKey) {
    scheduleLocationSync();
    return;
  }
  if (slotIsHealthy(key)) return;

  if (reinjectTimer != null) return;
  reinjectTimer = setTimeout(() => {
    reinjectTimer = null;
    if (!isLinkedInPersonProfile()) return;
    if (slotIsHealthy(profilePathKey())) return;
    syncForCurrentUrl();
    if (!slotIsHealthy(profilePathKey()) && !pollTimer) startPolling();
  }, 200);
}

function installDomObserver() {
  const main = document.querySelector("main");
  if (!main) return;

  const observer = new MutationObserver(() => scheduleReinjectIfNeeded());
  observer.observe(main, { childList: true, subtree: true });
}

/** LinkedIn not always triggers history when changing from feed to profile */
function installUrlWatcher() {
  let lastHref = location.href;
  setInterval(() => {
    if (location.href === lastHref) {
      if (isLinkedInPersonProfile() && !slotIsHealthy(profilePathKey())) {
        scheduleReinjectIfNeeded();
      }
      return;
    }
    lastHref = location.href;
    scheduleLocationSync();
  }, 800);
}

function boot() {
  installHistoryNavigationHooks();
  installDomObserver();
  installUrlWatcher();
  startPolling();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

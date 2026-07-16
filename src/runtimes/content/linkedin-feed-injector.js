/* global chrome */

const FEED_SLOT_ATTR = "data-followup-feed-slot";
const FEED_PROCESSED_ATTR = "data-followup-feed-processed";
const OPEN_FOLLOW_UP_FORM_ACTION = "OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE";

function isLinkedInFeed() {
  return (
    location.hostname === "www.linkedin.com" &&
    location.pathname.startsWith("/feed")
  );
}

function findUnprocessedFollowButtons() {
  const buttons = [
    ...document.querySelectorAll('button[aria-label^="Seguir a"]'),
    ...document.querySelectorAll("button:has(svg[id='add-small'])"),
  ];

  return [...new Set(buttons)].filter((btn) => !btn.hasAttribute(FEED_PROCESSED_ATTR));
}

function getFollowButtonName(seguirBtn) {
  const ariaLabel = seguirBtn.getAttribute("aria-label")?.trim() ?? "";
  const spanishMatch = ariaLabel.match(/^Seguir\s+a\s+(.+)$/i);
  const englishMatch = ariaLabel.match(/^Follow\s+(.+)$/i);
  return (spanishMatch?.[1] ?? englishMatch?.[1] ?? "").trim();
}

function getProfilePathname(url) {
  const pathname = url.pathname.replace(/\/+$/, "");
  const match = pathname.match(/^(\/in\/[^/]+)/i);
  return match ? match[1] : "";
}

function normalizeLinkedInProfileUrl(href) {
  try {
    const url = new URL(href, window.location.origin);
    const profilePathname = getProfilePathname(url);

    if (url.hostname !== "www.linkedin.com" || !profilePathname) {
      return "";
    }

    return `${url.origin}${profilePathname}`;
  } catch {
    return "";
  }
}

function cleanAuthorName(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+perfil\b.*$/i, "")
    .replace(/\s+profile\b.*$/i, "")
    .trim();
}

function getAuthorNameFromProfileLink(link) {
  const labelledElement = link.querySelector("[aria-label]");
  const candidates = [
    link.textContent,
    link.getAttribute("aria-label"),
    labelledElement?.getAttribute("aria-label"),
  ];

  for (const candidate of candidates) {
    const name = cleanAuthorName(candidate ?? "");
    if (name) return name;
  }

  return "";
}

function getPostRoot(seguirBtn, fallbackRoot) {
  return seguirBtn.closest('[role="listitem"]') ?? fallbackRoot ?? seguirBtn;
}

function extractFeedProfileData(seguirBtn, fallbackRoot) {
  const postRoot = getPostRoot(seguirBtn, fallbackRoot);
  const profileLink = [...postRoot.querySelectorAll('a[href*="/in/"]')]
    .find((link) => normalizeLinkedInProfileUrl(link.href));

  if (!profileLink) {
    return null;
  }

  const profileUrl = normalizeLinkedInProfileUrl(profileLink.href);
  const name = getFollowButtonName(seguirBtn) || getAuthorNameFromProfileLink(profileLink);

  if (!name || !profileUrl) {
    return null;
  }

  return { name, profileUrl };
}

function buildFeedFollowUpButton(seguirBtn, fallbackRoot) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Add follow-up");

  Object.assign(btn.style, {
    marginTop: "8px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    borderRadius: "1.6rem",
    padding: "5px 16px",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "1.5",
    color: "rgb(10, 102, 194)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "rgba(0,0,0,0.08)";
    btn.style.borderColor = "none";
    btn.style.color = "rgba(0,0,0,0.9)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "transparent";
    btn.style.borderColor = "none";
    btn.style.color = "rgb(10, 102, 194)";
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("fill", "currentColor");
  Object.assign(svg.style, {
    display: "block",
    minWidth: "16px",
    flexShrink: "0",
  });

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M14 9H9v5H7V9H2V7h5V2h2v5h5z");
  svg.appendChild(path);

  const label = document.createElement("span");
  label.textContent = "Add follow-up";

  btn.appendChild(svg);
  btn.appendChild(label);

  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const data = extractFeedProfileData(seguirBtn, fallbackRoot);
    const originalText = label.textContent;

    const restoreButton = () => {
      label.textContent = originalText;
      btn.disabled = false;
      btn.style.opacity = "1";
    };

    const showError = () => {
      label.textContent = "Error";
      btn.style.opacity = "1";
      setTimeout(restoreButton, 2000);
    };

    if (!data) {
      showError();
      return;
    }

    label.textContent = "Opening...";
    btn.disabled = true;
    btn.style.opacity = "0.6";

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
        },
      );
    } catch (error) {
      console.error("[follow-up] Failed to send message:", error);
      showError();
    }
  });

  return btn;
}

/**
 * Navigates three levels up from the "Seguir" button to find the outer
 * display-contents slot, then inserts a sibling slot with our button.
 *
 * DOM structure expected:
 *   outerWrapper[data-display-contents]   ← insert after this
 *     midWrapper[componentkey]
 *       innerWrapper[data-display-contents]
 *         button[aria-label^="Seguir a"]  ← seguirBtn
 */
function injectIntoCard(seguirBtn) {
  const innerWrapper = seguirBtn.closest('[data-display-contents="true"]');
  if (!innerWrapper) return;

  const midWrapper = innerWrapper.parentElement;
  if (!midWrapper) return;

  const outerWrapper = midWrapper.parentElement;
  if (
    !outerWrapper ||
    outerWrapper.getAttribute("data-display-contents") !== "true"
  )
    return;

  const slot = document.createElement("div");
  slot.setAttribute(FEED_SLOT_ATTR, "1");
  slot.setAttribute("data-display-contents", "true");
  slot.className = outerWrapper.className;
  slot.appendChild(buildFeedFollowUpButton(seguirBtn, outerWrapper));

  outerWrapper.insertAdjacentElement("afterend", slot);
  seguirBtn.setAttribute(FEED_PROCESSED_ATTR, "1");
}

function processNewPosts() {
  if (!isLinkedInFeed()) return;
  findUnprocessedFollowButtons().forEach(injectIntoCard);
}

let observerInstalled = false;

function installFeedObserver() {
  if (observerInstalled) return;
  observerInstalled = true;

  const observer = new MutationObserver(() => processNewPosts());
  observer.observe(document.body, { childList: true, subtree: true });
}

function boot() {
  if (!isLinkedInFeed()) return;
  installFeedObserver();
  processNewPosts();
}

const _origPushState = history.pushState;
if (!_origPushState.__followUpFeedWrapped) {
  history.pushState = function (...args) {
    const ret = _origPushState.apply(this, args);
    setTimeout(boot, 300);
    return ret;
  };
  history.pushState.__followUpFeedWrapped = true;
}

const _origReplaceState = history.replaceState;
if (!_origReplaceState.__followUpFeedWrapped) {
  history.replaceState = function (...args) {
    const ret = _origReplaceState.apply(this, args);
    setTimeout(boot, 300);
    return ret;
  };
  history.replaceState.__followUpFeedWrapped = true;
}

window.addEventListener("popstate", () => setTimeout(boot, 300));

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

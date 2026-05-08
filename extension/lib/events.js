import { getConfig } from "./config.js";

export function isHttpUrl(url) {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
}

export function sanitizeUrl(rawUrl) {
  if (!isHttpUrl(rawUrl)) return null;
  try {
    const u = new URL(rawUrl);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch (_) {
    return null;
  }
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("Chrome/")) return "chrome";
  return "unknown";
}

export async function buildEvent(action, tab) {
  if (!tab) return null;
  const safeUrl = sanitizeUrl(tab.url);
  if (!safeUrl) return null;

  const config = await getConfig();

  let domain = "";
  try {
    domain = new URL(safeUrl).hostname;
  } catch (_) {}

  return {
    "@timestamp": new Date().toISOString(),
    candidate_id: config.candidateId,
    browser: getBrowserName(),
    event: {
      kind: "event",
      category: ["web"],
      type: ["info"],
      action
    },
    url: {
      full: safeUrl,
      domain
    },
    page: {
      title: tab.title || ""
    },
    tab: {
      id: tab.id
    },
    window: {
      id: tab.windowId
    }
  };
}

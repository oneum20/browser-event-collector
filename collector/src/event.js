function safeJsonLine(obj) {
  try {
    return JSON.stringify(obj);
  } catch (_) {
    return null;
  }
}

function normalizeEvent(body) {
  if (!body || typeof body !== "object") return null;

  const ts = typeof body["@timestamp"] === "string" ? body["@timestamp"] : new Date().toISOString();
  const candidateId = String(body.candidate_id || body.candidateId || "unknown");

  return {
    ...body,
    "@timestamp": ts,
    candidate_id: candidateId
  };
}

function enrichEvent(evt, req, observer) {
  const forwardedFor = typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"] : "";
  const sourceIp =
    (typeof req.ip === "string" && req.ip) || (forwardedFor ? forwardedFor.split(",")[0].trim() : undefined);

  return {
    ...evt,
    observer: { ...(evt.observer || {}), ...observer },
    agent: {
      type: "browser_extension",
      name: "exam-monitor-extension",
      ...(evt.agent || {})
    },
    host: {
      name: evt.candidate_id || "unknown",
      ...(evt.host || {})
    },
    source: {
      ip: sourceIp,
      ...(evt.source || {})
    }
  };
}

module.exports = { safeJsonLine, normalizeEvent, enrichEvent };

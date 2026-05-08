const express = require("express");
const { normalizeEvent, enrichEvent } = require("./event");

function createApp(config, writer) {
  const app = express();
  app.set("trust proxy", config.trustProxy);
  app.use(express.json({ limit: config.maxBody }));

  app.post("/api/browser-events", (req, res) => {
    if (config.collectorToken) {
      const token = String(req.header("X-Collector-Token") || "");
      if (token !== config.collectorToken) return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const evt = normalizeEvent(req.body);
    if (!evt) return res.status(400).json({ ok: false, error: "invalid_json" });

    const enriched = enrichEvent(evt, req, config.observer);
    const ok = writer.writeEventNdjson(enriched);
    if (!ok) return res.status(400).json({ ok: false, error: "invalid_event" });

    return res.json({ ok: true });
  });

  app.get("/healthz", (req, res) => {
    return res.json({
      ok: true,
      outputMode: config.outputMode,
      outputDir: config.outputMode === "file" ? config.outputDir : undefined,
      observer: config.observer
    });
  });

  return app;
}

module.exports = { createApp };

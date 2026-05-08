const os = require("os");
const path = require("path");

function loadConfig() {
  return {
    port: Number(process.env.PORT || 8080),
    collectorToken: process.env.COLLECTOR_TOKEN || "",
    trustProxy: (process.env.TRUST_PROXY || "true").toLowerCase() === "true",
    maxBody: process.env.MAX_BODY || "1mb",
    outputMode: (process.env.OUTPUT_MODE || "file").toLowerCase(),
    outputDir: process.env.OUTPUT_DIR || path.join(process.cwd(), "logs"),
    outputFile: process.env.OUTPUT_FILE || "browser-events.ndjson",
    observer: {
      name: process.env.COLLECTOR_NAME || os.hostname(),
      type: "browser-event-collector",
      version: "1.0.0"
    }
  };
}

module.exports = { loadConfig };

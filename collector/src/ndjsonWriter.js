const fs = require("fs");
const path = require("path");
const { safeJsonLine } = require("./event");

function createNdjsonWriter(config) {
  let fileStream = null;

  function ensureFileStream() {
    if (config.outputMode !== "file") return null;
    if (fileStream) return fileStream;

    fs.mkdirSync(config.outputDir, { recursive: true });
    const fullPath = path.join(config.outputDir, config.outputFile);
    fileStream = fs.createWriteStream(fullPath, { flags: "a" });
    return fileStream;
  }

  function writeEventNdjson(evt) {
    const line = safeJsonLine(evt);
    if (!line) return false;

    if (config.outputMode === "stdout") {
      process.stdout.write(line + "\n");
      return true;
    }

    const s = ensureFileStream();
    s.write(line + "\n");
    return true;
  }

  function close() {
    try {
      if (fileStream) fileStream.end();
    } catch (_) {
      /* ignore */
    }
  }

  return { writeEventNdjson, close };
}

module.exports = { createNdjsonWriter };

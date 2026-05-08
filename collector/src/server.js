const { loadConfig } = require("./config");
const { createNdjsonWriter } = require("./ndjsonWriter");
const { createApp } = require("./app");

const config = loadConfig();
const writer = createNdjsonWriter(config);
const app = createApp(config, writer);

process.on("SIGTERM", () => {
  try {
    writer.close();
  } finally {
    process.exit(0);
  }
});

app.listen(config.port, "0.0.0.0", () => console.log(`listening on :${config.port}`));

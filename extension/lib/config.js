import { DEFAULT_TOKEN } from "./constants.js";

export async function getConfig() {
  const defaults = {
    collectorUrl: "http://127.0.0.1:8080/api/browser-events",
    candidateId: "unknown",
    collectorToken: DEFAULT_TOKEN
  };

  return new Promise((resolve) => {
    chrome.storage.managed.get(defaults, (items) => {
      resolve(items);
    });
  });
}

import { getConfig } from "./config.js";
import { DEFAULT_TOKEN, QUEUE_KEY, MAX_QUEUE } from "./constants.js";

let isFlushing = false;

async function getQueue() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ [QUEUE_KEY]: [] }, (items) => {
      resolve(Array.isArray(items[QUEUE_KEY]) ? items[QUEUE_KEY] : []);
    });
  });
}

async function setQueue(queue) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [QUEUE_KEY]: queue }, resolve);
  });
}

async function enqueueEvent(event) {
  if (!event) return;
  const queue = await getQueue();
  queue.push(event);
  if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
  await setQueue(queue);
}

async function postEvent(event) {
  const config = await getConfig();
  await fetch(config.collectorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Collector-Token": config.collectorToken || DEFAULT_TOKEN
    },
    body: JSON.stringify(event)
  });
}

export async function flushQueue() {
  if (isFlushing) return;
  isFlushing = true;

  try {
    let queue = await getQueue();
    if (queue.length === 0) return;

    const remaining = [];
    for (let i = 0; i < queue.length; i++) {
      const ev = queue[i];
      try {
        await postEvent(ev);
      } catch (e) {
        remaining.push(...queue.slice(i));
        break;
      }
    }
    if (remaining.length !== queue.length) {
      await setQueue(remaining);
    }
  } finally {
    isFlushing = false;
  }
}

export async function sendEvent(event) {
  if (!event) return;
  await enqueueEvent(event);
  await flushQueue();
}

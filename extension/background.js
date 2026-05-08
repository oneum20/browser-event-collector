import { buildEvent } from "./lib/events.js";
import { flushQueue, sendEvent } from "./lib/transport.js";
import { FLUSH_ALARM, FLUSH_PERIOD_MINUTES } from "./lib/constants.js";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  sendEvent(await buildEvent("tab_url_changed", tab));
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  sendEvent(await buildEvent("tab_activated", tab));
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const tab = await chrome.tabs.get(details.tabId);
  sendEvent(await buildEvent("navigation_completed", tab));
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  const tabs = await chrome.tabs.query({
    active: true,
    windowId
  });

  if (tabs.length > 0) {
    sendEvent(await buildEvent("window_focused", tabs[0]));
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: FLUSH_PERIOD_MINUTES });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm && alarm.name === FLUSH_ALARM) flushQueue();
});

flushQueue();

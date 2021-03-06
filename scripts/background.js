'use strict'; // Functions

var blocked_counter = 0;

function _updateBadge(str = "String", color = "#155997") {
  // Because the badge has limited space, it should have 4 characters or less.
  // Convert anything to string
  if (typeof str !== "string") str = "" + str;
  chrome.browserAction.setBadgeBackgroundColor({
    color: color
  });
  chrome.browserAction.setBadgeText({
    text: str
  });
}

(function (chrome) {
  // Store options
  chrome.runtime.onInstalled.addListener(function () {
    // Check synced settings
    chrome.storage.sync.get(["name", "keywords"], ({name, keywords}) => {
      if ( !(name && keywords) ) {
        chrome.storage.sync.set({
          opts: {
            ads: true,
            store: true,
            shared_post: false,
            contains_keywords: false,
            contains_name: false,
            yt: false
          },
          keywords: [],
          name: []
        });
      }
      chrome.tabs.create({
        url: chrome.runtime.getURL("popup.html"),
        selected: true
      });
    });
    // Notification after install
    chrome.notifications.create({
      type: "basic",
      title: chrome.i18n.getMessage("appName"),
      message: "Extension Installed!",
      iconUrl: "../images/128.png"
    });

    /* Get user identity (logged in email + ID)
    Required permission: "identity", "identity.email"
    chrome.identity.getProfileUserInfo((uInfo) => console.log(uInfo));
    */
  }); // Long-lived connection

  chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
      fetch(msg.url).then(function (data) {
        return data.json();
      }).then(function (data) {
        port.postMessage({
          response: data
        });
      });
    });
  }); // Short-lived connection. Actually just send the msg and quit.

  chrome.runtime.onMessage.addListener(function (msg, from, response) {
    var fncTable = {
      updateBadge: function updateBadge() {
        _updateBadge(++blocked_counter, msg.updateBadge.color);
      }
    };
    fncTable[Object.keys(msg)[0]]();
  }); // Open options page When Click To Icon

  chrome.browserAction.onClicked.addListener(function (a) {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
      selected: true
    });
  });
})(chrome);
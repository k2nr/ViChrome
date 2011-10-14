(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  g.bg = {
    tabHistory: null,
    moveTab: function(offset) {
      return chrome.tabs.getAllInWindow(null, function(tabs) {
        var nTabs;
        nTabs = tabs.length;
        return chrome.tabs.getSelected(null, function(tab) {
          var idx;
          idx = tab.index + offset;
          if (idx < 0) {
            idx = nTabs - 1;
          } else if (idx >= nTabs) {
            idx = 0;
          }
          return chrome.tabs.update(tabs[idx].id, {
            selected: true
          });
        });
      });
    },
    getSettings: function(msg, response) {
      var sendMsg;
      sendMsg = {};
      sendMsg.name = msg.name;
      if (msg.name === "all") {
        sendMsg.value = g.SettingManager.getAll();
      } else {
        sendMsg.value = g.SettingManager.get(msg.name);
      }
      return response(sendMsg);
    },
    setSettings: function(msg, response) {
      return g.SettingManager.set(msg.name, msg.value);
    },
    reqSettings: function(msg, response) {
      if (msg.type === "get") {
        this.getSettings(msg, response);
      } else if (msg.type === "set") {
        this.setSettings(msg, response);
      }
      return true;
    },
    getDefaultNewTabPage: function() {
      switch (g.SettingManager.get("defaultNewTab")) {
        case "home":
          break;
        case "newtab":
          return "chrome://newtab";
        case "blank":
          return "about:blank";
      }
    },
    reqOpenNewTab: function(req) {
      var arg, focus, len, pinned, url, urls, _i, _j, _len, _len2, _ref, _results;
      urls = [];
      focus = true;
      pinned = false;
      _ref = req.args;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        switch (arg) {
          case "-b":
          case "--background":
            focus = false;
            break;
          case "-p":
          case "--pinned":
            pinned = true;
            break;
          default:
            urls.push(arg);
        }
      }
      len = urls.length;
      if (len === 0) {
        url = this.getDefaultNewTabPage();
        return chrome.tabs.create({
          url: url,
          selected: focus,
          pinned: pinned
        });
      } else {
        _results = [];
        for (_j = 0, _len2 = urls.length; _j < _len2; _j++) {
          url = urls[_j];
          _results.push(chrome.tabs.create({
            url: url,
            selected: focus,
            pinned: pinned
          }));
        }
        return _results;
      }
    },
    reqOpenNewWindow: function(req) {
      var arg, focus, pop, urls, _i, _len, _ref;
      urls = [];
      focus = true;
      pop = false;
      _ref = req.args;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        switch (arg) {
          case "-b":
          case "--background":
            focus = false;
            break;
          case "-p":
          case "--pop":
            pop = true;
            break;
          default:
            urls.push(arg);
        }
      }
      if (pop) {
        return chrome.tabs.getSelected(null, function(tab) {
          if (urls.length === 0) {
            return chrome.windows.create({
              focused: focus,
              tabId: tab.id
            });
          } else {
            return chrome.windows.create({
              url: urls,
              focused: focus,
              tabId: tab.id
            });
          }
        });
      } else {
        if (urls.length === 0) {
          urls = this.getDefaultNewTabPage();
        }
        return chrome.windows.create({
          url: urls,
          focused: focus
        });
      }
    },
    reqCloseCurTab: function() {
      return chrome.tabs.getSelected(null, function(tab) {
        return chrome.tabs.remove(tab.id);
      });
    },
    reqMoveToNextTab: function() {
      return this.moveTab(1);
    },
    reqMoveToPrevTab: function() {
      return this.moveTab(-1);
    },
    reqRestoreTab: function(req) {
      return this.tabHistory.restoreLastClosedTab();
    },
    reqNMap: function(req, sendResponse) {
      var msg;
      if (!((req.args[0] != null) && (req.args[1] != null))) {
        return;
      }
      msg = {
        command: "Settings",
        name: "keyMappingNormal",
        value: g.SettingManager.setNMap(req.args)
      };
      sendResponse(msg);
      return true;
    },
    reqIMap: function(req, sendResponse) {
      var msg;
      if (!((req.args[0] != null) && (req.args[1] != null))) {
        return;
      }
      msg = {
        command: "Settings",
        name: "keyMappingInsert",
        value: g.SettingManager.setIMap(req.args)
      };
      sendResponse(msg);
      return true;
    },
    reqAlias: function(req, sendResponse) {
      var msg;
      if (!((req.args[0] != null) && (req.args[1] != null))) {
        return;
      }
      msg = {
        command: "Settings",
        name: "aliases",
        value: g.SettingManager.setAlias(req.args)
      };
      sendResponse(msg);
      return true;
    },
    reqPushSearchHistory: function(req) {
      var history, idx;
      if (req.value == null) {
        return;
      }
      history = JSON.parse(localStorage.getItem("_searchHistory"));
      history || (history = []);
      if ((idx = history.indexOf(req.value)) >= 0) {
        history.splice(idx, 1);
      }
      history.push(req.value);
      if (history.length > 10) {
        history.shift();
      }
      localStorage.setItem("_searchHistory", JSON.stringify(history));
    },
    reqGetSearchHistory: function(req, sendResponse) {
      var history, msg;
      history = JSON.parse(localStorage.getItem("_searchHistory"));
      msg = {
        command: "GetSearchHistory",
        value: history
      };
      sendResponse(msg);
      return true;
    },
    reqGetBookmark: function(req, sendResponse) {
      chrome.bookmarks.search(req.value, function(nodes) {
        return sendResponse(nodes);
      });
      return true;
    },
    reqGetHistory: function(req, sendResponse) {
      chrome.history.search({
        text: req.value,
        maxResults: 5
      }, function(items) {
        return sendResponse(items);
      });
      return true;
    },
    init: function() {
      this.tabHistory = (new g.TabHistory).init();
      g.SettingManager.init();
      return chrome.extension.onRequest.addListener(__bind(function(req, sender, sendResponse) {
        if (this["req" + req.command]) {
          if (!this["req" + req.command](req, sendResponse)) {
            return sendResponse();
          }
        } else {
          return g.logger.e("INVALID command!:", req.command);
        }
      }, this));
    }
  };
}).call(this);

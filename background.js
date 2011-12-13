(function() {
  var g, _ref;

  if ((_ref = this.vichrome) == null) this.vichrome = {};

  g = this.vichrome;

  g.bg = {
    tabHistory: null,
    moveTab: function(offset, start, callback) {
      return chrome.tabs.getAllInWindow(null, function(tabs) {
        var nTabs;
        nTabs = tabs.length;
        return chrome.tabs.getSelected(null, function(tab) {
          var idx;
          if (start != null) {
            idx = start + offset;
          } else {
            idx = tab.index + offset;
          }
          if (idx < 0) {
            idx = nTabs + (idx % nTabs);
          } else if (idx >= nTabs) {
            idx = idx % nTabs;
          }
          return chrome.tabs.update(tabs[idx].id, {
            selected: true
          }, callback);
        });
      });
    },
    getSettings: function(msg) {
      var sendMsg;
      sendMsg = {};
      sendMsg.name = msg.name;
      if (msg.name === "all") {
        sendMsg.value = g.SettingManager.getAll();
      } else {
        sendMsg.value = g.SettingManager.get(msg.name);
      }
      return sendMsg;
    },
    setSettings: function(msg, response) {
      g.SettingManager.set(msg.name, msg.value);
      return {};
    },
    reqSettings: function(msg, response) {
      if (msg.type === "get") {
        response(this.getSettings(msg));
      } else if (msg.type === "set") {
        response(this.setSettings(msg));
      }
      return true;
    },
    reqInit: function(msg, response, sender) {
      var o;
      o = this.getSettings({
        name: "all"
      });
      o.command = "Init";
      g.logger.d("frameID " + (this.tabHistory.getFrames(sender.tab)) + " added");
      o.frameID = this.tabHistory.getFrames(sender.tab);
      this.tabHistory.addFrames(sender.tab);
      response(o);
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
    reqTabOpenNew: function(req) {
      var arg, focus, len, pinned, times, url, urls, _i, _j, _len, _len2, _ref2, _ref3;
      urls = [];
      focus = true;
      pinned = false;
      _ref2 = req.args;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        arg = _ref2[_i];
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
      times = (_ref3 = req.times) != null ? _ref3 : 1;
      if (len === 0) {
        url = this.getDefaultNewTabPage();
        while (times--) {
          chrome.tabs.create({
            url: url,
            selected: focus,
            pinned: pinned
          });
        }
      } else {
        while (times--) {
          for (_j = 0, _len2 = urls.length; _j < _len2; _j++) {
            url = urls[_j];
            chrome.tabs.create({
              url: url,
              selected: focus,
              pinned: pinned
            });
          }
        }
      }
      return false;
    },
    reqCopy: function(req) {
      return chrome.tabs.getSelected(null, function(tab) {
        var c, data;
        data = req.args[0].replace(/%url/g, tab.url).replace(/%title/g, tab.title);
        c = data.charAt(0);
        if (c === "'" || c === "\"") {
          if (data.charAt(data.length - 1) === c) {
            data = data.substr(1, data.length - 2);
          }
        }
        return g.clipboard.set(data);
      });
    },
    reqWinOpenNew: function(req) {
      var arg, focus, pop, urls, _i, _len, _ref2;
      urls = [];
      focus = true;
      pop = false;
      _ref2 = req.args;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        arg = _ref2[_i];
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
        chrome.tabs.getSelected(null, function(tab) {
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
        if (urls.length === 0) urls = this.getDefaultNewTabPage();
        chrome.windows.create({
          url: urls,
          focused: focus
        });
      }
      return false;
    },
    reqTabCloseCurrent: function(req) {
      var arg, prev, _i, _len, _ref2;
      var _this = this;
      _ref2 = req.args;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        arg = _ref2[_i];
        switch (arg) {
          case "--focusprev":
            prev = true;
        }
      }
      chrome.tabs.getSelected(null, function(tab) {
        if (prev && tab.index > 0) {
          return _this.moveTab(-1, tab.index, function() {
            return chrome.tabs.remove(tab.id);
          });
        } else {
          return chrome.tabs.remove(tab.id);
        }
      });
      return false;
    },
    reqTabCloseAll: function(req) {
      var arg, only, _i, _len, _ref2;
      _ref2 = req.args;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        arg = _ref2[_i];
        switch (arg) {
          case "--only":
            only = true;
        }
      }
      chrome.tabs.getAllInWindow(null, function(tabs) {
        return chrome.tabs.getSelected(null, function(selected) {
          var tab, _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = tabs.length; _j < _len2; _j++) {
            tab = tabs[_j];
            if (!(only && selected.id === tab.id)) {
              _results.push(chrome.tabs.remove(tab.id));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      });
      return false;
    },
    reqTabReloadAll: function(req) {
      var _ref2;
      if ((_ref2 = g.tabs) != null) {
        if (typeof _ref2.reloadAllTabs === "function") _ref2.reloadAllTabs();
      }
      return false;
    },
    reqTabFocusNext: function(req) {
      var _ref2;
      if (((_ref2 = req.args) != null ? _ref2[0] : void 0) != null) {
        if (req.args[0] <= 0) return;
        this.moveTab(parseInt(req.args[0]) - 1, 0);
      } else {
        if (req.timesSpecified && req.times > 0) {
          this.moveTab(req.times - 1, 0);
        } else {
          this.moveTab(1);
        }
      }
      return false;
    },
    reqTabFocusPrev: function(req) {
      var times, _ref2;
      times = req.times ? req.times : 1;
      if (((_ref2 = req.args) != null ? _ref2[0] : void 0) != null) {
        this.moveTab(-parseInt(req.args[0]));
      } else {
        this.moveTab(-times);
      }
      return false;
    },
    reqTabFocusNextHistory: function(req) {
      this.tabSelHist.moveForward();
      return false;
    },
    reqTabFocusPrevHistory: function(req) {
      this.tabSelHist.moveBackward();
      return false;
    },
    reqTabSwitchLast: function(req) {
      this.tabSelHist.switchToLast();
      return false;
    },
    reqTabFocusFirst: function(req) {
      this.moveTab(0, 0);
      return false;
    },
    reqTabFocusLast: function(req) {
      this.moveTab(-1, 0);
      return false;
    },
    reqRestoreTab: function(req) {
      this.tabHistory.restoreLastClosedTab();
      return false;
    },
    reqNMap: function(req, sendResponse) {
      var msg;
      if (!((req.args[0] != null) && (req.args[1] != null))) return;
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
      if (!((req.args[0] != null) && (req.args[1] != null))) return;
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
      if (!((req.args[0] != null) && (req.args[1] != null))) return;
      msg = {
        command: "Settings",
        name: "aliases",
        value: g.SettingManager.setAlias(req.args)
      };
      sendResponse(msg);
      return true;
    },
    reqReadability: function(req) {
      chrome.tabs.getSelected(null, function(tab) {
        return chrome.extension.sendRequest("jggheggpdocamneaacmfoipeehedigia", {
          type: "render",
          tab_id: tab.id
        });
      });
      return false;
    },
    reqPushSearchHistory: function(req) {
      var history, idx;
      if (req.value == null) return;
      history = JSON.parse(localStorage.getItem("_searchHistory"));
      history || (history = []);
      if ((idx = history.indexOf(req.value)) >= 0) history.splice(idx, 1);
      history.push(req.value);
      if (history.length > 10) history.shift();
      localStorage.setItem("_searchHistory", JSON.stringify(history));
      return false;
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
    reqGetGoogleSuggest: function(req, sendResponse) {
      if (!this.gglLoaded) return false;
      if (this.cWSrch.isExec) return false;
      this.cWSrch.reset().sgst({
        kw: req.value,
        lan: g.util.getLang(),
        res: function(res) {
          return sendResponse(res.raw);
        }
      }).start();
      return true;
    },
    reqGetWebSuggest: function(req, sendResponse) {
      var _this = this;
      if (!this.gglLoaded) return false;
      if (this.cWSrch.isExec) return false;
      this.cWSrch.init({
        type: "web",
        opt: function(obj) {
          return obj.setResultSetSize(google.search.Search.LARGE_RESULTSET);
        }
      }).start();
      this.cWSrch.reset().srch({
        type: "web",
        page: 1,
        key: req.value,
        res: function(res) {
          var i, item, msg, obj, _len;
          if (!res || res.length <= 0) {
            _this.cWSrch.cmndsBreak();
            sendResponse();
            return;
          }
          msg = [];
          for (i = 0, _len = res.length; i < _len; i++) {
            item = res[i];
            obj = {};
            obj.titleNoFormatting = item.titleNoFormatting;
            obj.unescapedUrl = item.unescapedUrl;
            obj.url = item.url;
            msg.push(obj);
          }
          return sendResponse(msg);
        }
      }).start();
      return true;
    },
    reqGetTabList: function(req, sendResponse) {
      chrome.tabs.getAllInWindow(null, function(tabs) {
        return sendResponse(tabs);
      });
      return true;
    },
    reqOpenOptionPage: function(req) {
      var arg, key, url, _i, _len, _ref2;
      _ref2 = req.args;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        arg = _ref2[_i];
        switch (arg) {
          case "-k":
          case "--key":
            key = true;
        }
      }
      req = {};
      req.args = [];
      req.times = 1;
      url = chrome.extension.getURL("options.html");
      if (key) url += "#keymapping";
      req.args.push(url);
      return this.reqTabOpenNew(req);
    },
    reqTopFrame: function(req, response, sender) {
      var o;
      req.command = req.innerCommand;
      req.frameID = this.tabHistory.getTopFrameID(sender.tab);
      if (req.frameID != null) {
        chrome.tabs.sendRequest(sender.tab.id, req);
      } else {
        g.logger.e("can't send request to top frame: frame id is invalid");
        o = {};
        o.error = true;
        o.errorMsg = "something's wrong.try to reload page";
        response(o);
        return true;
      }
      return false;
    },
    reqPassToFrame: function(req, response, sender) {
      req.command = req.innerCommand;
      chrome.tabs.sendRequest(sender.tab.id, req);
      return false;
    },
    reqSendToCommandBox: function(req, response, sender) {
      var o;
      req.command = req.innerCommand;
      req.frameID = this.tabHistory.getCommandBoxID(sender.tab);
      if (req.frameID != null) {
        chrome.tabs.sendRequest(sender.tab.id, req);
      } else {
        g.logger.e("can't send request to command box: frame id is invalid");
        o = {};
        o.error = true;
        o.errorMsg = "Can't open commandbox.try to reload page";
        response(o);
        return true;
      }
      return false;
    },
    reqGetCommandTable: function(req, response, sender) {
      var _this = this;
      req.frameID = this.tabHistory.getTopFrameID(sender.tab);
      chrome.tabs.sendRequest(sender.tab.id, req, function(msg) {
        return response(msg);
      });
      return true;
    },
    reqGetAliases: function(req, response, sender) {
      var _this = this;
      req.frameID = this.tabHistory.getTopFrameID(sender.tab);
      chrome.tabs.sendRequest(sender.tab.id, req, function(msg) {
        return response(msg);
      });
      return true;
    },
    init: function() {
      var $WA, req, storedVersion;
      var _this = this;
      this.tabHistory = (new g.TabHistory).init();
      this.tabSelHist = (new g.TabSelectionHistory).init();
      g.SettingManager.init();
      $WA = crocro.webAi;
      this.cWSrch = new $WA.WebSrch();
      this.cWSrch.ready(function() {
        return _this.gglLoaded = true;
      });
      chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        var frameID, msg;
        g.logger.d("onRequest command: " + req.command);
        switch (req.command) {
          case "NotifyTopFrame":
            g.logger.d("top frame " + req.frameID);
            _this.tabHistory.setTopFrameID(sender.tab, req.frameID);
            return sendResponse();
          case "InitCommandFrame":
            msg = {};
            frameID = _this.tabHistory.getFrames(sender.tab);
            _this.tabHistory.setCommandBoxID(sender.tab, frameID);
            _this.tabHistory.addFrames(sender.tab);
            g.logger.d("commandBoxFrameID: " + frameID);
            msg.frameID = frameID;
            msg.enableCompletion = g.SettingManager.get("enableCompletion");
            msg.commandBoxWidth = g.SettingManager.get("commandBoxWidth");
            msg.commandBoxAlign = g.SettingManager.get("commandBoxAlign");
            msg.commandWaitTimeOut = g.SettingManager.get("commandWaitTimeOut");
            return sendResponse(msg);
          default:
            if (_this["req" + req.command]) {
              if (!_this["req" + req.command](req, sendResponse, sender)) {
                return sendResponse();
              }
            } else {
              return g.logger.e("INVALID command!:", req.command);
            }
        }
      });
      storedVersion = localStorage.version;
      if ((storedVersion != null) && storedVersion !== g.VICHROME_VERSION) {
        req = {};
        req.args = [];
        req.args.push("https://github.com/k2nr/ViChrome/wiki/Release-History");
        this.reqTabOpenNew(req);
      }
      return localStorage.version = g.VICHROME_VERSION;
    }
  };

}).call(this);

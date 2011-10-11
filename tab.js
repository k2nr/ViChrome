(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  g.TabHistory = (function() {
    function TabHistory() {}
    TabHistory.prototype.closeHistStack = [];
    TabHistory.prototype.openTabs = {};
    TabHistory.prototype.findOpenTabItem = function(tabId) {
      var tabs, win, _ref;
      _ref = this.openTabs;
      for (win in _ref) {
        tabs = _ref[win];
        if (tabs[tabId]) {
          return tabs[tabId];
        }
      }
    };
    TabHistory.prototype.popOpenTabItem = function(tabId) {
      var result, tabs, win, _ref;
      _ref = this.openTabs;
      for (win in _ref) {
        tabs = _ref[win];
        if (tabs[tabId]) {
          result = tabs[tabId];
          tabs[tabId] = void 0;
          return result;
        }
      }
    };
    TabHistory.prototype.addOpenTabItem = function(tab, history) {
      this.openTabs[tab.windowId][tab.id] = {};
      this.openTabs[tab.windowId][tab.id].tab = tab;
      if (history) {
        return this.openTabs[tab.windowId][tab.id].history = history;
      } else {
        this.openTabs[tab.windowId][tab.id].history = [];
        return this.openTabs[tab.windowId][tab.id].history.push(tab.url);
      }
    };
    TabHistory.prototype.initTabHist = function(winId) {
      return chrome.windows.getAll({
        populate: true
      }, __bind(function(wins) {
        var tab, win, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = wins.length; _i < _len; _i++) {
          win = wins[_i];
          this.openTabs[win.id] = {};
          _results.push((function() {
            var _j, _len2, _ref, _results2;
            _ref = win.tabs;
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              tab = _ref[_j];
              _results2.push(this.addOpenTabItem(tab));
            }
            return _results2;
          }).call(this));
        }
        return _results;
      }, this));
    };
    TabHistory.prototype.setupListeners = function() {
      chrome.tabs.onRemoved.addListener(__bind(function(tabId, info) {
        var item;
        logger.d("tab removed id:" + tabId);
        if (info.isWindowClosing) {
          return;
        }
        item = this.popOpenTabItem(tabId);
        if (item) {
          this.closeHistStack.push(item);
          if (this.closeHistStack.length > 10) {
            this.closeHistStack.shift();
          }
        }
      }, this));
      chrome.tabs.onCreated.addListener(__bind(function(tab) {
        logger.d("tab created id:" + tab.id);
        return this.addOpenTabItem(tab);
      }, this));
      chrome.tabs.onAttached.addListener(__bind(function(tabId, aInfo) {
        logger.d("tab attached tab:" + tabId + " -> win:" + aInfo.newWindowId);
        return chrome.tabs.get(tabId, __bind(function(tab) {
          return this.addOpenTabItem(tab);
        }, this));
      }, this));
      chrome.tabs.onDetached.addListener(__bind(function(tabId, dInfo) {
        logger.d("tab detached tab:" + tabId + " <- win:" + dInfo.oldWindowId);
        return this.popOpenTabItem(tabId);
      }, this));
      chrome.tabs.onUpdated.addListener(__bind(function(tabId, info, tab) {
        var target;
        target = this.openTabs[tab.windowId][tabId];
        if (info.url) {
          target.tab.url = info.url;
          target.history.push(info.url);
        }
        if (info.pinned) {
          return target.tab.pinned = info.pinned;
        }
      }, this));
      chrome.windows.onCreated.addListener(__bind(function(win) {
        logger.d("win created id:" + win.id);
        return this.openTabs[win.id] = {};
      }, this));
      chrome.windows.onRemoved.addListener(__bind(function(winId) {
        return delete this.openTabs[winId];
      }, this));
      return this;
    };
    TabHistory.prototype.init = function() {
      this.initTabHist();
      this.setupListeners();
      return this;
    };
    TabHistory.prototype.restoreLastClosedTab = function() {
      var item, opt;
      item = this.closeHistStack.pop();
      while (item && !this.openTabs[item.tab.windowId]) {
        item = this.closeHistStack.pop();
      }
      if (item == null) {
        return;
      }
      chrome.windows.update(item.tab.windowId, {
        focused: true
      });
      opt = {
        windowId: item.tab.windowId,
        url: item.tab.url
      };
      return chrome.tabs.create(opt, __bind(function(tab) {}, this));
    };
    return TabHistory;
  })();
}).call(this);

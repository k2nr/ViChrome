(function() {
  var g, _ref;

  if ((_ref = this.vichrome) == null) this.vichrome = {};

  g = this.vichrome;

  g.tabs = {};

  g.TabSelectionHistory = (function() {

    function TabSelectionHistory() {}

    TabSelectionHistory.prototype.init = function() {
      var _this = this;
      this.array = [];
      this.curPos = 0;
      this.isUpdating = false;
      chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
        var elem, i, _len, _ref2, _ref3;
        g.logger.d("selhist selChanged id:" + tabId, _this);
        if (((_ref2 = _this.array[_this.curPos]) != null ? _ref2.id : void 0) === tabId) {
          return;
        }
        _this.array.splice(_this.curPos + 1);
        _ref3 = _this.array;
        for (i = 0, _len = _ref3.length; i < _len; i++) {
          elem = _ref3[i];
          if (elem.id === tabId) {
            _this.array.splice(i, 1);
            break;
          }
        }
        _this.array.push({
          id: tabId,
          info: info
        });
        return _this.curPos = _this.array.length - 1;
      });
      chrome.tabs.onRemoved.addListener(function(tabId, info) {
        var elem, i, _len, _ref2, _results;
        g.logger.d("selhist tab removed id:" + tabId, _this);
        _ref2 = _this.array;
        _results = [];
        for (i = 0, _len = _ref2.length; i < _len; i++) {
          elem = _ref2[i];
          if (elem.id === tabId) {
            _this.array.splice(i, 1);
            if (_this.curPos >= i) _this.curPos--;
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      return this;
    };

    TabSelectionHistory.prototype.moveBackward = function() {
      var _this = this;
      if (!(this.array.length > 0)) return;
      if (this.isUpdating) return;
      if (this.curPos > 0) {
        --this.curPos;
      } else {
        this.curPos = this.array.length - 1;
      }
      chrome.tabs.update(this.array[this.curPos].id, {
        selected: true
      }, function() {
        return _this.isUpdating = false;
      });
      this.isUpdating = true;
      return this;
    };

    TabSelectionHistory.prototype.moveForward = function() {
      var _this = this;
      if (!(this.array.length > 0)) return;
      if (this.isUpdating) return;
      if (this.curPos < this.array.length - 1) {
        ++this.curPos;
      } else {
        this.curPos = 0;
      }
      chrome.tabs.update(this.array[this.curPos].id, {
        selected: true
      }, function() {
        return _this.isUpdating = false;
      });
      this.isUpdating = true;
      return this;
    };

    TabSelectionHistory.prototype.switchToLast = function() {
      var _this = this;
      if (!(this.array.length > 0)) return;
      if (!(this.curPos > 0)) return;
      if (this.isUpdating) return;
      chrome.tabs.update(this.array[this.curPos - 1].id, {
        selected: true
      }, function() {
        return _this.isUpdating = false;
      });
      this.isUpdating = true;
      return this;
    };

    return TabSelectionHistory;

  })();

  g.TabHistory = (function() {

    function TabHistory() {}

    TabHistory.prototype.closeHistStack = [];

    TabHistory.prototype.openTabs = {};

    TabHistory.prototype.findOpenTabItem = function(tabId) {
      var tabs, win, _ref2;
      _ref2 = this.openTabs;
      for (win in _ref2) {
        tabs = _ref2[win];
        if (tabs[tabId]) return tabs[tabId];
      }
    };

    TabHistory.prototype.popOpenTabItem = function(tabId) {
      var result, tabs, win, _ref2;
      _ref2 = this.openTabs;
      for (win in _ref2) {
        tabs = _ref2[win];
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
      this.openTabs[tab.windowId][tab.id].frames = 0;
      if (history) {
        return this.openTabs[tab.windowId][tab.id].history = history;
      } else {
        this.openTabs[tab.windowId][tab.id].history = [];
        return this.openTabs[tab.windowId][tab.id].history.push(tab.url);
      }
    };

    TabHistory.prototype.setTopFrameID = function(tab, id) {
      var _ref2;
      if (((_ref2 = this.openTabs[tab.windowId]) != null ? _ref2[tab.id] : void 0) != null) {
        return this.openTabs[tab.windowId][tab.id].topFrame = id;
      }
    };

    TabHistory.prototype.getTopFrameID = function(tab) {
      var _ref2, _ref3;
      return (_ref2 = this.openTabs[tab.windowId]) != null ? (_ref3 = _ref2[tab.id]) != null ? _ref3.topFrame : void 0 : void 0;
    };

    TabHistory.prototype.setCommandBoxID = function(tab, id) {
      var _ref2;
      if (((_ref2 = this.openTabs[tab.windowId]) != null ? _ref2[tab.id] : void 0) != null) {
        return this.openTabs[tab.windowId][tab.id].comBoxID = id;
      }
    };

    TabHistory.prototype.getCommandBoxID = function(tab) {
      var _ref2, _ref3;
      return (_ref2 = this.openTabs[tab.windowId]) != null ? (_ref3 = _ref2[tab.id]) != null ? _ref3.comBoxID : void 0 : void 0;
    };

    TabHistory.prototype.setFrames = function(tab, frames) {
      var _ref2;
      if (((_ref2 = this.openTabs[tab.windowId]) != null ? _ref2[tab.id] : void 0) != null) {
        return this.openTabs[tab.windowId][tab.id].frames = frames;
      }
    };

    TabHistory.prototype.addFrames = function(tab) {
      var _ref2;
      if (((_ref2 = this.openTabs[tab.windowId]) != null ? _ref2[tab.id] : void 0) != null) {
        return ++this.openTabs[tab.windowId][tab.id].frames;
      }
    };

    TabHistory.prototype.getFrames = function(tab) {
      var _ref2, _ref3;
      return (_ref2 = this.openTabs[tab.windowId]) != null ? (_ref3 = _ref2[tab.id]) != null ? _ref3.frames : void 0 : void 0;
    };

    TabHistory.prototype.initTabHist = function(winId) {
      var _this = this;
      return chrome.windows.getAll({
        populate: true
      }, function(wins) {
        var tab, win, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = wins.length; _i < _len; _i++) {
          win = wins[_i];
          _this.openTabs[win.id] = {};
          _results.push((function() {
            var _j, _len2, _ref2, _results2;
            _ref2 = win.tabs;
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              tab = _ref2[_j];
              _results2.push(this.addOpenTabItem(tab));
            }
            return _results2;
          }).call(_this));
        }
        return _results;
      });
    };

    TabHistory.prototype.setupListeners = function() {
      var _this = this;
      chrome.tabs.onRemoved.addListener(function(tabId, info) {
        var item;
        g.logger.d("tab removed id:" + tabId);
        if (info.isWindowClosing) return;
        item = _this.popOpenTabItem(tabId);
        if (item) {
          _this.closeHistStack.push(item);
          if (_this.closeHistStack.length > 10) _this.closeHistStack.shift();
        }
      });
      chrome.tabs.onCreated.addListener(function(tab) {
        g.logger.d("tab created id:" + tab.id);
        return _this.addOpenTabItem(tab);
      });
      chrome.tabs.onAttached.addListener(function(tabId, aInfo) {
        g.logger.d("tab attached tab:" + tabId + " -> win:" + aInfo.newWindowId);
        return chrome.tabs.get(tabId, function(tab) {
          return _this.addOpenTabItem(tab);
        });
      });
      chrome.tabs.onDetached.addListener(function(tabId, dInfo) {
        g.logger.d("tab detached tab:" + tabId + " <- win:" + dInfo.oldWindowId);
        return _this.popOpenTabItem(tabId);
      });
      chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
        var target;
        target = _this.openTabs[tab.windowId][tabId];
        if (info.url) {
          target.tab.url = info.url;
          target.history.push(info.url);
        }
        if (info.pinned) return target.tab.pinned = info.pinned;
      });
      chrome.windows.onCreated.addListener(function(win) {
        g.logger.d("win created id:" + win.id);
        return _this.openTabs[win.id] = {};
      });
      chrome.windows.onRemoved.addListener(function(winId) {
        return delete _this.openTabs[winId];
      });
      return this;
    };

    TabHistory.prototype.init = function() {
      this.initTabHist();
      this.setupListeners();
      return this;
    };

    TabHistory.prototype.restoreLastClosedTab = function() {
      var item, opt;
      var _this = this;
      item = this.closeHistStack.pop();
      while ((item != null) && !this.openTabs[item.tab.windowId]) {
        item = this.closeHistStack.pop();
      }
      if (item == null) return;
      chrome.windows.update(item.tab.windowId, {
        focused: true
      });
      opt = {
        windowId: item.tab.windowId,
        url: item.tab.url
      };
      return chrome.tabs.create(opt, function(tab) {});
    };

    return TabHistory;

  })();

  g.tabs.reloadAllTabs = function() {
    return chrome.tabs.getAllInWindow(null, function(tabs) {
      var tab, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tabs.length; _i < _len; _i++) {
        tab = tabs[_i];
        _results.push(chrome.tabs.update(tab.id, {
          url: tab.url
        }));
      }
      return _results;
    });
  };

}).call(this);

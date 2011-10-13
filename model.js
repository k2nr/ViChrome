(function() {
  var g, getAliasFirst, getCMapFirst, getIMapFirst, getNMapFirst;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  getNMapFirst = function() {
    var map, myMap, nmap, pageMap, url, _ref;
    nmap = g.object(this.getSetting("keyMappingNormal"));
    pageMap = this.getSetting("pageMap");
    if (!(((_ref = window.location.href) != null ? _ref.length : void 0) > 0)) {
      return nmap;
    }
    myMap = nmap;
    for (url in pageMap) {
      map = pageMap[url];
      if (this.isUrlMatched(window.location.href, url)) {
        g.extend(map.nmap, myMap);
      }
    }
    this.getNMap = function() {
      return myMap;
    };
    return myMap;
  };
  getIMapFirst = function() {
    var imap, map, myMap, pageMap, url, _ref;
    imap = g.object(this.getSetting("keyMappingInsert"));
    pageMap = this.getSetting("pageMap");
    if (!(((_ref = window.location.href) != null ? _ref.length : void 0) > 0)) {
      return nmap;
    }
    myMap = imap;
    for (url in pageMap) {
      map = pageMap[url];
      if (this.isUrlMatched(window.location.href, url)) {
        g.extend(map.imap, myMap);
      }
    }
    this.getIMap = function() {
      return myMap;
    };
    return myMap;
  };
  getCMapFirst = function() {
    var cmap, map, myMap, pageMap, url, _ref;
    cmap = g.object(this.getSetting("keyMappingCommand"));
    pageMap = this.getSetting("pageMap");
    if (!(((_ref = window.location.href) != null ? _ref.length : void 0) > 0)) {
      return nmap;
    }
    myMap = cmap;
    for (url in pageMap) {
      map = pageMap[url];
      if (this.isUrlMatched(window.location.href, url)) {
        g.extend(map.cmap, myMap);
      }
    }
    this.getIMap = function() {
      return myMap;
    };
    return myMap;
  };
  getAliasFirst = function() {
    var aliases, map, myAlias, pageMap, url, _ref;
    aliases = g.object(this.getSetting("aliases"));
    pageMap = this.getSetting("pageMap");
    if (!(((_ref = window.location.href) != null ? _ref.length : void 0) > 0)) {
      return nmap;
    }
    myAlias = aliases;
    for (url in pageMap) {
      map = pageMap[url];
      if (this.isUrlMatched(window.location.href, url)) {
        g.extend(map.alias, myAlias);
      }
    }
    this.getAlias = function() {
      return myAlias;
    };
    return myAlias;
  };
  g.model = {
    initEnabled: false,
    domReady: false,
    disAutoFocus: false,
    searcher: null,
    pmRegister: null,
    curMode: null,
    settings: null,
    changeMode: function(newMode) {
      if (this.curMode != null) {
        this.curMode.exit();
      }
      this.curMode = newMode;
      return this.curMode.enter();
    },
    init: function() {
      this.enterNormalMode();
      this.commandManager = new g.CommandManager;
      return this.pmRegister = new g.PageMarkRegister;
    },
    isReady: function() {
      return this.initEnabled && this.domReady;
    },
    setPageMark: function(key) {
      var mark;
      mark = {
        top: window.pageYOffset,
        left: window.pageXOffset
      };
      return this.pmRegister.set(mark, key);
    },
    goPageMark: function(key) {
      var offset;
      offset = this.pmRegister.get(key);
      if (offset) {
        return g.view.scrollTo(offset.left, offset.top);
      }
    },
    setSearcher: function(searcher) {
      this.searcher = searcher;
    },
    cancelSearchHighlight: function() {
      var _ref;
      return (_ref = this.searcher) != null ? _ref.cancelHighlight() : void 0;
    },
    enterNormalMode: function() {
      g.logger.d("enterNormalMode");
      return this.changeMode(new g.NormalMode);
    },
    enterInsertMode: function() {
      g.logger.d("enterInsertMode");
      return this.changeMode(new g.InsertMode);
    },
    enterCommandMode: function(executer, sources) {
      var mode;
      mode = new g.CommandMode;
      if (executer != null) {
        mode.setExecuter(executer);
      }
      if (sources != null) {
        mode.setSources(sources);
      }
      g.logger.d("enterCommandMode");
      this.cancelSearchHighlight();
      return this.changeMode(mode);
    },
    enterSearchMode: function(backward, searcher_) {
      this.searcher = searcher_ != null ? searcher_ : new g.NormalSearcher;
      g.logger.d("enterSearchMode");
      this.changeMode((new g.SearchMode).init(this.searcher, backward));
      return this.setPageMark();
    },
    enterFMode: function(opt) {
      g.logger.d("enterFMode");
      return this.changeMode((new g.FMode).setOption(opt));
    },
    isInNormalMode: function() {
      return this.curMode.getName() === "NormalMode";
    },
    isInInsertMode: function() {
      return this.curMode.getName() === "InsertMode";
    },
    isInSearchMode: function() {
      return this.curMode.getName() === "SearchMode";
    },
    isInCommandMode: function() {
      return this.curMode.getName() === "CommandMode";
    },
    isInFMode: function() {
      return this.curMode.getName() === "FMode";
    },
    goNextSearchResult: function(reverse) {
      if (this.searcher == null) {
        return;
      }
      this.setPageMark();
      return this.searcher.goNext(reverse);
    },
    getNMap: getNMapFirst,
    getIMap: getIMapFirst,
    getCMap: getCMapFirst,
    getAlias: getAliasFirst,
    getSetting: function(name) {
      return this.settings[name];
    },
    escape: function() {
      this.commandManager.reset();
      g.view.hideStatusLine();
      if (!this.isInNormalMode()) {
        return this.enterNormalMode();
      }
    },
    onBlur: function() {
      return this.curMode.blur();
    },
    prePostKeyEvent: function(key, ctrl, alt, meta) {
      this.disAutoFocus = false;
      return this.curMode.prePostKeyEvent(key, ctrl, alt, meta);
    },
    isValidKeySeq: function(keySeq) {
      if (this.getKeyMapping()[keySeq]) {
        return true;
      } else {
        return false;
      }
    },
    isValidKeySeqAvailable: function(keySeq) {
      var cmpStr, command, keyMapping, length, pos, seq;
      keyMapping = this.getKeyMapping();
      length = keySeq.length;
      for (seq in keyMapping) {
        command = keyMapping[seq];
        cmpStr = seq.slice(0, length);
        pos = cmpStr.indexOf("<", 0);
        if (pos >= 0) {
          pos = seq.indexOf(">", pos);
          if (pos >= length) {
            cmpStr = seq.slice(0, pos + 1);
          }
        }
        if (keySeq === cmpStr) {
          return true;
        }
      }
      return false;
    },
    isUrlMatched: function(url, matchPattern) {
      var regexp, str;
      str = matchPattern.replace(/\*/g, ".*").replace(/\/$/g, "").replace(/\//g, "\\/");
      str = "^" + str + "$";
      url = url.replace(/\/$/g, "");
      regexp = new RegExp(str, "m");
      if (regexp.test(url)) {
        g.logger.d("URL pattern matched:" + url + ":" + matchPattern);
        return true;
      }
      return false;
    },
    isEnabled: function() {
      var url, urls, _i, _len;
      urls = this.getSetting("ignoredUrls");
      for (_i = 0, _len = urls.length; _i < _len; _i++) {
        url = urls[_i];
        if (this.isUrlMatched(window.location.href, url)) {
          g.logger.d("matched ignored list");
          return false;
        }
      }
      return true;
    },
    handleKey: function(msg) {
      return this.commandManager.handleKey(msg, this.getKeyMapping());
    },
    triggerCommand: function(method, args) {
      if (this.curMode[method] != null) {
        return this.curMode[method](args);
      } else {
        return g.logger.e("INVALID command!:", method);
      }
    },
    onSettings: function(msg) {
      if (msg.name === "all") {
        this.settings = msg.value;
      } else {
        this.settings[msg.name] = msg.value;
      }
      if (!this.isEnabled()) {
        this.settings.keyMappingNormal = {};
        this.settings.keyMappingInsert = {};
      }
      switch (msg.name) {
        case "keyMappingNormal":
          return this.getNMap = getNMapFirst;
        case "keyMappingInsert":
          return this.getIMap = getIMapFirst;
        case "keyMappingCommand":
          return this.getCMap = getCMapFirst;
        case "aliases":
          return this.getAlias = getAliasFirst;
      }
    },
    onFocus: function(target) {
      if (this.isInCommandMode() || this.isInSearchMode()) {
        g.logger.d("onFocus:current mode is command or search.do nothing");
        return;
      }
      if (this.disAutoFocus) {
        setTimeout((__bind(function() {
          return this.disAutoFocus = false;
        }, this)), 500);
        this.enterNormalMode();
        return g.view.blurActiveElement();
      } else {
        if (g.util.isEditable(target)) {
          return this.enterInsertMode();
        } else {
          return this.enterNormalMode();
        }
      }
    },
    getKeyMapping: function() {
      return this.curMode.getKeyMapping();
    },
    onInitEnabled: function(msg) {
      g.logger.d("onInitEnabled");
      this.onSettings(msg);
      this.disAutoFocus = this.getSetting("disableAutoFocus");
      this.init();
      this.initEnabled = true;
      if (this.domReady) {
        return this.onDomReady();
      }
    },
    onDomReady: function() {
      g.logger.d("onDomReady");
      this.domReady = true;
      if (!this.initEnabled) {
        g.logger.w("onDomReady is called before onInitEnabled");
        return;
      }
      g.view.init();
      if (g.util.isEditable(document.activeElement) && !this.disAutoFocus) {
        return this.enterInsertMode();
      } else {
        return this.enterNormalMode();
      }
    }
  };
  $(document).ready(__bind(function() {
    return g.model.onDomReady();
  }, this));
}).call(this);

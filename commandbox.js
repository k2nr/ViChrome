(function() {
  var MyCommandManager, commandFixedListener, frameID, g, onRequest, opt, searchFixedListener, searchUpdatedListener, sender, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  if ((_ref = this.vichrome) == null) {
    this.vichrome = {};
  }
  g = this.vichrome;
  opt = {};
  frameID = void 0;
  g.CommandExecuter.prototype.solveAlias = function(alias) {
    var aliases, command;
    aliases = g.commandBox.getAlias();
    alias = aliases[alias];
    while (alias != null) {
      command = alias;
      alias = aliases[alias];
    }
    return command;
  };
  MyCommandManager = (function() {
    __extends(MyCommandManager, g.CommandManager);
    function MyCommandManager(model, timeout) {
      MyCommandManager.__super__.constructor.call(this, model, timeout, false);
    }
    MyCommandManager.prototype.handleKey = function(msg, keyMap) {
      var args, com, executer, s, _base, _name;
      s = g.KeyManager.getKeyCodeStr(msg);
      com = this.getCommandFromKeySeq(s, keyMap);
      if (!com) {
        if (this.isWaitingNextKey()) {
          event.stopPropagation();
          event.preventDefault();
        }
        return;
      }
      switch (com) {
        case "<NOP>":
          break;
        case "<DISCARD>":
          event.stopPropagation();
          return event.preventDefault();
        default:
          executer = (new g.CommandExecuter).set(com).parse();
          args = executer.getArgs();
          if (typeof (_base = this.model)[_name = "req" + args[0]] === "function") {
            _base[_name](args.slice(1));
          }
          event.stopPropagation();
          return event.preventDefault();
      }
    };
    return MyCommandManager;
  })();
  g.CommandBox = (function() {
    function CommandBox() {
      this.inputListeners = [];
    }
    CommandBox.prototype.init = function(width, align) {
      this.width = width;
      this.align = align;
      this.box = $('div#vichromebox');
      this.input = $('input#vichromeinput');
      this.modeChar = $('div#vichromemodechar');
      this.inputField = $('div#vichromefield');
      this.box.width(this.width).addClass('vichrome-commandbox' + this.align);
      this.input.val("");
      this.commandManager = new MyCommandManager(this, opt.commandWaitTimeOut);
      return this;
    };
    CommandBox.prototype.addInputUpdateListener = function(fn) {
      this.inputListeners.push(fn);
      return this;
    };
    CommandBox.prototype.attachTo = function() {
      $(document.body).append(this.box);
      return this;
    };
    CommandBox.prototype.detachFrom = function() {
      if (this.candidateBox != null) {
        this.candidateBox.stop();
        this.candidateBox.detachFrom();
      }
      this.input.val("");
      $(document).unbind();
      document.removeEventListener("keydown", this.onKeyDown);
      return this;
    };
    CommandBox.prototype.setFixedListener = function(fixedListener) {
      this.fixedListener = fixedListener;
      return this;
    };
    CommandBox.prototype.reqFocusNextCandidate = function(args) {
      return this.nextCandidate();
    };
    CommandBox.prototype.reqFocusPrevCandidate = function(args) {
      return this.prevCandidate();
    };
    CommandBox.prototype.reqEscape = function(args) {
      chrome.extension.sendRequest({
        command: "PassToFrame",
        innerCommand: "Escape"
      });
      return this.detachFrom();
    };
    CommandBox.prototype.handleKey = function(key) {
      event.stopPropagation();
      if (this.value().length === 0 && (key.code === "BS" || key.code === "DEL")) {
        event.preventDefault();
        this.reqEscape();
        return;
      }
      if (key.code === "CR") {
        if (typeof this.fixedListener === "function") {
          this.fixedListener(this.value());
        }
        this.detachFrom();
        return;
      }
      this.commandManager.handleKey(key, this.keyMap);
    };
    CommandBox.prototype.onKeyDown = function(e) {
      var code, key;
      if (g.KeyManager.isOnlyModifier(e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey)) {
        g.logger.d("getHandlableKey:only modefier");
        return;
      }
      code = g.KeyManager.getLocalKeyCode(e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
      if (code == null) {
        g.logger.d("getHandlableKey:cant be handled");
        return;
      }
      key = {
        code: code,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey
      };
      return g.commandBox.handleKey(key);
    };
    CommandBox.prototype.setKeyMap = function(keyMap) {
      this.keyMap = keyMap;
      return this;
    };
    CommandBox.prototype.setAlias = function(aliases) {
      this.aliases = aliases;
      return this;
    };
    CommandBox.prototype.getAlias = function() {
      return this.aliases;
    };
    CommandBox.prototype.setIncremental = function(incremental) {
      this.incremental = incremental;
      return this;
    };
    CommandBox.prototype.show = function(modeChar, input) {
      this.input.attr("value", input);
      this.modeChar.html(modeChar);
      this.box.show();
      this.inputField.show();
      $(document).keyup(__bind(function(e) {
        var listener, val, _i, _len, _ref2;
        val = this.input.val();
        if (this.selectedCand === val) {
          return;
        }
        if (this.bfInput !== val && this.isVisible()) {
          _ref2 = this.inputListeners;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            listener = _ref2[_i];
            listener(val);
          }
        }
        return this.bfInput = val;
      }, this));
      document.addEventListener("keydown", this.onKeyDown, true);
      return this;
    };
    CommandBox.prototype.hide = function() {
      if (this.isVisible()) {
        this.inputField.hide();
        this.input.blur();
      }
      return this;
    };
    CommandBox.prototype.focus = function() {
      var _ref2;
      if ((_ref2 = this.input.get(0)) != null) {
        _ref2.focus();
      }
      return this;
    };
    CommandBox.prototype.isVisible = function() {
      return this.inputField.css('display') !== 'none';
    };
    CommandBox.prototype.value = function(a) {
      if (a != null) {
        return this.input.val(a);
      } else {
        return this.input.val();
      }
    };
    CommandBox.prototype.setCandidateBox = function(candBox) {
      if (!opt.enableCompletion) {
        return this;
      }
      if (this.candidateBox != null) {
        this.candidateBox.stop();
        this.candidateBox.detachFrom();
      }
      this.candidateBox = candBox.init(this.width, this.align);
      this.candidateBox.setCommandBox(this);
      this.candidateBox.attachTo(this.view).show();
      return this;
    };
    CommandBox.prototype.nextCandidate = function() {
      var focused, _ref2;
      if (this.candidateBox != null) {
        focused = this.candidateBox.focusNext();
        if (focused == null) {
          return this;
        }
        this.selectedCand = (_ref2 = focused.value) != null ? _ref2 : focused.str;
        this.value(this.selectedCand);
      }
      return this;
    };
    CommandBox.prototype.prevCandidate = function() {
      var focused, _ref2, _ref3;
      if (this.candidateBox != null) {
        focused = (_ref2 = this.candidateBox) != null ? _ref2.focusPrev() : void 0;
        if (focused == null) {
          return this;
        }
        this.selectedCand = (_ref3 = focused.value) != null ? _ref3 : focused.str;
        this.value(this.selectedCand);
      }
      return this;
    };
    CommandBox.prototype.isValidKeySeq = function(keySeq) {
      if (this.keyMap[keySeq]) {
        return true;
      } else {
        return false;
      }
    };
    CommandBox.prototype.isValidKeySeqAvailable = function(keySeq) {
      var cmpStr, command, length, pos, seq, _ref2;
      length = keySeq.length;
      _ref2 = this.keyMap;
      for (seq in _ref2) {
        command = _ref2[seq];
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
    };
    return CommandBox;
  })();
  g.CandidateBox = (function() {
    CandidateBox.prototype.itemHeight = 22;
    CandidateBox.prototype.winColumns = 20;
    function CandidateBox() {
      this.items = {};
      this.sources = {};
      this.selectedListeners = [];
      this.index = 0;
      this.scrIndex = 0;
    }
    CandidateBox.prototype.init = function(width, align) {
      this.width = width;
      this.align = align;
      this.box = $('<div id="vichromecandbox" />').css('min-width', this.width).addClass('vichrome-candbox' + this.align);
      return this;
    };
    CandidateBox.prototype.show = function() {
      this.box.show();
      return this;
    };
    CandidateBox.prototype.hide = function() {
      this.box.hide();
      return this;
    };
    CandidateBox.prototype.addItem = function(id, item) {
      this.items[id].push(item);
      return this;
    };
    CandidateBox.prototype.getItemCnt = function() {
      var items, result, src, _ref2;
      result = 0;
      _ref2 = this.items;
      for (src in _ref2) {
        items = _ref2[src];
        result += items.length;
      }
      return result;
    };
    CandidateBox.prototype.addSource = function(src) {
      this.sources[src.id] = src;
      this.items[src.id] = [];
      src.addSrcUpdatedListener(__bind(function(items) {
        this.items[src.id] = items;
        return this.update(src.id);
      }, this));
      return this;
    };
    CandidateBox.prototype.attachTo = function() {
      $(document.body).append(this.box);
      return this;
    };
    CandidateBox.prototype.detachFrom = function() {
      this.box.detach();
      return this;
    };
    CandidateBox.prototype.resetItem = function() {
      this.candidates = [];
      return this;
    };
    CandidateBox.prototype.makeItemLine = function(src, id, item) {
      var dscr, line, srcType, text;
      line = $("<div id=\"vichromecanditem\" source=\"" + src + "\" num=\"" + id + "\" />");
      text = $("<div id=\"vichromecandtext\" class=\"vichrome-candstr\" />").html(item.str);
      dscr = $("<div id=\"vichromecandtext\" class=\"vichrome-canddscr\" />").html(item.dscr);
      srcType = $("<div id=\"vichromecandtext\" class=\"vichrome-canddscr\" />").html(item.source);
      line.append(text).append(srcType).append(dscr);
      if (item.value != null) {
        line.attr("value", item.value);
      }
      return line;
    };
    CandidateBox.prototype.update = function(id) {
      var i, item, _len, _ref2;
      $('#vichromecanditem' + ("[source=" + id + "]")).remove();
      _ref2 = this.items[id];
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        item = _ref2[i];
        this.box.append(this.makeItemLine(id, i, item));
      }
      return this;
    };
    CandidateBox.prototype.getItem = function(id, num) {
      return this.items[id][num];
    };
    CandidateBox.prototype.scrollTo = function(scrIndex) {
      this.scrIndex = scrIndex;
      return this.box.get(0).scrollTop = this.itemHeight * this.scrIndex;
    };
    CandidateBox.prototype.scrollDown = function() {
      if (this.index >= this.scrIndex + this.winColumns) {
        return this.scrollTo(this.scrIndex + 1);
      } else if (this.index < this.scrIndex) {
        return this.scrollTo(this.index);
      }
    };
    CandidateBox.prototype.scrollUp = function() {
      if (this.index >= this.scrIndex + this.winColumns) {
        return this.scrollTo(this.getItemCnt() - this.winColumns);
      } else if (this.index < this.scrIndex) {
        return this.scrollTo(this.index);
      }
    };
    CandidateBox.prototype.getFocusedValue = function() {
      return this.focusedValue;
    };
    CandidateBox.prototype.setFocusedValue = function(focusedValue) {
      this.focusedValue = focusedValue;
    };
    CandidateBox.prototype.scrollTop = function() {
      return this.scrollTo(0);
    };
    CandidateBox.prototype.scrollBottom = function() {
      this.scrIndex = 0;
      return this.box.get(0).scrollTop = 0;
    };
    CandidateBox.prototype.removeFocus = function($focused) {
      $focused.removeClass("vichrome-canditemfocused");
      return $focused.children().removeClass("vichrome-canditemfocused");
    };
    CandidateBox.prototype.setFocus = function($settee) {
      var val;
      $settee.addClass("vichrome-canditemfocused");
      $settee.children().addClass("vichrome-canditemfocused");
      if ((val = $settee.attr("value"))) {
        return this.setFocusedValue(val);
      }
    };
    CandidateBox.prototype.focusNext = function() {
      var $focused, $next;
      if (!(this.getItemCnt() > 0)) {
        return null;
      }
      $focused = $("#vichromecanditem.vichrome-canditemfocused");
      this.removeFocus($focused);
      $next = $focused.next();
      this.index++;
      if ($next.attr("id") !== "vichromecanditem") {
        this.index = 0;
        $next = $("#vichromecanditem:first-child").first();
      }
      this.scrollDown();
      this.setFocus($next);
      return this.getItem($next.attr("source"), parseInt($next.attr("num")));
    };
    CandidateBox.prototype.focusPrev = function() {
      var $focused, $next;
      if (!(this.getItemCnt() > 0)) {
        return null;
      }
      $focused = $("#vichromecanditem.vichrome-canditemfocused");
      this.removeFocus($focused);
      $next = $focused.prev();
      this.index--;
      if ($next.attr("id") !== "vichromecanditem") {
        $next = $("#vichromecanditem:last-child").last();
        this.index = this.getItemCnt() - 1;
      }
      this.scrollUp();
      this.setFocus($next);
      return this.getItem($next.attr("source"), parseInt($next.attr("num")));
    };
    CandidateBox.prototype.getFocused = function() {
      var $focused;
      $focused = $("#vichromecanditem.vichrome-canditemfocused");
      return this.getItem($focused.attr("source"), parseInt($focused.attr("num")));
    };
    CandidateBox.prototype.onInput = function(word) {
      var id, src, _ref2;
      if (this.stopped) {
        return;
      }
      _ref2 = this.sources;
      for (id in _ref2) {
        src = _ref2[id];
        src.cbInputUpdated(word);
      }
    };
    CandidateBox.prototype.setCommandBox = function(box) {
      box.addInputUpdateListener(__bind(function(word) {
        return this.onInput(word);
      }, this));
      return this;
    };
    CandidateBox.prototype.stop = function() {
      return this.stopped = true;
    };
    return CandidateBox;
  })();
  g.CandidateSource = (function() {
    function CandidateSource(maxItems) {
      this.maxItems = maxItems != null ? maxItems : 5;
      this.updatedListeners = [];
      this.items = [];
    }
    CandidateSource.prototype.requirePrefix = function(reqPrefix) {
      this.reqPrefix = reqPrefix;
      return this;
    };
    CandidateSource.prototype.addSrcUpdatedListener = function(listener) {
      this.updatedListeners.push(listener);
      return this;
    };
    CandidateSource.prototype.addItem = function(item) {
      if (this.items.length < this.maxItems || this.maxItems < 0) {
        this.items.push(item);
      }
      return this;
    };
    CandidateSource.prototype.resetItem = function() {
      this.items = [];
      return this;
    };
    CandidateSource.prototype.notifyUpdated = function() {
      var listener, _i, _len, _ref2;
      _ref2 = this.updatedListeners;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        listener = _ref2[_i];
        listener(this.items);
      }
      return this;
    };
    CandidateSource.prototype.cbInputUpdated = function(word) {
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      if ((this.prefix != null) && word.charAt(1) === " " && word.charAt(0) !== this.prefix) {
        g.logger.d("different prefix:" + this.prefix);
        this.resetItem();
        this.notifyUpdated();
        return;
      }
      if (this.reqPrefix && (this.prefix != null)) {
        if (word.length < 2 || word.charAt(1) !== " " || word.charAt(0) !== this.prefix) {
          this.resetItem();
          this.notifyUpdated();
          return;
        } else {
          word = word.slice(2);
        }
      }
      return this.timer = setTimeout(__bind(function() {
        this.timer = null;
        return typeof this.onInput === "function" ? this.onInput(word) : void 0;
      }, this), 50);
    };
    return CandidateSource;
  })();
  g.CandSourceCommand = (function() {
    __extends(CandSourceCommand, g.CandidateSource);
    CandSourceCommand.prototype.id = "Command";
    function CandSourceCommand(maxItems) {
      this.maxItems = maxItems != null ? maxItems : -1;
      CandSourceCommand.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetCommandTable"
      }, __bind(function(msg) {
        return this.commands = msg;
      }, this));
    }
    CandSourceCommand.prototype.onInput = function(word) {
      var com, _i, _len, _ref2;
      if (!(word.length > 0)) {
        return;
      }
      if (this.commands == null) {
        return;
      }
      this.resetItem();
      word = word.toUpperCase();
      _ref2 = this.commands;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        com = _ref2[_i];
        if (com.toUpperCase().slice(0, word.length) === word) {
          this.addItem({
            str: com,
            source: "Command",
            dscr: ""
          });
        }
      }
      return this.notifyUpdated();
    };
    return CandSourceCommand;
  })();
  g.CandSourceAlias = (function() {
    __extends(CandSourceAlias, g.CandidateSource);
    CandSourceAlias.prototype.id = "Alias";
    function CandSourceAlias(maxItems) {
      this.maxItems = maxItems != null ? maxItems : -1;
      CandSourceAlias.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetAliases"
      }, __bind(function(msg) {
        return this.aliases = msg;
      }, this));
    }
    CandSourceAlias.prototype.onInput = function(word) {
      var alias, com, _ref2;
      if (!(word.length > 0)) {
        return;
      }
      if (this.aliases == null) {
        return;
      }
      this.resetItem();
      word = word.toUpperCase();
      _ref2 = this.aliases;
      for (alias in _ref2) {
        com = _ref2[alias];
        if (alias.toUpperCase().slice(0, word.length) === word) {
          this.addItem({
            str: alias,
            source: "Alias",
            dscr: com
          });
        }
      }
      return this.notifyUpdated();
    };
    return CandSourceAlias;
  })();
  g.CandSourceHistory = (function() {
    __extends(CandSourceHistory, g.CandidateSource);
    function CandSourceHistory() {
      CandSourceHistory.__super__.constructor.apply(this, arguments);
    }
    CandSourceHistory.prototype.id = "WebHistory";
    CandSourceHistory.prototype.prefix = "h";
    CandSourceHistory.prototype.onInput = function(word) {
      if (!(word.length > 0)) {
        return;
      }
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetHistory",
        value: word
      }, __bind(function(items) {
        var item, str, _i, _len;
        if (items == null) {
          this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          str = item.title ? item.title : item.url;
          this.addItem({
            str: str,
            source: "History",
            dscr: item.url,
            value: item.url
          });
        }
        return this.notifyUpdated();
      }, this));
    };
    return CandSourceHistory;
  })();
  g.CandSourceBookmark = (function() {
    __extends(CandSourceBookmark, g.CandidateSource);
    function CandSourceBookmark() {
      CandSourceBookmark.__super__.constructor.apply(this, arguments);
    }
    CandSourceBookmark.prototype.id = "Bookmark";
    CandSourceBookmark.prototype.prefix = "b";
    CandSourceBookmark.prototype.onInput = function(word) {
      if (!(word.length > 0)) {
        return;
      }
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetBookmark",
        value: word
      }, __bind(function(nodes) {
        var node, _i, _len;
        if (nodes == null) {
          this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          this.addItem({
            str: node.title,
            source: "Bookmark",
            dscr: node.url,
            value: node.url
          });
        }
        return this.notifyUpdated();
      }, this));
    };
    return CandSourceBookmark;
  })();
  g.CandSourceSearchHist = (function() {
    __extends(CandSourceSearchHist, g.CandidateSource);
    CandSourceSearchHist.prototype.id = "SearchHistory";
    function CandSourceSearchHist(maxItems) {
      this.maxItems = maxItems;
      CandSourceSearchHist.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetSearchHistory"
      }, __bind(function(msg) {
        return this.history = msg.value.reverse();
      }, this));
    }
    CandSourceSearchHist.prototype.onInput = function(word) {
      var hist, _i, _len, _ref2;
      if (this.history == null) {
        return;
      }
      this.resetItem();
      word = word.toUpperCase();
      _ref2 = this.history;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        hist = _ref2[_i];
        if (hist.toUpperCase().slice(0, word.length) === word) {
          this.addItem({
            str: hist,
            source: "Search History",
            dscr: ""
          });
        }
      }
      return this.notifyUpdated();
    };
    return CandSourceSearchHist;
  })();
  g.CandSourceGoogleSuggest = (function() {
    __extends(CandSourceGoogleSuggest, g.CandidateSource);
    function CandSourceGoogleSuggest() {
      CandSourceGoogleSuggest.__super__.constructor.apply(this, arguments);
    }
    CandSourceGoogleSuggest.prototype.id = "GoogleSuggest";
    CandSourceGoogleSuggest.prototype.prefix = "g";
    CandSourceGoogleSuggest.prototype.onInput = function(word) {
      if (!(word.length > 0)) {
        return;
      }
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetGoogleSuggest",
        value: word
      }, __bind(function(raws) {
        var raw, value, _i, _len;
        if (raws == null) {
          this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = raws.length; _i < _len; _i++) {
          raw = raws[_i];
          value = this.reqPrefix ? "g " + raw : raw;
          this.addItem({
            str: raw,
            source: "Google Search",
            dscr: "",
            value: value
          });
        }
        return this.notifyUpdated();
      }, this));
    };
    return CandSourceGoogleSuggest;
  })();
  g.CandSourceWebSuggest = (function() {
    __extends(CandSourceWebSuggest, g.CandidateSource);
    function CandSourceWebSuggest() {
      CandSourceWebSuggest.__super__.constructor.apply(this, arguments);
    }
    CandSourceWebSuggest.prototype.id = "WebSuggest";
    CandSourceWebSuggest.prototype.prefix = "w";
    CandSourceWebSuggest.prototype.onInput = function(word) {
      if (!(word.length > 0)) {
        return;
      }
      this.resetItem();
      if (word.charAt(1) === " " && word.charAt(0) !== "w") {
        this.notifyUpdated();
        return;
      }
      return chrome.extension.sendRequest({
        command: "GetWebSuggest",
        value: word
      }, __bind(function(results) {
        var res, _i, _len;
        if (results == null) {
          this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          res = results[_i];
          this.addItem({
            str: res.titleNoFormatting,
            source: "Web",
            dscr: res.unescapedUrl,
            value: res.url
          });
        }
        return this.notifyUpdated();
      }, this));
    };
    return CandSourceWebSuggest;
  })();
  g.CandSourceTabs = (function() {
    __extends(CandSourceTabs, g.CandidateSource);
    CandSourceTabs.prototype.id = "Tabs";
    function CandSourceTabs(maxItems) {
      this.maxItems = maxItems != null ? maxItems : -1;
      chrome.extension.sendRequest({
        command: "GetTabList"
      }, __bind(function(tabs) {
        this.tabs = tabs;
      }, this));
      CandSourceTabs.__super__.constructor.call(this, this.maxItems);
    }
    CandSourceTabs.prototype.onInput = function(word) {
      var a, tab, _i, _len, _ref2;
      if (this.tabs == null) {
        return;
      }
      this.resetItem();
      word = word.toUpperCase();
      _ref2 = this.tabs;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        tab = _ref2[_i];
        a = tab.title.toUpperCase();
        if (tab.title.toUpperCase().indexOf(word) >= 0) {
          this.addItem({
            str: tab.title,
            source: "",
            dscr: "index:" + (tab.index + 1),
            value: "" + (tab.index + 1)
          });
        }
      }
      return this.notifyUpdated();
    };
    return CandSourceTabs;
  })();
  sender = 0;
  searchFixedListener = function(word) {
    return chrome.extension.sendRequest({
      command: "PassToFrame",
      innerCommand: "NotifySearchFixed",
      word: word,
      frameID: sender
    });
  };
  searchUpdatedListener = function(word) {
    return chrome.extension.sendRequest({
      command: "PassToFrame",
      innerCommand: "NotifyInputUpdated",
      word: word,
      frameID: sender
    });
  };
  commandFixedListener = function(word) {
    return chrome.extension.sendRequest({
      command: "PassToFrame",
      innerCommand: "ExecuteCommand",
      commandLine: word,
      frameID: sender
    });
  };
  onRequest = function(req) {
    var candBox, obj, reqPrefix, src, _i, _j, _len, _len2, _ref2, _ref3, _ref4, _ref5;
    switch (req.command) {
      case "GoCommandMode":
        sender = req.sender;
        window.focus();
        candBox = new g.CandidateBox;
        _ref2 = req.sources;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          src = _ref2[_i];
          reqPrefix = (_ref3 = src.reqPrefix) != null ? _ref3 : false;
          obj = (new g[src["class"]](src.num)).requirePrefix(reqPrefix);
          candBox.addSource(obj);
        }
        if (g.commandBox != null) {
          g.commandBox.detachFrom();
        }
        return g.commandBox = (new g.CommandBox).init(opt.commandBoxWidth, opt.commandBoxAlign).attachTo().show(req.modeChar).focus().setKeyMap(req.keyMap).setAlias(req.aliases).setFixedListener(commandFixedListener).setCandidateBox(candBox);
      case "GoSearchMode":
        sender = req.sender;
        window.focus();
        candBox = new g.CandidateBox;
        _ref4 = req.sources;
        for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
          src = _ref4[_j];
          reqPrefix = (_ref5 = src.reqPrefix) != null ? _ref5 : false;
          obj = (new g[src["class"]](src.num)).requirePrefix(reqPrefix);
          candBox.addSource(obj);
        }
        if (g.commandBox != null) {
          g.commandBox.detachFrom();
        }
        return g.commandBox = (new g.CommandBox).init(opt.commandBoxWidth, opt.commandBoxAlign).attachTo().show(req.modeChar).focus().setIncremental(req.incSearch).setKeyMap(req.keyMap).setAlias(req.aliases).addInputUpdateListener(searchUpdatedListener).setFixedListener(searchFixedListener).setCandidateBox(candBox);
    }
  };
  $(document).ready(function() {
    chrome.extension.sendRequest({
      command: "InitCommandFrame"
    }, function(msg) {
      frameID = msg.frameID;
      opt.enableCompletion = msg.enableCompletion;
      opt.commandBoxWidth = msg.commandBoxWidth;
      opt.commandBoxAlign = msg.commandBoxAlign;
      return opt.commandWaitTimeOut = msg.commandWaitTimeOut;
    });
    return chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      if (!((req.frameID != null) && req.frameID === frameID)) {
        g.logger.d("onRequest: different frameID");
        sendResponse();
        return;
      }
      return onRequest(req);
    });
  });
}).call(this);

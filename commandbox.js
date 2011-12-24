(function() {
  var MyCommandManager, commandFixedListener, frameID, g, onRequest, opt, searchFixedListener, searchUpdatedListener, sender,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (this.vichrome == null) this.vichrome = {};

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

  MyCommandManager = (function(_super) {

    __extends(MyCommandManager, _super);

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

  })(g.CommandManager);

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
      this.input.width(this.width - this.modeChar.width() - 5).val("");
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
      var _this = this;
      if (input == null) input = "";
      this.input.attr("value", input);
      this.modeChar.html(modeChar);
      this.bfInput = input;
      this.box.show();
      this.inputField.show();
      $(document).keyup(function(e) {
        var listener, val, _i, _len, _ref;
        val = _this.input.val();
        if (_this.selectedCand === val) return;
        if (_this.bfInput !== val && _this.isVisible()) {
          _ref = _this.inputListeners;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            listener = _ref[_i];
            listener(val);
          }
        }
        return _this.bfInput = val;
      });
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
      var _ref;
      if ((_ref = this.input.get(0)) != null) _ref.focus();
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
      if (!opt.enableCompletion) return this;
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
      var focused, _ref;
      if (this.candidateBox != null) {
        focused = this.candidateBox.focusNext();
        if (focused == null) return this;
        this.selectedCand = (_ref = focused.value) != null ? _ref : focused.str;
        this.value(this.selectedCand);
      }
      return this;
    };

    CommandBox.prototype.prevCandidate = function() {
      var focused, _ref, _ref2;
      if (this.candidateBox != null) {
        focused = (_ref = this.candidateBox) != null ? _ref.focusPrev() : void 0;
        if (focused == null) return this;
        this.selectedCand = (_ref2 = focused.value) != null ? _ref2 : focused.str;
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
      var cmpStr, command, length, pos, seq, _ref;
      length = keySeq.length;
      _ref = this.keyMap;
      for (seq in _ref) {
        command = _ref[seq];
        cmpStr = seq.slice(0, length);
        pos = cmpStr.indexOf("<", 0);
        if (pos >= 0) {
          pos = seq.indexOf(">", pos);
          if (pos >= length) cmpStr = seq.slice(0, pos + 1);
        }
        if (keySeq === cmpStr) return true;
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
      var items, result, src, _ref;
      result = 0;
      _ref = this.items;
      for (src in _ref) {
        items = _ref[src];
        result += items.length;
      }
      return result;
    };

    CandidateBox.prototype.addSource = function(src) {
      var _this = this;
      this.sources[src.id] = src;
      this.items[src.id] = [];
      src.addSrcUpdatedListener(function(items) {
        _this.items[src.id] = items;
        return _this.update(src.id);
      });
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
      if (item.value != null) line.attr("value", item.value);
      return line;
    };

    CandidateBox.prototype.update = function(id) {
      var i, item, _len, _ref;
      $('#vichromecanditem' + ("[source=" + id + "]")).remove();
      _ref = this.items[id];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        item = _ref[i];
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
      if ((val = $settee.attr("value"))) return this.setFocusedValue(val);
    };

    CandidateBox.prototype.focusNext = function() {
      var $focused, $next;
      if (!(this.getItemCnt() > 0)) return null;
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
      if (!(this.getItemCnt() > 0)) return null;
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
      var id, src, _ref;
      if (this.stopped) return;
      _ref = this.sources;
      for (id in _ref) {
        src = _ref[id];
        src.cbInputUpdated(word);
      }
    };

    CandidateBox.prototype.setCommandBox = function(box) {
      var _this = this;
      box.addInputUpdateListener(function(word) {
        return _this.onInput(word);
      });
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
      var listener, _i, _len, _ref;
      _ref = this.updatedListeners;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener(this.items);
      }
      return this;
    };

    CandidateSource.prototype.cbInputUpdated = function(word) {
      var _this = this;
      if (this.timer != null) clearTimeout(this.timer);
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
      return this.timer = setTimeout(function() {
        _this.timer = null;
        return typeof _this.onInput === "function" ? _this.onInput(word) : void 0;
      }, 150);
    };

    return CandidateSource;

  })();

  g.CandSourceCommand = (function(_super) {

    __extends(CandSourceCommand, _super);

    CandSourceCommand.prototype.id = "Command";

    function CandSourceCommand(maxItems) {
      var _this = this;
      this.maxItems = maxItems != null ? maxItems : -1;
      CandSourceCommand.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetCommandTable"
      }, function(msg) {
        return _this.commands = msg;
      });
    }

    CandSourceCommand.prototype.onInput = function(word) {
      var com, _i, _len, _ref;
      if (!(word.length > 0)) return;
      if (this.commands == null) return;
      this.resetItem();
      word = word.toUpperCase();
      _ref = this.commands;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        com = _ref[_i];
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

  })(g.CandidateSource);

  g.CandSourceAlias = (function(_super) {

    __extends(CandSourceAlias, _super);

    CandSourceAlias.prototype.id = "Alias";

    function CandSourceAlias(maxItems) {
      var _this = this;
      this.maxItems = maxItems != null ? maxItems : -1;
      CandSourceAlias.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetAliases"
      }, function(msg) {
        return _this.aliases = msg;
      });
    }

    CandSourceAlias.prototype.onInput = function(word) {
      var alias, com, _ref;
      if (!(word.length > 0)) return;
      if (this.aliases == null) return;
      this.resetItem();
      word = word.toUpperCase();
      _ref = this.aliases;
      for (alias in _ref) {
        com = _ref[alias];
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

  })(g.CandidateSource);

  g.CandSourceHistory = (function(_super) {

    __extends(CandSourceHistory, _super);

    function CandSourceHistory() {
      CandSourceHistory.__super__.constructor.apply(this, arguments);
    }

    CandSourceHistory.prototype.id = "WebHistory";

    CandSourceHistory.prototype.prefix = "h";

    CandSourceHistory.prototype.onInput = function(word) {
      var _this = this;
      if (!(word.length > 0)) return;
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetHistory",
        value: word
      }, function(items) {
        var item, str, _i, _len;
        if (items == null) {
          _this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          str = item.title ? item.title : item.url;
          _this.addItem({
            str: str,
            source: "History",
            dscr: item.url,
            value: item.url
          });
        }
        return _this.notifyUpdated();
      });
    };

    return CandSourceHistory;

  })(g.CandidateSource);

  g.CandSourceBookmark = (function(_super) {

    __extends(CandSourceBookmark, _super);

    function CandSourceBookmark() {
      CandSourceBookmark.__super__.constructor.apply(this, arguments);
    }

    CandSourceBookmark.prototype.id = "Bookmark";

    CandSourceBookmark.prototype.prefix = "b";

    CandSourceBookmark.prototype.onInput = function(word) {
      var _this = this;
      if (!(word.length > 0)) return;
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetBookmark",
        value: word
      }, function(nodes) {
        var node, _i, _len;
        if (nodes == null) {
          _this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          node = nodes[_i];
          _this.addItem({
            str: node.title,
            source: "Bookmark",
            dscr: node.url,
            value: node.url
          });
        }
        return _this.notifyUpdated();
      });
    };

    return CandSourceBookmark;

  })(g.CandidateSource);

  g.CandSourceSearchHist = (function(_super) {

    __extends(CandSourceSearchHist, _super);

    CandSourceSearchHist.prototype.id = "SearchHistory";

    function CandSourceSearchHist(maxItems) {
      var _this = this;
      this.maxItems = maxItems;
      CandSourceSearchHist.__super__.constructor.call(this, this.maxItems);
      chrome.extension.sendRequest({
        command: "GetSearchHistory"
      }, function(msg) {
        _this.history = msg.value.reverse();
        return _this.onInput("");
      });
    }

    CandSourceSearchHist.prototype.onInput = function(word) {
      var hist, _i, _len, _ref;
      if (this.history == null) return;
      this.resetItem();
      word = word.toUpperCase();
      _ref = this.history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hist = _ref[_i];
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

  })(g.CandidateSource);

  g.CandSourceGoogleSuggest = (function(_super) {

    __extends(CandSourceGoogleSuggest, _super);

    function CandSourceGoogleSuggest() {
      CandSourceGoogleSuggest.__super__.constructor.apply(this, arguments);
    }

    CandSourceGoogleSuggest.prototype.id = "GoogleSuggest";

    CandSourceGoogleSuggest.prototype.prefix = "g";

    CandSourceGoogleSuggest.prototype.onInput = function(word) {
      var _this = this;
      if (!(word.length > 0)) return;
      this.resetItem();
      return chrome.extension.sendRequest({
        command: "GetGoogleSuggest",
        value: word
      }, function(raws) {
        var raw, value, _i, _len;
        if (raws == null) {
          _this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = raws.length; _i < _len; _i++) {
          raw = raws[_i];
          value = _this.reqPrefix ? "g " + raw : raw;
          _this.addItem({
            str: raw,
            source: "Google Search",
            dscr: "",
            value: value
          });
        }
        return _this.notifyUpdated();
      });
    };

    return CandSourceGoogleSuggest;

  })(g.CandidateSource);

  g.CandSourceWebSuggest = (function(_super) {

    __extends(CandSourceWebSuggest, _super);

    function CandSourceWebSuggest() {
      CandSourceWebSuggest.__super__.constructor.apply(this, arguments);
    }

    CandSourceWebSuggest.prototype.id = "WebSuggest";

    CandSourceWebSuggest.prototype.prefix = "w";

    CandSourceWebSuggest.prototype.onInput = function(word) {
      var _this = this;
      if (!(word.length > 0)) return;
      this.resetItem();
      if (word.charAt(1) === " " && word.charAt(0) !== "w") {
        this.notifyUpdated();
        return;
      }
      return chrome.extension.sendRequest({
        command: "GetWebSuggest",
        value: word
      }, function(results) {
        var res, _i, _len;
        if (results == null) {
          _this.notifyUpdated();
          return;
        }
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          res = results[_i];
          _this.addItem({
            str: res.titleNoFormatting,
            source: "Web",
            dscr: res.unescapedUrl,
            value: res.url
          });
        }
        return _this.notifyUpdated();
      });
    };

    return CandSourceWebSuggest;

  })(g.CandidateSource);

  g.CandSourceTabs = (function(_super) {

    __extends(CandSourceTabs, _super);

    CandSourceTabs.prototype.id = "Tabs";

    function CandSourceTabs(maxItems) {
      var _this = this;
      this.maxItems = maxItems != null ? maxItems : -1;
      chrome.extension.sendRequest({
        command: "GetTabList"
      }, function(tabs) {
        _this.tabs = tabs;
        return _this.onInput("");
      });
      CandSourceTabs.__super__.constructor.call(this, this.maxItems);
    }

    CandSourceTabs.prototype.onInput = function(word) {
      var a, tab, _i, _len, _ref;
      if (this.tabs == null) return;
      this.resetItem();
      word = word.toUpperCase();
      _ref = this.tabs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tab = _ref[_i];
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

  })(g.CandidateSource);

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
    chrome.extension.sendRequest({
      command: "TopFrame",
      innerCommand: "HideCommandFrame"
    });
    return chrome.extension.sendRequest({
      command: "PassToFrame",
      innerCommand: "ExecuteCommand",
      commandLine: word,
      frameID: sender
    });
  };

  onRequest = function(req) {
    var candBox, obj, reqPrefix, src, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
    switch (req.mode) {
      case "Command":
        sender = req.sender;
        window.focus();
        candBox = new g.CandidateBox;
        _ref = req.sources;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          src = _ref[_i];
          reqPrefix = (_ref2 = src.reqPrefix) != null ? _ref2 : false;
          obj = (new g[src["class"]](src.num)).requirePrefix(reqPrefix);
          candBox.addSource(obj);
        }
        if (g.commandBox != null) g.commandBox.detachFrom();
        return g.commandBox = (new g.CommandBox).init(opt.commandBoxWidth, opt.commandBoxAlign).attachTo().show(req.modeChar).focus().setKeyMap(req.keyMap).setAlias(req.aliases).setFixedListener(commandFixedListener).setCandidateBox(candBox);
      case "Search":
        sender = req.sender;
        window.focus();
        candBox = new g.CandidateBox;
        _ref3 = req.sources;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          src = _ref3[_j];
          reqPrefix = (_ref4 = src.reqPrefix) != null ? _ref4 : false;
          obj = (new g[src["class"]](src.num)).requirePrefix(reqPrefix);
          candBox.addSource(obj);
        }
        if (g.commandBox != null) g.commandBox.detachFrom();
        g.commandBox = (new g.CommandBox).init(opt.commandBoxWidth, opt.commandBoxAlign).attachTo().show(req.modeChar).focus().setIncremental(req.incSearch).setKeyMap(req.keyMap).setAlias(req.aliases).setFixedListener(searchFixedListener).setCandidateBox(candBox);
        if (req.incSearch) {
          return g.commandBox.addInputUpdateListener(searchUpdatedListener);
        }
    }
  };

  $(document).ready(function() {
    g.logger.d("commandbox ready", this);
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

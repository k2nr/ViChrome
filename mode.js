(function() {
  var g, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  if ((_ref = this.vichrome) == null) {
    this.vichrome = {};
  }
  g = this.vichrome;
  g.Mode = (function() {
    function Mode() {}
    Mode.prototype.exit = function() {};
    Mode.prototype.enter = function() {};
    Mode.prototype.enterInteractiveOpen = function(baseCom, opt) {
      var dscr, executer, sources;
      dscr = baseCom;
      sources = [];
      if (opt.bookmark) {
        dscr += " Bookmark";
        sources.push({
          "class": "CandSourceBookmark"
        });
      }
      if (opt.history) {
        dscr += " History";
        sources.push({
          "class": "CandSourceHistory"
        });
      }
      if (opt.web) {
        dscr += " Web";
        sources.push({
          "class": "CandSourceWebSuggest"
        });
      }
      if (!opt.bookmark && !opt.history && !opt.web) {
        if (opt.search) {
          baseCom += " g";
          dscr += " Google Search";
          sources = [
            {
              "class": "CandSourceGoogleSuggest"
            }
          ];
        } else {
          sources = [
            {
              "class": "CandSourceGoogleSuggest",
              num: 3,
              reqPrefix: true
            }, {
              "class": "CandSourceWebSuggest",
              num: 3
            }, {
              "class": "CandSourceBookmark",
              num: 3
            }, {
              "class": "CandSourceHistory",
              num: 3
            }
          ];
        }
      }
      executer = (new g.CommandExecuter).setDescription(dscr).set(baseCom);
      return g.model.enterCommandMode(executer, sources);
    };
    Mode.prototype.reqOpen = function(args) {
      var arg, bookmark, com, history, interactive, opt, search, url, urls, web, _i, _len;
      urls = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        switch (arg) {
          case "-i":
            interactive = true;
            break;
          case "-b":
            bookmark = true;
            break;
          case "-w":
            web = true;
            break;
          case "-h":
            history = true;
            break;
          case "-g":
          case "g":
            search = true;
            break;
          default:
            urls.push(arg);
        }
      }
      if (interactive || bookmark || history || web) {
        opt = {
          bookmark: bookmark,
          history: history,
          web: web,
          search: search
        };
        com = "Open" + urls.join(' ');
        return this.enterInteractiveOpen(com, opt);
      } else if (search) {
        url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + urls.join('+') + "&qscrl=1";
        return g.view.open(url, "_self");
      } else {
        return g.view.open(urls[0], "_self");
      }
    };
    Mode.prototype.reqOpenNewTab = function(args) {
      var arg, bookmark, com, history, interactive, opt, search, url, urls, web, words, _i, _len;
      words = [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        switch (arg) {
          case "-i":
            interactive = true;
            break;
          case "-b":
            bookmark = true;
            break;
          case "-w":
            web = true;
            break;
          case "-h":
            history = true;
            break;
          case "-g":
          case "g":
            search = true;
            break;
          default:
            words.push(arg);
        }
      }
      if (interactive || bookmark || history || web) {
        opt = {
          bookmark: bookmark,
          history: history,
          web: web,
          search: search
        };
        com = "OpenNewTab " + words.join(' ');
        return this.enterInteractiveOpen(com, opt);
      } else if (search) {
        url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + words.join('+') + "&qscrl=1";
        urls = [];
        urls.push(url);
        return chrome.extension.sendRequest({
          command: "OpenNewTab",
          args: urls
        }, g.handler.onCommandResponse);
      } else {
        return chrome.extension.sendRequest({
          command: "OpenNewTab",
          args: words
        }, g.handler.onCommandResponse);
      }
    };
    Mode.prototype.blur = function() {};
    Mode.prototype.reqScrollDown = function() {
      return g.view.scrollBy(0, g.model.getSetting("scrollPixelCount"));
    };
    Mode.prototype.reqScrollUp = function() {
      return g.view.scrollBy(0, -g.model.getSetting("scrollPixelCount"));
    };
    Mode.prototype.reqScrollLeft = function() {
      return g.view.scrollBy(-g.model.getSetting("scrollPixelCount", 0));
    };
    Mode.prototype.reqScrollRight = function() {
      return g.view.scrollBy(g.model.getSetting("scrollPixelCount", 0));
    };
    Mode.prototype.reqPageHalfDown = function() {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: 1
      });
    };
    Mode.prototype.reqPageHalfUp = function() {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: -1
      });
    };
    Mode.prototype.reqPageDown = function() {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: 2
      });
    };
    Mode.prototype.reqPageUp = function() {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: -2
      });
    };
    Mode.prototype.reqGoTop = function() {
      g.model.setPageMark();
      return g.view.goTop();
    };
    Mode.prototype.reqGoBottom = function() {
      g.model.setPageMark();
      return g.view.goBottom();
    };
    Mode.prototype.reqBackHist = function() {
      return g.view.backHist();
    };
    Mode.prototype.reqForwardHist = function() {
      return g.view.forwardHist();
    };
    Mode.prototype.reqReloadTab = function() {
      return g.view.reload();
    };
    Mode.prototype.reqGoSearchModeForward = function() {
      return g.model.enterSearchMode(false);
    };
    Mode.prototype.reqGoSearchModeBackward = function() {
      return g.model.enterSearchMode(true);
    };
    Mode.prototype.reqGoLinkTextSearchMode = function() {
      return g.model.enterSearchMode(false, new g.LinkTextSearcher);
    };
    Mode.prototype.reqBackToPageMark = function() {
      return g.model.goPageMark();
    };
    Mode.prototype.reqEscape = function() {
      g.view.blurActiveElement();
      g.model.escape();
      return typeof this.escape === "function" ? this.escape() : void 0;
    };
    Mode.prototype.reqGoFMode = function(args) {
      var arg, continuous, newTab, opt, _i, _len;
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        switch (arg) {
          case "--newtab":
            newTab = true;
            break;
          case "--continuous":
            continuous = true;
        }
      }
      opt = {
        newTab: newTab,
        continuous: continuous
      };
      return g.model.enterFMode(opt);
    };
    Mode.prototype.reqGoCommandMode = function(args, sender) {
      var executer, sources;
      sources = [
        {
          "class": "CandSourceCommand"
        }, {
          "class": "CandSourceAlias"
        }
      ];
      executer = (new g.CommandExecuter).setTargetFrame(sender);
      return g.model.enterCommandMode(executer, sources);
    };
    Mode.prototype.reqFocusOnFirstInput = function() {
      g.model.setPageMark();
      return g.view.focusInput(0);
    };
    Mode.prototype.reqShowTabList = function() {
      var executer, sources;
      sources = [
        {
          "class": "CandSourceTabs"
        }
      ];
      executer = (new g.CommandExecuter).set("MoveToNextTab").setDescription("TabList");
      return g.model.enterCommandMode(executer, sources);
    };
    Mode.prototype.req_ChangeLogLevel = function(args) {
      if (!args || args.length < 1) {
        return;
      }
      if (g.logLevels[args[0]] != null) {
        return g.LOG_LEVEL = g.logLevels[args[0]];
      } else {
        return g.view.setStatusLineText("log level '" + args[0] + "' doesn't exist", 2000);
      }
    };
    Mode.prototype.getKeyMapping = function() {
      return g.model.getNMap();
    };
    return Mode;
  })();
  g.NormalMode = (function() {
    __extends(NormalMode, g.Mode);
    function NormalMode() {
      NormalMode.__super__.constructor.apply(this, arguments);
    }
    NormalMode.prototype.getName = function() {
      return "NormalMode";
    };
    NormalMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      return true;
    };
    NormalMode.prototype.escape = function() {
      return g.model.cancelSearchHighlight();
    };
    NormalMode.prototype.enter = function() {};
    NormalMode.prototype.reqNextSearch = function() {
      return g.model.goNextSearchResult(false);
    };
    NormalMode.prototype.reqPrevSearch = function() {
      return g.model.goNextSearchResult(true);
    };
    return NormalMode;
  })();
  g.InsertMode = (function() {
    __extends(InsertMode, g.Mode);
    function InsertMode() {
      InsertMode.__super__.constructor.apply(this, arguments);
    }
    InsertMode.prototype.getName = function() {
      return "InsertMode";
    };
    InsertMode.prototype.blur = function() {
      return g.model.enterNormalMode();
    };
    InsertMode.prototype.getKeyMapping = function() {
      return g.model.getIMap();
    };
    InsertMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      if (ctrl || alt || meta) {
        return true;
      }
      if (g.KeyManager.isNumber(key) || g.KeyManager.isAlphabet(key)) {
        return false;
      }
      return true;
    };
    return InsertMode;
  })();
  g.SearchMode = (function() {
    __extends(SearchMode, g.Mode);
    function SearchMode() {
      SearchMode.__super__.constructor.apply(this, arguments);
    }
    SearchMode.prototype.getName = function() {
      return "SearchMode";
    };
    SearchMode.prototype.init = function(searcher_, backward_, opt_) {
      this.opt = opt_ != null ? opt_ : {
        wrap: g.model.getSetting("wrapSearch"),
        ignoreCase: g.model.getSetting("ignoreCase"),
        incSearch: g.model.getSetting("incSearch"),
        useMigemo: g.model.getSetting("useMigemo"),
        minIncSearch: g.model.getSetting("minIncSearch"),
        minMigemoLength: g.model.getSetting("minMigemoLength"),
        backward: backward_
      };
      this.searcher = searcher_.init(this.opt);
      this.backward = backward_;
      return this;
    };
    SearchMode.prototype.cancelSearch = function() {
      g.model.goPageMark();
      this.searcher.finalize();
      return g.model.enterNormalMode();
    };
    SearchMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {};
    SearchMode.prototype.escape = function() {
      return this.cancelSearch();
    };
    SearchMode.prototype.enter = function() {
      var msg, sources;
      sources = [
        {
          "class": "CandSourceSearchHist"
        }
      ];
      msg = {};
      msg.command = "SendToCommandBox";
      msg.innerCommand = "GoSearchMode";
      msg.sources = sources;
      msg.sender = g.model.frameID;
      msg.modeChar = this.backward === true ? "?" : "/";
      msg.keyMap = g.extendDeep(this.getKeyMapping());
      msg.aliases = g.extendDeep(g.model.getAlias());
      msg.incSearch = this.opt.incSearch;
      chrome.extension.sendRequest(msg);
      g.view.showCommandFrame();
      return g.view.setStatusLineText("");
    };
    SearchMode.prototype.exit = function() {
      return g.view.hideCommandFrame();
    };
    SearchMode.prototype.notifyInputUpdated = function(msg) {
      return this.searcher.updateInput(msg.word);
    };
    SearchMode.prototype.notifySearchFixed = function(msg) {
      this.searcher.fix(msg.word);
      g.model.setSearcher(this.searcher);
      return g.model.enterNormalMode();
    };
    SearchMode.prototype.getKeyMapping = function() {
      return g.model.getCMap();
    };
    return SearchMode;
  })();
  g.CommandMode = (function() {
    __extends(CommandMode, g.Mode);
    function CommandMode() {
      CommandMode.__super__.constructor.apply(this, arguments);
    }
    CommandMode.prototype.getName = function() {
      return "CommandMode";
    };
    CommandMode.prototype.reqExecuteCommand = function(req) {
      try {
        this.executer.set(req.commandLine).parse().execute();
        g.view.hideStatusLine();
      } catch (e) {
        g.view.setStatusLineText("Command Not Found : " + this.executer.get(), 2000);
      }
      return g.model.enterNormalMode();
    };
    CommandMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      return true;
    };
    CommandMode.prototype.enter = function() {
      var msg;
      if (this.executer != null) {
        if (this.executer.getDescription() != null) {
          g.view.setStatusLineText(this.executer.getDescription());
        } else {
          g.view.setStatusLineText(this.executer.get());
        }
      } else {
        g.view.setStatusLineText("");
      }
      msg = {};
      msg.command = "SendToCommandBox";
      msg.innerCommand = "GoCommandMode";
      msg.sources = this.sources;
      msg.sender = g.model.frameID;
      msg.modeChar = ':';
      msg.keyMap = g.extendDeep(this.getKeyMapping());
      msg.aliases = g.extendDeep(g.model.getAlias());
      chrome.extension.sendRequest(msg);
      return g.view.showCommandFrame();
    };
    CommandMode.prototype.exit = function() {
      return g.view.hideCommandFrame();
    };
    CommandMode.prototype.getKeyMapping = function() {
      return g.model.getCMap();
    };
    CommandMode.prototype.setExecuter = function(executer) {
      this.executer = executer;
    };
    CommandMode.prototype.setSources = function(sources) {
      this.sources = sources;
    };
    return CommandMode;
  })();
  g.FMode = (function() {
    __extends(FMode, g.Mode);
    function FMode() {
      FMode.__super__.constructor.apply(this, arguments);
    }
    FMode.prototype.getName = function() {
      return "FMode";
    };
    FMode.prototype.setOption = function(opt) {
      this.opt = opt;
      return this;
    };
    FMode.prototype.hit = function(i) {
      var primary, target;
      primary = false;
      target = $(this.hints[i].target);
      if (target.is('a')) {
        primary = this.opt.newTab;
        if (!this.opt.continuous) {
          g.model.enterNormalMode();
        }
      } else {
        target.focus();
        if (g.util.isEditable(target.get(0))) {
          g.model.enterInsertMode();
        } else {
          g.model.enterNormalMode();
        }
      }
      return g.util.dispatchMouseClickEvent(target.get(0), primary, false, false);
    };
    FMode.prototype.isValidKey = function(key) {
      if (key.length !== 1) {
        return false;
      }
      if (this.keys.indexOf(key) < 0) {
        return false;
      } else {
        return true;
      }
    };
    FMode.prototype.searchTarget = function() {
      var elem, i, _len, _ref2;
      _ref2 = this.hints;
      for (i = 0, _len = _ref2.length; i < _len; i++) {
        elem = _ref2[i];
        if (this.currentInput === elem.key) {
          return i;
        }
      }
      return -1;
    };
    FMode.prototype.highlightCandidate = function() {};
    FMode.prototype.putValidChar = function(key) {
      var idx;
      this.currentInput += key;
      g.view.setStatusLineText('f Mode : ' + this.currentInput);
      if (this.currentInput.length < this.keyLength) {
        this.highlightCandidate();
      } else {
        idx = this.searchTarget();
        if (idx >= 0) {
          this.hit(idx);
        } else {
          if (!this.opt.continuous) {
            g.model.enterNormalMode();
          }
        }
        if (this.opt.continuous) {
          this.currentInput = "";
          return g.view.setStatusLineText('f Mode : ');
        } else {
          return g.view.hideStatusLine();
        }
      }
    };
    FMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      if (key === "ESC") {
        return true;
      }
      if (ctrl || alt || meta) {
        return true;
      }
      if (this.isValidKey(key)) {
        event.stopPropagation();
        event.preventDefault();
        this.putValidChar(key);
        return false;
      } else {
        return true;
      }
    };
    FMode.prototype.getKeyLength = function(candiNum) {
      if (candiNum === 1) {
        return 1;
      }
      if (this.keys.length === 1) {
        return 1;
      }
      return Math.ceil(Math.log(candiNum) / Math.log(this.keys.length));
    };
    FMode.prototype.enter = function() {
      var div, elem, hint, i, j, k, key, links, offset, _i, _len, _len2, _ref2;
      this.currentInput = "";
      this.hints = [];
      this.keys = "";
      links = $('a:_visible,*:input:_visible,.button:_visible');
      if (links.length === 0) {
        g.view.setStatusLineText("No visible links found", 2000);
        setTimeout((function() {
          return g.model.enterNormalMode();
        }), 0);
        return;
      }
      this.keys = g.model.getSetting("fModeAvailableKeys");
      this.keyLength = this.getKeyLength(links.length);
      for (i = 0, _len = links.length; i < _len; i++) {
        elem = links[i];
        key = '';
        j = this.keyLength;
        k = i;
        while (j--) {
          key += this.keys.charAt(k % this.keys.length);
          k /= this.keys.length;
        }
        this.hints[i] = {};
        this.hints[i].key = key;
        this.hints[i].target = elem;
        $(elem).addClass('vichrome-fModeTarget');
      }
      _ref2 = this.hints;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        hint = _ref2[_i];
        offset = hint.target._offset_;
        div = $('<span id="vichromehint" />').css("top", offset.top - 7).css("left", offset.left - 7).html(hint.key);
        $(document.body).append(div);
      }
      return g.view.setStatusLineText('f Mode : ');
    };
    FMode.prototype.exit = function() {
      $('span#vichromehint').remove();
      return $('.vichrome-fModeTarget').removeClass('vichrome-fModeTarget');
    };
    return FMode;
  })();
  $.extend($.expr[':'], {
    _visible: function(elem) {
      var offset, winH, winLeft, winTop, winW;
      winLeft = window.pageXOffset;
      winTop = window.pageYOffset;
      winH = window.innerHeight;
      winW = window.innerWidth;
      offset = $(elem).offset();
      if (winTop > offset.top || winTop + winH < offset.top) {
        return false;
      }
      if (winLeft > offset.left || offset.left > winLeft + winW) {
        return false;
      }
      if ($.expr[':'].hidden(elem)) {
        return false;
      }
      if ($.curCSS(elem, 'visibility') === 'hidden') {
        return false;
      }
      elem._offset_ = offset;
      return true;
    }
  });
}).call(this);

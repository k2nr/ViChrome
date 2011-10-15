(function() {
  var Commandable, g;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  g = this;
  g.Mode = (function() {
    function Mode() {}
    Mode.prototype.exit = function() {};
    Mode.prototype.enter = function() {};
    Mode.prototype.reqOpen = function(args) {
      var arg, bookmark, com, history, interactive, search, sources, url, urls, _i, _len;
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
      if (interactive || bookmark || history) {
        com = "Open " + urls.join(' ');
        if (search) {
          com += " g";
          sources = [new g.CandSourceGoogleSuggest];
        } else if (bookmark) {
          sources = [new g.CandSourceBookmark];
        } else if (history) {
          sources = [new g.CandSourceHistory];
        } else {
          sources = [(new g.CandSourceGoogleSuggest(3)).requirePrefix(true), new g.CandSourceWebSuggest(3), new g.CandSourceBookmark(3), new g.CandSourceHistory(3)];
        }
        g.model.enterCommandMode((new g.CommandExecuter).set(com), sources);
      } else if (search) {
        url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + urls.join('+') + "&qscrl=1";
        return window.open(url, "_self");
      } else {
        return window.open(urls[0], "_self");
      }
    };
    Mode.prototype.reqOpenNewTab = function(args) {
      var arg, bookmark, com, history, interactive, search, sources, url, urls, words, _i, _len;
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
      if (interactive || bookmark || history) {
        com = "OpenNewTab " + words.join(' ');
        if (search) {
          com += " g";
          sources = [new g.CandSourceGoogleSuggest];
        } else if (bookmark) {
          sources = [new g.CandSourceBookmark];
        } else if (history) {
          sources = [new g.CandSourceHistory];
        } else {
          sources = [(new g.CandSourceGoogleSuggest(3)).requirePrefix(true), new g.CandSourceWebSuggest(3), new g.CandSourceBookmark(3), new g.CandSourceHistory(3)];
        }
        return g.model.enterCommandMode((new g.CommandExecuter).set(com), sources);
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
      return g.view.scrollBy(0, window.innerHeight / 2);
    };
    Mode.prototype.reqPageHalfUp = function() {
      return g.view.scrollBy(0, -window.innerHeight / 2);
    };
    Mode.prototype.reqPageDown = function() {
      return g.view.scrollBy(0, window.innerHeight);
    };
    Mode.prototype.reqPageUp = function() {
      return g.view.scrollBy(0, -window.innerHeight);
    };
    Mode.prototype.reqGoTop = function() {
      g.model.setPageMark();
      return g.view.scrollTo(window.pageXOffset, 0);
    };
    Mode.prototype.reqGoBottom = function() {
      g.model.setPageMark();
      return g.view.scrollTo(window.pageXOffset, document.body.scrollHeight - window.innerHeight);
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
    Mode.prototype.reqGoCommandMode = function() {
      var sources;
      sources = [new g.CandSourceCommand, new g.CandSourceAlias];
      return g.model.enterCommandMode(null, sources);
    };
    Mode.prototype.reqFocusOnFirstInput = function() {
      g.model.setPageMark();
      return g.view.focusInput(0);
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
  Commandable = {
    commandBox: null,
    reqFocusNextCandidate: function(args) {
      return this.commandBox.nextCandidate();
    },
    reqFocusPrevCandidate: function(args) {
      return this.commandBox.prevCandidate();
    }
  };
  g.SearchMode = (function() {
    __extends(SearchMode, g.Mode);
    function SearchMode() {
      g.extend(Commandable, this);
    }
    SearchMode.prototype.getName = function() {
      return "SearchMode";
    };
    SearchMode.prototype.init = function(searcher_, backward_, opt_) {
      var align, opt, width;
      opt = opt_ != null ? opt_ : {
        wrap: g.model.getSetting("wrapSearch"),
        ignoreCase: g.model.getSetting("ignoreCase"),
        incSearch: g.model.getSetting("incSearch"),
        minIncSearch: g.model.getSetting("minIncSearch"),
        backward: backward_
      };
      align = g.model.getSetting("commandBoxAlign");
      width = g.model.getSetting("commandBoxWidth");
      this.commandBox = (new g.CommandBox).init(g.view, align, width);
      this.searcher = searcher_.init(opt, this.commandBox);
      this.backward = backward_;
      return this;
    };
    SearchMode.prototype.cancelSearch = function() {
      g.model.goPageMark();
      this.searcher.finalize();
      return g.model.enterNormalMode();
    };
    SearchMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      var word;
      if (ctrl || alt || meta) {
        return true;
      }
      event.stopPropagation();
      word = this.commandBox.value();
      if (word.length === 0 && (key === "BS" || key === "DEL")) {
        this.cancelSearch();
        return false;
      }
      if (g.KeyManager.isNumber(key) || g.KeyManager.isAlphabet(key)) {
        return false;
      }
      if (key === "CR") {
        this.searcher.fix(word);
        g.model.setSearcher(this.searcher);
        g.model.enterNormalMode();
        return false;
      }
      return true;
    };
    SearchMode.prototype.escape = function() {
      return this.cancelSearch();
    };
    SearchMode.prototype.enter = function() {
      var candBox, modeChar;
      modeChar = this.backward === true ? "?" : "/";
      candBox = (new g.CandidateBox).addSource(new g.CandSourceSearchHist);
      return this.commandBox.attachTo(g.view).show(modeChar).focus().setCandidateBox(candBox);
    };
    SearchMode.prototype.exit = function() {
      return this.commandBox.hide().detachFrom(g.view);
    };
    SearchMode.prototype.getKeyMapping = function() {
      return g.model.getCMap();
    };
    return SearchMode;
  })();
  g.CommandMode = (function() {
    __extends(CommandMode, g.Mode);
    function CommandMode() {
      g.extend(Commandable, this);
    }
    CommandMode.prototype.getName = function() {
      return "CommandMode";
    };
    CommandMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      var _ref;
      if (ctrl || alt || meta) {
        return true;
      }
      event.stopPropagation();
      if (this.commandBox.value().length === 0 && (key === "BS" || key === "DEL")) {
        event.preventDefault();
        g.model.enterNormalMode();
        g.view.hideStatusLine();
        return false;
      }
      if (g.KeyManager.isNumber(key) || g.KeyManager.isAlphabet(key)) {
        return false;
      }
      if (key === "CR") {
        try {
          if ((_ref = this.executer) == null) {
            this.executer = new g.CommandExecuter;
          }
          this.executer.set(this.commandBox.value()).parse().execute();
          g.view.hideStatusLine();
        } catch (e) {
          g.view.setStatusLineText("Command Not Found : " + this.executer.get(), 2000);
        }
        g.model.enterNormalMode();
        return false;
      }
      return true;
    };
    CommandMode.prototype.enter = function() {
      var align, candBox, source, width, _i, _len, _ref;
      align = g.model.getSetting("commandBoxAlign");
      width = g.model.getSetting("commandBoxWidth");
      if (this.executer != null) {
        g.view.setStatusLineText(this.executer.get());
      }
      candBox = new g.CandidateBox;
      if (this.sources != null) {
        _ref = this.sources;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          source = _ref[_i];
          candBox.addSource(source);
        }
      }
      return this.commandBox = (new g.CommandBox).init(g.view, align, width).attachTo(g.view).show(":").focus().setCandidateBox(candBox);
    };
    CommandMode.prototype.exit = function() {
      return this.commandBox.hide().detachFrom(g.view);
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
      var primary;
      primary = false;
      if (this.hints[i].target.is('a')) {
        primary = this.opt.newTab;
        if (!this.opt.continuous) {
          g.model.enterNormalMode();
        }
      } else {
        this.hints[i].target.focus();
        if (g.util.isEditable(this.hints[i].target.get(0))) {
          g.model.enterInsertMode();
        } else {
          g.model.enterNormalMode();
        }
      }
      return g.util.dispatchMouseClickEvent(this.hints[i].target.get(0), primary, false, false);
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
      var elem, i, _len, _ref;
      _ref = this.hints;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        elem = _ref[i];
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
      var div, elem, links, that, x, y, _i, _len, _ref;
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
      that = this;
      links.each(function(i) {
        var j, k, key;
        key = '';
        j = that.keyLength;
        k = i;
        while (j--) {
          key += that.keys.charAt(k % that.keys.length);
          k /= that.keys.length;
        }
        that.hints[i] = {};
        that.hints[i].offset = $(this).offset();
        that.hints[i].key = key;
        that.hints[i].target = $(this);
        return $(this).addClass('vichrome-fModeTarget');
      });
      _ref = this.hints;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        x = elem.offset.left - 7;
        y = elem.offset.top - 7;
        if (x < 0) {
          x = 0;
        }
        if (y < 0) {
          y = 0;
        }
        div = $('<span id="vichromehint" />').css("top", y).css("left", x).html(elem.key);
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
      var offset, winH, winLeft, winTop, winW, _ref, _ref2;
      winLeft = window.pageXOffset;
      winTop = window.pageYOffset;
      winH = window.innerHeight;
      winW = window.innerWidth;
      offset = $(elem).offset();
      if ($.expr[':'].hidden(elem)) {
        return false;
      }
      if ($.curCSS(elem, 'visibility') === 'hidden') {
        return false;
      }
      if ((winLeft <= (_ref = offset.left) && _ref <= winLeft + winW) && (winTop <= (_ref2 = offset.top) && _ref2 <= winTop + winH)) {
        return true;
      } else {
        return false;
      }
    }
  });
}).call(this);

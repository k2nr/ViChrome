(function() {
  var g,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (this.vichrome == null) this.vichrome = {};

  g = this.vichrome;

  g.Mode = (function() {

    function Mode() {}

    Mode.prototype.exit = function() {};

    Mode.prototype.enter = function() {};

    Mode.prototype.getUseNumPrefix = function() {
      return false;
    };

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
      var arg, bookmark, com, history, i, interactive, opt, search, url, urls, web, word, _i, _j, _len, _len2;
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
            urls.push(arg.replace(/%url/g, g.view.getHref()));
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
        word = "";
        for (_j = 0, _len2 = urls.length; _j < _len2; _j++) {
          i = urls[_j];
          word += "+" + encodeURIComponent(i);
        }
        word = word.substr(1);
        url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + word + "&qscrl=1";
        return g.view.open(url, "_self");
      } else {
        url = urls[0];
        if (url.indexOf("%clipboard") >= 0) {
          return chrome.extension.sendRequest({
            command: "GetClipboard"
          }, function(data) {
            if (data == null) data = "";
            url = url.replace(/%clipboard/g, data);
            url = encodeURI(url);
            return g.view.open(url, "_self");
          });
        } else {
          return g.view.open(url, "_self");
        }
      }
    };

    Mode.prototype.reqTabOpenNew = function(args, times) {
      var arg, bookmark, com, history, i, interactive, opt, search, url, urls, web, word, words, _i, _j, _len, _len2;
      words = [];
      if (times > 10) times = 1;
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
            words.push(arg.replace(/%url/g, g.view.getHref()));
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
        word = "";
        for (_j = 0, _len2 = words.length; _j < _len2; _j++) {
          i = words[_j];
          word += "+" + encodeURIComponent(i);
        }
        word = word.substr(1);
        url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + word + "&qscrl=1";
        urls = [];
        urls.push(url);
        return chrome.extension.sendRequest({
          command: "TabOpenNew",
          args: urls,
          times: times
        }, g.handler.onCommandResponse);
      } else {
        return chrome.extension.sendRequest({
          command: "TabOpenNew",
          args: words,
          times: times
        }, g.handler.onCommandResponse);
      }
    };

    Mode.prototype.blur = function() {};

    Mode.prototype.reqScrollDown = function(args, times) {
      return g.view.scrollBy(0, g.model.getSetting("scrollPixelCount") * times);
    };

    Mode.prototype.reqScrollUp = function(args, times) {
      return g.view.scrollBy(0, -g.model.getSetting("scrollPixelCount") * times);
    };

    Mode.prototype.reqScrollLeft = function(args, times) {
      return g.view.scrollBy(-g.model.getSetting("scrollPixelCount") * times, 0);
    };

    Mode.prototype.reqScrollRight = function(args, times) {
      return g.view.scrollBy(g.model.getSetting("scrollPixelCount") * times, 0);
    };

    Mode.prototype.reqPageHalfDown = function(args, times) {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: times
      });
    };

    Mode.prototype.reqPageHalfUp = function(args, times) {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: -times
      });
    };

    Mode.prototype.reqPageDown = function(args, times) {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: 2 * times
      });
    };

    Mode.prototype.reqPageUp = function(args, times) {
      return g.view.scrollHalfPage({
        hor: 0,
        ver: -2 * times
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

    Mode.prototype.reqTabReload = function() {
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

    Mode.prototype.reqGoEmergencyMode = function() {
      return g.model.enterEmergencyMode();
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

    Mode.prototype.reqGoCommandMode = function(args) {
      var sources;
      sources = [
        {
          "class": "CandSourceCommand"
        }, {
          "class": "CandSourceAlias"
        }
      ];
      return g.model.enterCommandMode(new g.CommandExecuter, sources);
    };

    Mode.prototype.reqFocusOnFirstInput = function() {
      g.model.setPageMark();
      return g.view.focusInput(0);
    };

    Mode.prototype.reqTabList = function() {
      var executer, sources;
      sources = [
        {
          "class": "CandSourceTabs"
        }
      ];
      executer = (new g.CommandExecuter).set("MoveToNextTab").setDescription("TabList");
      return g.model.enterCommandMode(executer, sources);
    };

    Mode.prototype.reqBarrelRoll = function() {
      $(document.body).addClass('vichrome-barrelroll');
      return setTimeout(function() {
        return $(document.body).removeClass('vichrome-barrelroll');
      }, 2000);
    };

    Mode.prototype.reqHideJimmy = function() {
      return $("div#siteNotice").hide();
    };

    Mode.prototype.req_ChangeLogLevel = function(args) {
      if (!args || args.length < 1) return;
      if (g.logLevels[args[0]] != null) {
        return g.LOG_LEVEL = g.logLevels[args[0]];
      } else {
        return g.view.setStatusLineText("log level '" + args[0] + "' doesn't exist", 2000);
      }
    };

    Mode.prototype.getKeyMapping = function() {
      return g.model.getNMap();
    };

    Mode.prototype.reqToggleImageSize = function() {
      if(document.images.length == 1) {
        var img = document.getElementsByTagName('img')[0];
        var mouseEvent = document.createEvent("MouseEvent");
        mouseEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        img.dispatchEvent(mouseEvent);
      }
    };

    return Mode;

  })();

  g.NormalMode = (function(_super) {

    __extends(NormalMode, _super);

    function NormalMode() {
      NormalMode.__super__.constructor.apply(this, arguments);
    }

    NormalMode.prototype.getName = function() {
      return "NormalMode";
    };

    NormalMode.prototype.getUseNumPrefix = function() {
      return true;
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

  })(g.Mode);

  g.InsertMode = (function(_super) {

    __extends(InsertMode, _super);

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
      if (ctrl || alt || meta) return true;
      if (g.KeyManager.isNumber(key) || g.KeyManager.isAlphabet(key)) return false;
      return true;
    };

    return InsertMode;

  })(g.Mode);

  g.SearchMode = (function(_super) {

    __extends(SearchMode, _super);

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

    SearchMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      return true;
    };

    SearchMode.prototype.escape = function() {
      return this.cancelSearch();
    };

    SearchMode.prototype.enter = function() {
      var param, sources;
      sources = [
        {
          "class": "CandSourceSearchHist"
        }
      ];
      g.view.setStatusLineText("");
      param = {
        sources: sources,
        mode: 'Search',
        modeChar: this.backward === true ? '?' : '/',
        incSearch: this.opt.incSearch
      };
      return g.model.openCommandBox(param);
    };

    SearchMode.prototype.exit = function() {
      g.view.hideCommandFrame();
      return window.focus();
    };

    SearchMode.prototype.notifyInputUpdated = function(msg) {
      var _this = this;
      if (this.waiting) clearTimeout(this.timerId);
      this.timerId = setTimeout(function() {
        g.logger.e("set");
        _this.searcher.updateInput(msg.word);
        return _this.waiting = false;
      }, 200);
      return this.waiting = true;
    };

    SearchMode.prototype.notifySearchFixed = function(msg) {
      if (this.waiting) {
        clearTimeout(this.timerId);
        this.waiting = false;
      }
      this.searcher.fix(msg.word);
      g.model.setSearcher(this.searcher);
      return g.model.enterNormalMode();
    };

    SearchMode.prototype.getKeyMapping = function() {
      return g.model.getCMap();
    };

    return SearchMode;

  })(g.Mode);

  g.CommandMode = (function(_super) {

    __extends(CommandMode, _super);

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
      var param;
      if (this.executer == null) this.executer = new g.CommandExecuter;
      if (this.executer.getDescription() != null) {
        g.view.setStatusLineText(this.executer.getDescription());
      } else {
        g.view.setStatusLineText(this.executer.get());
      }
      param = {
        sources: this.sources,
        mode: 'Command',
        modeChar: ':'
      };
      return g.model.openCommandBox(param);
    };

    CommandMode.prototype.exit = function() {
      g.view.hideCommandFrame();
      return window.focus();
    };

    CommandMode.prototype.getKeyMapping = function() {
      return g.model.getCMap();
    };

    CommandMode.prototype.setExecuter = function(executer) {
      this.executer = executer;
      return this;
    };

    CommandMode.prototype.setSources = function(sources) {
      this.sources = sources;
      return this;
    };

    return CommandMode;

  })(g.Mode);

  g.EmergencyMode = (function(_super) {

    __extends(EmergencyMode, _super);

    function EmergencyMode() {
      EmergencyMode.__super__.constructor.apply(this, arguments);
    }

    EmergencyMode.prototype.getName = function() {
      return "EmergencyMode";
    };

    EmergencyMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
      return true;
    };

    EmergencyMode.prototype.enter = function() {
      var key, keyMap, mapped, text;
      keyMap = g.model.getEMap();
      text = "Emergency Mode: press ";
      for (key in keyMap) {
        mapped = keyMap[key];
        if (mapped === "Escape") text += key + ", ";
      }
      text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/, $/, " ");
      text += "to escape";
      return g.view.setStatusLineText(text);
    };

    EmergencyMode.prototype.exit = function() {
      return g.view.hideStatusLine();
    };

    EmergencyMode.prototype.blur = function(target) {
      if (g.util.isEmbededFlash(target)) return g.model.enterNormalMode();
    };

    EmergencyMode.prototype.getKeyMapping = function() {
      return g.model.getEMap();
    };

    return EmergencyMode;

  })(g.Mode);

  g.FMode = (function(_super) {

    __extends(FMode, _super);

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
        if (!this.opt.continuous) g.model.enterNormalMode();
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
      if (key.length !== 1) return false;
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
        if (this.currentInput === elem.key) return i;
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
          if (!this.opt.continuous) g.model.enterNormalMode();
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
      if (key === "ESC") return true;
      if (ctrl || alt || meta) return true;
      if (g.model.getSetting("fModeIgnoreCase")) key = key.toUpperCase();
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
      if (candiNum === 1) return 1;
      if (this.keys.length === 1) return 1;
      return Math.ceil(Math.log(candiNum) / Math.log(this.keys.length));
    };

    FMode.prototype.enter = function() {
      var div, elem, hint, i, j, k, key, left, links, offset, top, _i, _len, _len2, _ref;
      this.currentInput = "";
      this.hints = [];
      links = $('a:_visible,*:input:_visible,.button:_visible');
      if (links.length === 0) {
        g.view.setStatusLineText("No visible links found", 2000);
        setTimeout((function() {
          return g.model.enterNormalMode();
        }), 0);
        return;
      }
      this.keys = g.model.getSetting("fModeAvailableKeys");
      if (g.model.getSetting("fModeIgnoreCase")) {
        this.keys = this.keys.toUpperCase();
      }
      this.keyLength = this.getKeyLength(links.length);
      for (i = 0, _len = links.length; i < _len; i++) {
        elem = links[i];
        key = '';
        j = this.keyLength;
        k = i;
        while (j--) {
          key = this.keys.charAt(k % this.keys.length) + key;
          k /= this.keys.length;
        }
        this.hints[i] = {};
        this.hints[i].key = key;
        this.hints[i].target = elem;
        $(elem).addClass('vichrome-fModeTarget');
      }
      _ref = this.hints;
      for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
        hint = _ref[_i];
        offset = hint.target._offset_;
        top = offset.top - 7;
        left = offset.left - 7;
        if (top < 0) top = 0;
        if (left < 0) left = 0;
        div = $('<span id="vichromehint" />').css("top", top).css("left", left).html(hint.key);
        $('html').append(div);
      }
      return g.view.setStatusLineText('f Mode : ');
    };

    FMode.prototype.exit = function() {
      $('span#vichromehint').remove();
      return $('.vichrome-fModeTarget').removeClass('vichrome-fModeTarget');
    };

    return FMode;

  })(g.Mode);

  $.extend($.expr[':'], {
    _visible: function(elem) {
      var offset, winH, winLeft, winTop, winW;
      winLeft = window.pageXOffset;
      winTop = window.pageYOffset;
      winH = window.innerHeight;
      winW = window.innerWidth;
      offset = $(elem).offset();
      if (winTop > offset.top || winTop + winH < offset.top) return false;
      if (winLeft > offset.left || offset.left > winLeft + winW) return false;
      if ($.expr[':'].hidden(elem)) return false;
      if ($.curCSS(elem, 'visibility') === 'hidden') return false;
      elem._offset_ = offset;
      return true;
    }
  });

}).call(this);

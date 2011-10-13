(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  g = this;
  $.fn.extend({
    isWithinScreen: function() {
      var offset, padding;
      offset = $(this).offset();
      if (offset == null) {
        return false;
      }
      padding = 10;
      if (offset.left + padding > window.pageXOffset + window.innerWidth || offset.left - padding < window.pageXOffset) {
        return false;
      }
      if (offset.top + padding > window.pageYOffset + window.innerHeight || offset.top - padding < window.pageYOffset) {
        return false;
      }
      return true;
    },
    scrollTo: function(x, y, speed) {
      var left, newX, newY, offset, top;
      if (speed == null) {
        speed = 80;
      }
      offset = $($(this).get(0)).offset();
      if (!((x != null) || (y != null))) {
        if (offset == null) {
          return $(this);
        }
        if ($(this).isWithinScreen()) {
          return $(this);
        }
      }
      newX = offset.left - window.innerWidth / 2;
      newY = offset.top - window.innerHeight / 2;
      if (newX > document.body.scrollLeft - window.innerWidth) {
        newX - document.body.scrollLeft - window.innerWidth;
      }
      if (newY > document.body.scrollHeight - window.innerHeight) {
        newX = document.body.scrollHeight - window.innerHeight;
      }
      left = x != null ? x : newX;
      top = y != null ? y : newY;
      if (!g.model.getSetting("smoothScroll")) {
        speed = 0;
      }
      $(document.body).animate({
        scrollTop: top,
        scrollLeft: left
      }, speed);
      return $(this);
    },
    scrollBy: function(x, y, speed) {
      var left, top;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (speed == null) {
        speed = 35;
      }
      top = window.pageYOffset + y;
      left = window.pageXOffset + x;
      if (!g.model.getSetting("smoothScroll")) {
        speed = 0;
      }
      $(document.body).animate({
        scrollTop: top,
        scrollLeft: left
      }, speed);
      return $(this);
    }
  });
  g.Surface = (function() {
    function Surface() {}
    Surface.prototype.init = function() {
      var align, alignClass, width;
      align = g.model.getSetting("commandBoxAlign");
      width = g.model.getSetting("commandBoxWidth");
      alignClass = "statusline" + align;
      this.statusLine = $('<div id="vichromestatusline" />').addClass('statuslineinactive').addClass(alignClass).width(width);
      this.hideStatusLine();
      this.attach(this.statusLine);
      return this.initialized = true;
    };
    Surface.prototype.attach = function(w) {
      $(document.body).append(w);
      return this;
    };
    Surface.prototype.activeStatusLine = function() {
      this.statusLine.removeClass('statuslineinactive');
      this.statusLine.show();
      if (this.slTimeout) {
        clearTimeout(this.slTimeout);
        this.slTimeout = void 0;
      }
      return this;
    };
    Surface.prototype.inactiveStatusLine = function() {
      this.statusLine.addClass('statuslineinactive');
      return this;
    };
    Surface.prototype.hideStatusLine = function() {
      if (this.slTimeout != null) {
        clearTimeout(this.slTimeout);
        this.slTimeout = void 0;
      }
      this.statusLine.html("").hide();
      return this;
    };
    Surface.prototype.setStatusLineText = function(text, timeout) {
      this.statusLine.html(text);
      this.activeStatusLine();
      if (timeout) {
        this.slTimeout = setTimeout((__bind(function() {
          return this.statusLine.html("").hide();
        }, this)), timeout);
      }
      return this;
    };
    Surface.prototype.detach = function(w) {
      return w.detach();
    };
    Surface.prototype.focusInput = function(idx) {
      var _base, _ref;
      if (!this.initialized) {
        return this;
      }
      if (typeof (_base = $('form input:text:visible')).scrollTo === "function") {
        if ((_ref = _base.scrollTo().get(0)) != null) {
          _ref.focus();
        }
      }
      return this;
    };
    Surface.prototype.scrollBy = function(x, y) {
      if (!this.initialized) {
        return this;
      }
      $(document.body).scrollBy(x, y, 20);
      return this;
    };
    Surface.prototype.scrollTo = function(x, y) {
      if (!this.initialized) {
        return this;
      }
      $(document.body).scrollTo(x, y, 80);
      return this;
    };
    Surface.prototype.backHist = function() {
      if (!this.initialized) {
        return this;
      }
      window.history.back();
      return this;
    };
    Surface.prototype.forwardHist = function() {
      if (!this.initialized) {
        return this;
      }
      window.history.forward();
      return this;
    };
    Surface.prototype.reload = function() {
      if (!this.initialized) {
        return this;
      }
      window.location.reload();
      return this;
    };
    Surface.prototype.blurActiveElement = function() {
      if (!this.initialized) {
        return this;
      }
      document.activeElement.blur();
      return this;
    };
    return Surface;
  })();
  g.CommandBox = (function() {
    function CommandBox() {
      this.inputListeners = [];
    }
    CommandBox.prototype.init = function(view, align, w) {
      var alignClass;
      this.view = view;
      this.align = align;
      alignClass = "vichromebox" + this.align;
      this.box = $('<div id="vichromebox" />').addClass(alignClass).width(w);
      this.input = $('<input type="text" id="vichromeinput" spellcheck="false" value="" />');
      this.modeChar = $('<div id="vichromemodechar" />');
      this.inputField = $('<table />').append($('<tr />').append($('<td id="vichromemodechar" />').append(this.modeChar)).append($('<td id="vichromeinput" />').append(this.input)));
      this.inputField = $('<div id="vichromefield" />').append(this.inputField);
      this.box.append(this.inputField);
      return this;
    };
    CommandBox.prototype.addInputUpdateListener = function(fn) {
      this.inputListeners.push(fn);
      return this;
    };
    CommandBox.prototype.attachTo = function(view) {
      view.attach(this.box);
      return this;
    };
    CommandBox.prototype.detachFrom = function(view) {
      view.detach(this.box);
      if (this.candidateBox != null) {
        this.candidateBox.stop();
        this.candidateBox.detachFrom(view);
      }
      return this;
    };
    CommandBox.prototype.show = function(modeChar, input) {
      this.input.attr("value", input);
      this.modeChar.html(modeChar);
      this.box.show();
      this.inputField.show();
      $(document).keyup(__bind(function(e) {
        var listener, val, _i, _len, _ref;
        val = this.value();
        if (this.selectedCand === val) {
          return;
        }
        if (this.bfInput !== val && this.isVisible()) {
          _ref = this.inputListeners;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            listener = _ref[_i];
            listener(val);
          }
        }
        return this.bfInput = val;
      }, this));
      this.view.activeStatusLine();
      return this;
    };
    CommandBox.prototype.hide = function() {
      if (this.isVisible()) {
        this.inputField.hide();
        this.input.blur();
      }
      this.box.unbind();
      return this;
    };
    CommandBox.prototype.focus = function() {
      var _ref;
      if ((_ref = this.input.get(0)) != null) {
        _ref.focus();
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
      if (this.candidateBox != null) {
        this.candidateBox.stop();
        this.candidateBox.detachFrom(view);
      }
      this.candidateBox = candBox.setAlign(this.align).init();
      this.candidateBox.setCommandBox(this);
      this.candidateBox.attachTo(this.view).show();
      return this;
    };
    CommandBox.prototype.nextCandidate = function() {
      var focused, _ref;
      focused = (_ref = this.candidateBox) != null ? _ref.focusNext() : void 0;
      this.value(focused != null ? focused.str : void 0);
      this.selectedCand = focused.str;
      return this;
    };
    CommandBox.prototype.prevCandidate = function() {
      var focused, _ref;
      focused = (_ref = this.candidateBox) != null ? _ref.focusPrev() : void 0;
      this.value(focused != null ? focused.str : void 0);
      this.selectedCand = focused.str;
      return this;
    };
    return CommandBox;
  })();
  g.CandidateBox = (function() {
    function CandidateBox() {
      this.items = {};
      this.sources = {};
      this.selectedListeners = [];
      this.index = 0;
      this.scrIndex = 0;
    }
    CandidateBox.prototype.setAlign = function(align) {
      this.align = align;
      return this;
    };
    CandidateBox.prototype.init = function() {
      var alignClass;
      alignClass = "candbox" + this.align;
      this.box = $('<div id="vichromecandbox" />').addClass(alignClass);
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
      this.sources[src.id] = src;
      this.items[src.id] = [];
      src.addSrcUpdatedListener(__bind(function(items) {
        this.items[src.id] = items;
        return this.update(src.id);
      }, this));
      return this;
    };
    CandidateBox.prototype.attachTo = function(view) {
      view.attach(this.box);
      return this;
    };
    CandidateBox.prototype.detachFrom = function(view) {
      view.detach(this.box);
      return this;
    };
    CandidateBox.prototype.resetItem = function() {
      this.candidates = [];
      return this;
    };
    CandidateBox.prototype.makeItemLine = function(src, id, item) {
      var dscr, line, srcType, text;
      line = $("<div id=\"vichromecanditem\" source=\"" + src + "\" num=\"" + id + "\" />");
      text = $("<div class=\"candtext\" />").html(item.str);
      dscr = $("<div class=\"canddscr\" />").html(item.dscr);
      srcType = $("<div class=\"canddscr\" />").html(item.source);
      return line.append(text).append(dscr).append(srcType);
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
      return this.box.get(0).scrollTop = 22 * this.scrIndex;
    };
    CandidateBox.prototype.scrollDown = function() {
      if (this.index >= this.scrIndex + 20) {
        return this.scrollTo(this.scrIndex + 1);
      } else if (this.index < this.scrIndex) {
        return this.scrollTo(this.index);
      }
    };
    CandidateBox.prototype.scrollUp = function() {
      if (this.index >= this.scrIndex + 20) {
        return this.scrollTo(this.getItemCnt() - 20);
      } else if (this.index < this.scrIndex) {
        return this.scrollTo(this.index);
      }
    };
    CandidateBox.prototype.scrollTop = function() {
      return this.scrollTo(0);
    };
    CandidateBox.prototype.scrollBottom = function() {
      this.scrIndex = 0;
      return this.box.get(0).scrollTop = 0;
    };
    CandidateBox.prototype.removeFocus = function($focused) {
      $focused.removeClass("canditemfocused");
      return $focused.children().removeClass("canditemfocused");
    };
    CandidateBox.prototype.setFocus = function($settee) {
      $settee.addClass("canditemfocused");
      return $settee.children().addClass("canditemfocused");
    };
    CandidateBox.prototype.focusNext = function() {
      var $focused, $next;
      $focused = $("#vichromecanditem.canditemfocused");
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
      $focused = $("#vichromecanditem.canditemfocused");
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
      $focused = $("#vichromecanditem.canditemfocused");
      return this.getItem($focused.attr("source"), parseInt($focused.attr("num")));
    };
    CandidateBox.prototype.onInput = function(word) {
      var id, src, _ref;
      _ref = this.sources;
      for (id in _ref) {
        src = _ref[id];
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
      return this.onInput = function() {};
    };
    return CandidateBox;
  })();
  g.CandidateSource = (function() {
    function CandidateSource() {
      this.updatedListeners = [];
      this.items = [];
    }
    CandidateSource.prototype.addSrcUpdatedListener = function(listener) {
      this.updatedListeners.push(listener);
      return this;
    };
    CandidateSource.prototype.addItem = function(item) {
      return this.items.push(item);
    };
    CandidateSource.prototype.resetItem = function() {
      return this.items = [];
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
    return CandidateSource;
  })();
  g.CandSourceCommand = (function() {
    __extends(CandSourceCommand, g.CandidateSource);
    function CandSourceCommand() {
      CandSourceCommand.__super__.constructor.apply(this, arguments);
    }
    CandSourceCommand.prototype.id = "Command";
    CandSourceCommand.prototype.cbInputUpdated = function(word) {
      var com, method, _ref;
      this.resetItem();
      _ref = g.CommandExecuter.prototype.commandTable;
      for (com in _ref) {
        method = _ref[com];
        if (com.toUpperCase().slice(0, word.length) === word.toUpperCase()) {
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
    function CandSourceAlias() {
      CandSourceAlias.__super__.constructor.apply(this, arguments);
    }
    CandSourceAlias.prototype.id = "Alias";
    CandSourceAlias.prototype.cbInputUpdated = function(word) {
      var alias, com, _ref;
      this.resetItem();
      _ref = g.model.getAlias();
      for (alias in _ref) {
        com = _ref[alias];
        if (alias.toUpperCase().slice(0, word.length) === word.toUpperCase()) {
          this.addItem({
            str: alias,
            source: "Alias",
            dscr: ""
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
    CandSourceHistory.prototype.cbInputUpdated = function(word) {};
    return CandSourceHistory;
  })();
  g.CandSourceBookmark = (function() {
    __extends(CandSourceBookmark, g.CandidateSource);
    function CandSourceBookmark() {
      CandSourceBookmark.__super__.constructor.apply(this, arguments);
    }
    CandSourceBookmark.prototype.id = "Bookmark";
    CandSourceBookmark.prototype.cbInputUpdated = function(word) {};
    return CandSourceBookmark;
  })();
  g.CandSourceSearchHist = (function() {
    __extends(CandSourceSearchHist, g.CandidateSource);
    CandSourceSearchHist.prototype.id = "SearchHistory";
    function CandSourceSearchHist() {
      CandSourceSearchHist.__super__.constructor.call(this);
      chrome.extension.sendRequest({
        command: "GetSearchHistory"
      }, __bind(function(msg) {
        return this.history = msg.value.reverse();
      }, this));
    }
    CandSourceSearchHist.prototype.cbInputUpdated = function(word) {
      var hist, _i, _len, _ref;
      if (this.history == null) {
        return;
      }
      this.resetItem();
      _ref = this.history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hist = _ref[_i];
        if (hist.toUpperCase().slice(0, word.length) === word.toUpperCase()) {
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
    CandSourceGoogleSuggest.prototype.cbInputUpdated = function(word) {};
    return CandSourceGoogleSuggest;
  })();
}).call(this);

(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  $.fn.extend({
    isWithinScreen: function() {
      var offset, padding;
      offset = $(this).offset();
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
      newX = offset.left - window.innerWidth / 2;
      newY = offset.top - window.innerHeight / 2;
      if (newX > document.body.scrollLeft - window.innerWidth) {
        newX - document.body.scrollLeft - window.innerWidth;
      }
      if (newY > document.body.scrollHeight - window.innerHeight) {
        newX = document.body.scrollHeight - window.innerHeight;
      }
      if (!((x != null) || (y != null))) {
        if ($(this).isWithinScreen()) {
          return $(this);
        }
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
    function CommandBox() {}
    CommandBox.prototype.init = function(view, align, w) {
      var alignClass;
      alignClass = "vichromebox" + align;
      this.box = $('<div id="vichromebox" />').addClass(alignClass).width(w);
      this.input = $('<input type="text" id="vichromeinput" spellcheck="false" value="" />');
      this.modeChar = $('<div id="vichromemodechar" />');
      this.inputField = $('<table />').append($('<tr />').append($('<td id="vichromemodechar" />').append(this.modeChar)).append($('<td id="vichromeinput" />').append(this.input)));
      this.inputField = $('<div id="vichromefield" />').append(this.inputField);
      this.box.append(this.inputField);
      this.view = view;
      return this;
    };
    CommandBox.prototype.addInputUpdateListener = function(fn) {
      this.inputUpdateListener = fn;
      return this;
    };
    CommandBox.prototype.removeInputUpdateListener = function() {
      this.inputUpdateListener = null;
      return this;
    };
    CommandBox.prototype.attachTo = function(view) {
      view.attach(this.box);
      return this;
    };
    CommandBox.prototype.detachFrom = function(view) {
      view.detach(this.box);
      this.inputUpdateListener = null;
      return this;
    };
    CommandBox.prototype.show = function(modeChar, input) {
      this.input.attr("value", input);
      this.modeChar.html(modeChar);
      this.box.show();
      this.inputField.show();
      this.box.keyup(__bind(function(e) {
        if (this.isVisible() && this.inputUpdateListener) {
          return this.inputUpdateListener(this.value());
        }
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
    CommandBox.prototype.value = function() {
      return this.input.val();
    };
    return CommandBox;
  })();
}).call(this);

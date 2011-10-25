(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  $.fn.extend({
    isWithinScreen: function(padding) {
      var offset;
      if (padding == null) {
        padding = 10;
      }
      offset = $(this).offset();
      if (offset == null) {
        return false;
      }
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
  $.extend($.expr[':'], {
    scrollable: function(elem) {
      var overflow;
      overflow = $.curCSS(elem, 'overflow');
      switch (overflow) {
        case "auto":
        case "scroll":
          return true;
      }
      return false;
    }
  });
  g.Surface = (function() {
    function Surface() {}
    Surface.prototype.init = function() {
      var align, path;
      align = g.model.getSetting("commandBoxAlign");
      this.statusLine = $('<div id="vichromestatusline" />').addClass('vichrome-statuslineinactive').addClass("vichrome-statusline" + align).width(g.model.getSetting("commandBoxWidth"));
      this.statusLineVisible = false;
      if (typeof top !== "undefined" && top !== null) {
        path = chrome.extension.getURL("commandbox.html");
        this.iframe = $("<iframe src=\"" + path + "\" id=\"vichrome-commandframe\" sandbox=\"allow-scripts\" seamless />");
        this.attach(this.iframe);
        this.iframe.hide();
      }
      $(document.body).click(__bind(function(e) {
        var _ref;
        this.scrollee = $(e.target).closest(":scrollable").get(0);
        return (_ref = this.scrollee) != null ? _ref : this.scrollee = window;
      }, this));
      return this.initialized = true;
    };
    Surface.prototype.attach = function(w) {
      $(typeof top !== "undefined" && top !== null ? top.document.body : void 0).append(w);
      return this;
    };
    Surface.prototype.activateStatusLine = function() {
      if (this.slTimeout) {
        clearTimeout(this.slTimeout);
        this.slTimeout = void 0;
      }
      if (this.statusLineVisible) {
        return;
      }
      this.statusLine.removeClass('vichrome-statuslineinactive');
      this.attach(this.statusLine);
      this.statusLine.show();
      this.statusLineVisible = true;
      return this;
    };
    Surface.prototype.inactiveStatusLine = function() {
      this.statusLine.addClass('vichrome-statuslineinactive');
      return this;
    };
    Surface.prototype.hideStatusLine = function() {
      if (this.slTimeout != null) {
        clearTimeout(this.slTimeout);
        this.slTimeout = void 0;
      }
      if (!this.statusLineVisible) {
        return;
      }
      this.statusLine.html("").hide();
      this.statusLine.detach();
      this.statusLineVisible = false;
      return this;
    };
    Surface.prototype.setStatusLineText = function(text, timeout) {
      this.activateStatusLine();
      this.statusLine.html(text);
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
    Surface.prototype.scrollHalfPage = function(a) {
      var block;
      if (!this.initialized) {
        return this;
      }
      block = window.innerHeight / 2;
      this.scrollBy(block * a.hor, block * a.ver);
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
    Surface.prototype.open = function(url, a) {
      if (!this.initialized) {
        return this;
      }
      window.open(url, a);
      return this;
    };
    Surface.prototype.goTop = function() {
      if (!this.initialized) {
        return this;
      }
      this.scrollTo(window.pageXOffset, 0);
      return this;
    };
    Surface.prototype.goBottom = function() {
      if (!this.initialized) {
        return this;
      }
      this.scrollTo(window.pageXOffset, document.body.scrollHeight - window.innerHeight);
      return this;
    };
    Surface.prototype.getHref = function() {
      return window.location.href;
    };
    Surface.prototype.blurActiveElement = function() {
      var _ref;
      if (!this.initialized) {
        return this;
      }
      if ((_ref = document.activeElement) != null) {
        _ref.blur();
      }
      return this;
    };
    Surface.prototype.hideCommandFrame = function() {
      this.iframe.hide();
      return window.focus();
    };
    Surface.prototype.showCommandFrame = function() {
      return this.iframe.show();
    };
    return Surface;
  })();
}).call(this);

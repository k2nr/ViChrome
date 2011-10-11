(function() {
  var g;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  g.EventHandler = (function() {
    function EventHandler(model) {
      this.model = model;
    }
    EventHandler.prototype.onBlur = function(e) {
      g.logger.d("onBlur", e);
      return this.model.onBlur();
    };
    EventHandler.prototype.onKeyDown = function(e) {
      var msg;
      g.logger.d("onKeyDown", e);
      msg = this.getHandlableKey(e);
      if (msg != null) {
        return this.model.handleKey(msg);
      }
    };
    EventHandler.prototype.getHandlableKey = function(e) {
      var code;
      if (g.KeyManager.isOnlyModifier(e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey)) {
        g.logger.d("getHandlableKey:only modefier");
        return;
      }
      code = g.KeyManager.getLocalKeyCode(e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
      if (code == null) {
        g.logger.d("getHandlableKey:cant be handled");
        return;
      }
      if (this.model.prePostKeyEvent(code, e.ctrlKey, e.altKey, e.metaKey)) {
        return {
          code: code,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          meta: e.metaKey
        };
      } else {
        return g.logger.d("prePostKeyEvent:key ignored by current mode");
      }
    };
    EventHandler.prototype.onFocus = function(e) {
      g.logger.d("onFocus", e.target);
      return this.model.onFocus(e.target);
    };
    EventHandler.prototype.addWindowListeners = function() {
      window.addEventListener("keydown", (__bind(function(e) {
        return this.onKeyDown(e);
      }, this)), true);
      window.addEventListener("focus", (__bind(function(e) {
        return this.onFocus(e);
      }, this)), true);
      return window.addEventListener("blur", (__bind(function(e) {
        return this.onBlur(e);
      }, this)), true);
    };
    EventHandler.prototype.init = function() {
      this.addWindowListeners();
      return this.model.init();
    };
    EventHandler.prototype.onInitEnabled = function(msg) {
      this.model.onInitEnabled(msg);
      return this.init();
    };
    EventHandler.prototype.onCommandResponse = function(msg) {
      if ((msg != null ? msg.command : void 0) === "Settings") {
        return this.model.onSettings(msg);
      }
    };
    return EventHandler;
  })();
}).call(this);

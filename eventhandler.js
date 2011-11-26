(function() {
  var g, _ref;

  if ((_ref = this.vichrome) == null) this.vichrome = {};

  g = this.vichrome;

  g.EventHandler = (function() {

    function EventHandler(model) {
      this.model = model;
    }

    EventHandler.prototype.onBlur = function(e) {
      g.logger.d("onBlur", e);
      return this.model.onBlur(e.target);
    };

    EventHandler.prototype.onKeyPress = function(e) {
      if (g.model.isInSearchMode() || g.model.isInCommandMode()) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) return event.stopPropagation();
      }
    };

    EventHandler.prototype.onKeyDown = function(e) {
      var msg;
      g.logger.d("onKeyDown", e);
      msg = this.getHandlableKey(e);
      if (msg != null) return this.model.handleKey(msg);
    };

    EventHandler.prototype.getHandlableKey = function(e) {
      var code;
      if (g.KeyManager.isOnlyModifier(e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey)) {
        g.logger.d("getHandlableKey:only modifier");
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
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          meta: e.metaKey
        };
      } else {
        g.logger.d("prePostKeyEvent:key ignored by current mode");
      }
    };

    EventHandler.prototype.onFocus = function(e) {
      g.logger.d("onFocus", e.target);
      return this.model.onFocus(e.target);
    };

    EventHandler.prototype.onMouseDown = function(e) {
      g.logger.d("onFocus", e);
      return this.model.onMouseDown(e);
    };

    EventHandler.prototype.addWindowListeners = function() {
      var _this = this;
      document.addEventListener("keydown", (function(e) {
        return _this.onKeyDown(e);
      }), true);
      document.addEventListener("keypress", (function(e) {
        return _this.onKeyPress(e);
      }), true);
      document.addEventListener("focus", (function(e) {
        return _this.onFocus(e);
      }), true);
      document.addEventListener("blur", (function(e) {
        return _this.onBlur(e);
      }), true);
      return document.addEventListener("mousedown", (function(e) {
        return _this.onMouseDown(e);
      }), true);
    };

    EventHandler.prototype.addExtListener = function() {
      var _this = this;
      return chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        var a, aliases, com, commands, method, _ref2, _ref3;
        g.logger.d("onRequest command: " + req.command);
        if ((req.frameID != null) && req.frameID !== g.model.frameID) {
          g.logger.d("onRequest: different frameID");
          sendResponse();
          return;
        }
        if (req.command === "GetCommandTable") {
          commands = [];
          _ref2 = g.CommandExecuter.prototype.commandTable;
          for (com in _ref2) {
            method = _ref2[com];
            commands.push(com);
          }
          return sendResponse(commands);
        } else if (req.command === "GetAliases") {
          aliases = {};
          _ref3 = g.model.getAlias();
          for (a in _ref3) {
            com = _ref3[a];
            aliases[a] = com;
          }
          return sendResponse(aliases);
        } else if (req.command === "OpenCommandBox") {
          g.model.openCommandBox(req);
          return sendResponse();
        } else if (req.command === "ExecuteCommand") {
          g.model.curMode.reqExecuteCommand(req);
          return sendResponse();
        } else if (req.command === "NotifyInputUpdated") {
          g.model.curMode.notifyInputUpdated(req);
          return sendResponse();
        } else if (req.command === "NotifySearchFixed") {
          g.model.curMode.notifySearchFixed(req);
          return sendResponse();
        } else if (req.command === "HideCommandFrame") {
          g.view.hideCommandFrame();
          return sendResponse();
        } else if (req.command === "SetStatusLine") {
          g.view.setStatusLineText(req.text, req.timeout);
          return sendResponse();
        } else if (req.command === "HideStatusLine") {
          g.view.hideStatusLine();
          return sendResponse();
        } else {
          g.model.triggerCommand("req" + req.command, req.args);
          return sendResponse();
        }
      });
    };

    EventHandler.prototype.init = function() {
      this.addWindowListeners();
      return this.addExtListener();
    };

    EventHandler.prototype.onInitEnabled = function(msg) {
      this.init();
      return this.model.onInitEnabled(msg);
    };

    EventHandler.prototype.onCommandResponse = function(msg) {
      if (msg == null) return;
      if (msg.command === "Settings") this.model.onSettings(msg);
      if ((msg.error != null) && msg.error === true) {
        g.logger.e("onCommandResponse: error occured!!!", msg);
        g.model.curMode.reqEscape();
        return g.view.setStatusLineText("Error:" + msg.errorMsg, 3000);
      }
    };

    return EventHandler;

  })();

}).call(this);

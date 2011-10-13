(function() {
  var escape, g, sendToBackground, triggerInsideContent;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  g = this;
  sendToBackground = function(com, args) {
    return chrome.extension.sendRequest({
      command: com,
      args: args
    }, g.handler.onCommandResponse);
  };
  triggerInsideContent = function(com, args) {
    return g.model.triggerCommand("req" + com, args);
  };
  escape = function(com) {
    return triggerInsideContent("Escape");
  };
  g.CommandExecuter = (function() {
    function CommandExecuter() {}
    CommandExecuter.prototype.commandsBeforeReady = ["OpenNewTab", "CloseCurTab", "MoveToNextTab", "MoveToPrevTab", "NMap", "IMap", "Alias", "OpenNewWindow", "RestoreTab"];
    CommandExecuter.prototype.commandTable = {
      Open: triggerInsideContent,
      OpenNewTab: triggerInsideContent,
      CloseCurTab: sendToBackground,
      MoveToNextTab: sendToBackground,
      MoveToPrevTab: sendToBackground,
      NMap: sendToBackground,
      IMap: sendToBackground,
      Alias: sendToBackground,
      OpenNewWindow: sendToBackground,
      ReloadTab: triggerInsideContent,
      ScrollUp: triggerInsideContent,
      ScrollDown: triggerInsideContent,
      ScrollLeft: triggerInsideContent,
      ScrollRight: triggerInsideContent,
      PageHalfUp: triggerInsideContent,
      PageHalfDown: triggerInsideContent,
      PageUp: triggerInsideContent,
      PageDown: triggerInsideContent,
      GoTop: triggerInsideContent,
      GoBottom: triggerInsideContent,
      NextSearch: triggerInsideContent,
      PrevSearch: triggerInsideContent,
      BackHist: triggerInsideContent,
      ForwardHist: triggerInsideContent,
      GoCommandMode: triggerInsideContent,
      GoSearchModeForward: triggerInsideContent,
      GoSearchModeBackward: triggerInsideContent,
      GoLinkTextSearchMode: triggerInsideContent,
      GoFMode: triggerInsideContent,
      FocusOnFirstInput: triggerInsideContent,
      BackToPageMark: triggerInsideContent,
      RestoreTab: sendToBackground,
      FocusNextCandidate: triggerInsideContent,
      FocusPrevCandidate: triggerInsideContent,
      Escape: escape,
      "_ChangeLogLevel": triggerInsideContent
    };
    CommandExecuter.prototype.get = function() {
      return this.command;
    };
    CommandExecuter.prototype.set = function(command, times) {
      if (this.command != null) {
        this.command += " ";
      } else {
        this.command = "";
      }
      this.command += command.replace(/^[\t ]*/, "").replace(/[\t ]*$/, "");
      this.times = times != null ? times : 1;
      return this;
    };
    CommandExecuter.prototype.parse = function() {
      var aliases, i, _ref;
      if (!this.command) {
        throw "invalid command";
      }
      this.args = this.command.split(/\ +/);
      if (!this.args || this.args.length === 0) {
        throw "invalid command";
      }
      for (i = _ref = this.args.length - 1; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
        if (this.args[i].length === 0) {
          this.args.splice(i, 1);
        }
      }
      aliases = g.model.getAlias();
      if (aliases[this.args[0]]) {
        this.args = aliases[this.args[0]].split(' ').concat(this.args.slice(1));
      }
      if (this.commandTable[this.args[0]]) {
        return this;
      } else {
        throw "invalid command";
      }
    };
    CommandExecuter.prototype.execute = function() {
      var com;
      com = this.args[0];
      if (!(g.model.isReady() || __indexOf.call(this.commandsBeforeReady, com) >= 0)) {
        return;
      }
      return setTimeout(__bind(function() {
        while (this.times--) {
          this.commandTable[com](com, this.args.slice(1));
        }
      }, this), 0);
    };
    return CommandExecuter;
  })();
  g.CommandManager = (function() {
    CommandManager.prototype.keyQueue = {
      init: function() {
        this.a = "";
        this.times = "";
        this.timerId = 0;
        return this.waiting = false;
      },
      stopTimer: function() {
        if (this.waiting) {
          g.logger.d("stop timeout");
          clearTimeout(this.timerId);
          return this.waiting = false;
        }
      },
      startTimer: function(callback, ms) {
        if (this.waiting) {
          return;
        }
        this.waiting = true;
        return this.timerId = setTimeout(callback, ms);
      },
      queue: function(s) {
        if (s.search(/[0-9]/) >= 0 && this.a.length === 0) {
          this.times += s;
        } else {
          this.a += s;
        }
        return this;
      },
      reset: function() {
        this.a = "";
        this.times = "";
        return this.stopTimer();
      },
      isWaiting: function() {
        return this.waiting;
      },
      getTimes: function() {
        if (this.times.length > 0) {
          return parseInt(this.times, 10);
        } else {
          return 1;
        }
      },
      getNextKeySequence: function() {
        var ret;
        this.stopTimer();
        if (g.model.isValidKeySeq(this.a)) {
          ret = this.a;
          this.reset();
          return ret;
        } else {
          if (g.model.isValidKeySeqAvailable(this.a)) {
            this.startTimer(__bind(function() {
              this.a = "";
              this.times = "";
              return this.waiting = false;
            }, this), g.model.getSetting("commandWaitTimeOut"));
          } else {
            g.logger.d("invalid key sequence: " + this.a);
            this.reset();
          }
          return null;
        }
      }
    };
    function CommandManager() {
      this.keyQueue.init();
    }
    CommandManager.prototype.getCommandFromKeySeq = function(s, keyMap) {
      var keySeq;
      this.keyQueue.queue(s);
      keySeq = this.keyQueue.getNextKeySequence();
      if (keyMap && keySeq) {
        return keyMap[keySeq];
      } else {
        return null;
      }
    };
    CommandManager.prototype.reset = function() {
      return this.keyQueue.reset();
    };
    CommandManager.prototype.isWaitingNextKey = function() {
      return this.keyQueue.isWaiting();
    };
    CommandManager.prototype.handleKey = function(msg, keyMap) {
      var com, s, times;
      s = KeyManager.getKeyCodeStr(msg);
      times = this.keyQueue.getTimes();
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
          (new g.CommandExecuter).set(com, times).parse().execute();
          event.stopPropagation();
          return event.preventDefault();
      }
    };
    return CommandManager;
  })();
}).call(this);

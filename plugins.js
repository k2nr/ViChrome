(function() {
  var g, isBackground;

  if (this.vichrome == null) this.vichrome = {};

  g = this.vichrome;

  g.plugins = {};

  if (window.location.href.search(new RegExp(chrome.extension.getURL(''))) >= 0) {
    isBackground = true;
  } else {
    isBackground = false;
  }

  g.plugins.addCommand = function(a) {
    var _ref;
    if (a.context == null) {
      if (isBackground) {
        a.context = g.bg;
      } else {
        a.context = g.Mode;
      }
    }
    if (isBackground && a.context !== g.bg) throw "context must be vichrome.bg";
    if (a.func != null) {
      if (isBackground) {
        a.context["req" + a.name] = a.func;
      } else {
        a.context.prototype["req" + a.name] = a.func;
      }
    }
    if (!isBackground) {
      return g.CommandExecuter.prototype.commandTable[a.name] = (_ref = a.triggerType) != null ? _ref : "triggerInsideContent";
    }
  };

}).call(this);

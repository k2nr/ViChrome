(function() {
  var g;

  if (this.vichrome == null) this.vichrome = {};

  g = this.vichrome;

  setTimeout(function() {
    g.view = new g.Surface;
    g.handler = new g.EventHandler(g.model);
    return chrome.extension.sendRequest({
      command: "Init"
    }, function(msg) {
      return g.handler.onInitEnabled(msg);
    });
  }, 0);

}).call(this);

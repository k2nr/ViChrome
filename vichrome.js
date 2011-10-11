(function() {
  var g;
  g = this;
  setTimeout(function() {
    g.view = new g.Surface;
    g.handler = new g.EventHandler(g.model);
    return chrome.extension.sendRequest({
      command: "Settings",
      type: "get",
      name: "all"
    }, function(msg) {
      return g.handler.onInitEnabled(msg);
    });
  }, 0);
}).call(this);

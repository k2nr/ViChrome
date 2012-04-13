(function() {
  var g;

  if (this.vichrome == null) this.vichrome = {};

  g = this.vichrome;

  g.PluginManager = {
    init: function() {
      return this.plugins = JSON.parse(localStorage.getItem('plugins')) || {};
    },
    updatePlugin: function(plugin) {
      this.plugins[plugin.name] = plugin;
      return localStorage.setItem('plugins', JSON.stringify(this.plugins));
    },
    removePlugin: function(plugin) {
      if (this.plugins[plugin.name] != null) delete this.plugins[plugin.name];
      return localStorage.setItem('plugins', JSON.stringify(this.plugins));
    },
    loadPlugins: function(tabID, frameID) {
      var name, plugin, _ref;
      _ref = this.plugins;
      for (name in _ref) {
        plugin = _ref[name];
        if (!plugin.enabled) continue;
        if (plugin.background != null) {
          eval("(function(){" + plugin.background + "})();");
        }
        if (plugin.contentScript != null) {
          chrome.tabs.sendRequest(tabID, {
            command: "ExecuteScript",
            code: plugin.contentScript,
            frameID: frameID,
            allFrames: false
          });
        }
      }
    },
    getPlugins: function() {
      return this.plugins;
    }
  };

}).call(this);

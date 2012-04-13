this.vichrome ?= {}
g = this.vichrome

g.PluginManager = {
    init : ->
        @plugins = JSON.parse( localStorage.getItem('plugins') ) || {}

    updatePlugin : (plugin) ->
        @plugins[plugin.name] = plugin

        localStorage.setItem( 'plugins', JSON.stringify(@plugins) )

    removePlugin : (plugin) ->
        if @plugins[plugin.name]?
            delete @plugins[plugin.name]

        localStorage.setItem( 'plugins', JSON.stringify(@plugins) )

    loadPlugins : (tabID, frameID) ->
        for name, plugin of @plugins
            unless plugin.enabled then continue

            if plugin.background?
                eval("(function(){" + plugin.background + "})();")
            if plugin.contentScript?
                chrome.tabs.sendRequest(tabID,
                    command:   "ExecuteScript"
                    code:      plugin.contentScript
                    frameID:   frameID
                    allFrames: false)
        return

    getPlugins : -> @plugins
}


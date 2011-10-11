g = this
g.bg =
    tabHistory : null
    moveTab : (offset) ->
        chrome.tabs.getAllInWindow( null, (tabs) ->
            nTabs = tabs.length
            chrome.tabs.getSelected(null, (tab) ->
                idx = tab.index + offset
                if idx < 0
                    idx = nTabs - 1
                else if idx >= nTabs
                    idx = 0
                chrome.tabs.update( tabs[idx].id, selected:true )
            )
        )

    getSettings : (msg, response) ->
        sendMsg = {}
        sendMsg.name = msg.name

        if msg.name == "all"
            sendMsg.value = g.SettingManager.getAll()
        else
            sendMsg.value = g.SettingManager.get msg.name

        response sendMsg

    setSettings : (msg, response) -> g.SettingManager.set( msg.name, msg.value )

    #  Request Handlers
    reqSettings : (msg, response) ->
        if msg.type == "get"
            @getSettings( msg, response )
        else if msg.type == "set"
            @setSettings( msg, response )

        true

    getDefaultNewTabPage : ->
        switch g.SettingManager.get "defaultNewTab"
            when "home"   then return undefined
            when "newtab" then return "chrome://newtab"
            when "blank"  then return "about:blank"

    reqOpenNewTab : (req) ->
        urls   = []
        focus  = true
        pinned = false

        for arg in req.args
            switch arg
                when "-b","--background" then focus = false
                when "-p","--pinned" then pinned = true
                else urls.push( arg )

        len = urls.length
        if len == 0
            url = @getDefaultNewTabPage()
            chrome.tabs.create(url : url, selected : focus, pinned : pinned)
        else
            for url in urls
                chrome.tabs.create(url : url, selected : focus, pinned : pinned)

    reqOpenNewWindow : (req) ->
        urls  = []
        focus = true
        pop   = false

        for arg in req.args
            switch arg
                when "-b","--background" then focus = false
                when "-p","--pop" then pop = true
                else
                    if arg then urls.push( arg )

        if pop
            chrome.tabs.getSelected(null, (tab) ->
                if urls.length == 0
                    chrome.windows.create( focused : focus, tabId : tab.id )
                else
                    chrome.windows.create( url : urls, focused : focus, tabId : tab.id )
            )
        else
            if urls.length == 0 then urls = @getDefaultNewTabPage()
            chrome.windows.create( url : urls, focused : focus )

    reqCloseCurTab : ->
        chrome.tabs.getSelected(null, (tab) -> chrome.tabs.remove(tab.id) )

    reqMoveToNextTab : -> @moveTab( 1 )

    reqMoveToPrevTab : -> @moveTab( -1 )

    reqRestoreTab : (req) -> @tabHistory.restoreLastClosedTab()

    reqNMap : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        map = g.SettingManager.setNMap( req.args )
        msg = {}
        msg.command = "Settings"
        msg.name    = "keyMappingNormal"
        msg.value   = map
        sendResponse msg

        true

    reqIMap : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        map = g.SettingManager.setIMap( req.args );
        msg = {}
        msg.command = "Settings"
        msg.name    = "keyMappingInsert"
        msg.value   = map
        sendResponse(msg)

        true

    reqAlias : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        map = g.SettingManager.setAlias req.args
        msg = {}
        msg.command = "Settings"
        msg.name    = "aliases"
        msg.value   = map
        sendResponse msg

        true

    init : ->
        @tabHistory = (new g.TabHistory).init()
        g.SettingManager.init()

        chrome.extension.onRequest.addListener( (req, sender, sendResponse) =>
            if this["req"+req.command]
                if not this["req"+req.command]( req, sendResponse )
                    sendResponse()
            else g.logger.e("INVALID command!:", req.command)
        )


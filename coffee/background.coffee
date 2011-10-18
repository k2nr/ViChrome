g = this

g.bg =
    tabHistory : null
    moveTab : (offset, start) ->
        chrome.tabs.getAllInWindow( null, (tabs) ->
            nTabs = tabs.length
            chrome.tabs.getSelected(null, (tab) ->
                if start?
                    idx = start + offset
                else
                    idx = tab.index + offset

                if idx < 0
                    idx = nTabs + (idx % nTabs)
                else if idx >= nTabs
                    idx = idx % nTabs

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

        for arg in req.args then switch arg
            when "-b","--background" then focus  = false
            when "-p","--pinned"     then pinned = true
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

        for arg in req.args then switch arg
            when "-b","--background" then focus = false
            when "-p","--pop"        then pop   = true
            else urls.push( arg )

        if pop then chrome.tabs.getSelected(null, (tab) ->
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

    reqCloseAllTabs : (req) ->
        for arg in req.args then switch arg
            when "--only" then only = true

        chrome.tabs.getAllInWindow( null, (tabs) ->
            chrome.tabs.getSelected(null, (selected) ->
                for tab in tabs
                    unless only and selected.id == tab.id
                        chrome.tabs.remove( tab.id )
            )
        )

    reqMoveToNextTab : (req) ->
        if req.args?[0]?
            if req.args[0] < 0 then return
            @moveTab( parseInt( req.args[0] ) - 1, 0 )
        else
            @moveTab( 1 )

    reqMoveToPrevTab : (req) ->
        if req.args?[0]?
            @moveTab( -parseInt( req.args[0] ) )
        else
            @moveTab( -1 )

    reqMoveToFirstTab : (req) -> @moveTab( 0, 0 )
    reqMoveToLastTab  : (req) -> @moveTab( -1, 0 )

    reqRestoreTab    : (req) -> @tabHistory.restoreLastClosedTab()

    reqNMap : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        msg =
            command : "Settings"
            name    : "keyMappingNormal"
            value   : g.SettingManager.setNMap( req.args )

        sendResponse msg

        true

    reqIMap : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        msg =
            command : "Settings"
            name    : "keyMappingInsert"
            value   : g.SettingManager.setIMap( req.args );
        sendResponse msg

        true

    reqAlias : (req, sendResponse) ->
        unless req.args[0]? and req.args[1]? then return

        msg =
            command : "Settings"
            name    : "aliases"
            value   : g.SettingManager.setAlias req.args
        sendResponse msg

        true

    reqReadability : (req) ->
        chrome.tabs.getSelected( null, (tab)->
            chrome.extension.sendRequest("jggheggpdocamneaacmfoipeehedigia", {
                type   : "render"
                tab_id : tab.id
            })
        )


    reqPushSearchHistory : (req) ->
        unless req.value? then return

        history = JSON.parse( localStorage.getItem("_searchHistory") )
        history or= []

        if ( idx = history.indexOf(req.value) ) >= 0
            history.splice(idx, 1)

        history.push( req.value )
        if( history.length > 10 ) then history.shift()
        localStorage.setItem( "_searchHistory", JSON.stringify(history) )
        return

    reqGetSearchHistory : (req, sendResponse) ->
        history = JSON.parse( localStorage.getItem("_searchHistory") )
        msg =
            command : "GetSearchHistory"
            value   : history

        sendResponse msg
        true

    reqGetBookmark : (req, sendResponse) ->
        chrome.bookmarks.search(req.value, (nodes) -> sendResponse(nodes))
        true

    reqGetHistory : (req, sendResponse) ->
        chrome.history.search( {
            text : req.value
            maxResults : 5
        }, (items) -> sendResponse(items))
        true

    reqGetGoogleSuggest : (req, sendResponse) ->
        unless @gglLoaded
            sendResponse []
            return true

        @cWSrch.reset().sgst({
            kw  : req.value
            res : (res) -> sendResponse res.raw
        }).start()
        true

    reqGetWebSuggest : (req, sendResponse) ->
        unless @gglLoaded
            sendResponse []
            return true
        @cWSrch.init({
            type : "web"
            opt  : (obj) ->
                obj.setResultSetSize(google.search.Search.LARGE_RESULTSET)
        }).start()
        @cWSrch.reset().srch({
            type : "web"
            page : 1
            key : req.value
            res : (res) ->
                if !res or res.length <= 0
                    @cWSrch.cmndsBreak()
                    sendResponse []
                    return true

                msg = []
                for item, i in res
                    obj = {}
                    obj.titleNoFormatting = item.titleNoFormatting
                    obj.unescapedUrl = item.unescapedUrl
                    obj.url = item.url
                    msg.push obj

                sendResponse msg
        }).start()
        true

    reqGetTabList : (req, sendResponse) ->
        chrome.tabs.getAllInWindow( null, (tabs) ->
            sendResponse tabs
        )
        true
    reqOpenOptionPage : (req) ->
        for arg in req.args then switch arg
            when "-k","--key" then key = true
        req = {}
        req.args = []
        url = chrome.extension.getURL("options.html")
        url += "#keymapping" if key
        req.args.push url
        @reqOpenNewTab( req )

    init : ->
        @tabHistory = (new g.TabHistory).init()
        g.SettingManager.init()

        $WA = crocro.webAi
        @cWSrch   = new $WA.WebSrch()
        @cWSrch.ready( => @gglLoaded = true )

        chrome.extension.onRequest.addListener( (req, sender, sendResponse) =>
            if this["req"+req.command]
                if not this["req"+req.command]( req, sendResponse )
                    sendResponse()
            else g.logger.e("INVALID command!:", req.command)
        )

        storedVersion = localStorage.version
        if storedVersion? and storedVersion != g.VICHROME_VERSION
            req = {}
            req.args = []
            req.args.push "https://github.com/k2nr/ViChrome/wiki/Release-History"
            @reqOpenNewTab( req )

        localStorage.version = g.VICHROME_VERSION


this.vichrome ?= {}
g = this.vichrome

extendURL = (base) ->
    if base.search( /^javascript:/i ) >= 0
        return base

    if base.indexOf( "%clipboard" ) >= 0
        url = encodeURI( base.replace( /%clipboard/g, g.clipboard.get() ) )
    else
        url = encodeURI( base )

    if url.indexOf( "://" ) < 0
        url = "http://" + url

    return url

g.bg =
    tabHistory : null
    moveTab : (offset, start, callback) ->
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

                chrome.tabs.update( tabs[idx].id, selected: true, callback )
            )
        )


    getSettings : (msg) ->
        sendMsg = {}
        sendMsg.name = msg.name

        if msg.name == "all"
            sendMsg.value = g.SettingManager.getAll()
        else
            sendMsg.value = g.SettingManager.get msg.name

        sendMsg

    setSettings : (msg, response) ->
        g.SettingManager.set( msg.name, msg.value )
        return {}

    #  Request Handlers
    reqSettings : (msg, response) ->
        if msg.type == "get"
            response @getSettings( msg )
        else if msg.type == "set"
            response @setSettings( msg )
        true

    reqInit : (msg, response, sender) ->
        o = @getSettings( name : "all" )
        o.command = "Init"
        g.logger.d "frameID #{@tabHistory.getFrames(sender.tab)} added"
        o.frameID = @tabHistory.getFrames(sender.tab)
        @tabHistory.addFrames(sender.tab)
        response o
        true

    getDefaultNewTabPage : ->
        switch g.SettingManager.get "defaultNewTab"
            when "home"   then return undefined
            when "newtab" then return "chrome://newtab"
            when "blank"  then return "about:blank"

    reqTabOpenNew : (req) ->
        urls   = []
        focus  = true
        pinned = false

        for arg in req.args then switch arg
            when "-b","--background" then focus  = false
            when "-p","--pinned"     then pinned = true
            when "--next"            then next   = true
            else
                urls.push arg

        len = urls.length
        times = req.times ? 1
        chrome.tabs.getSelected(null, (tab) =>
            index = tab.index + 1 if next
            if len == 0
                url = @getDefaultNewTabPage()
                while times--
                    chrome.tabs.create(url: url, selected: focus, pinned: pinned, index: index)
            else
                while times--
                    for url in urls
                        chrome.tabs.create(url: extendURL( url ), selected: focus, pinned: pinned, index: index)
            return
        )
        false

    reqCopy : (req) ->
        chrome.tabs.getSelected(null, (tab) ->
            data = req.args[0].replace( /%url/g, tab.url )
                          .replace( /%title/g, tab.title )

            c = data.charAt(0)
            if c == "'" or c == "\""
                if data.charAt( data.length-1 ) == c
                    data = data.substr( 1, data.length-2 )

            g.clipboard.set( data )
        )

    reqWinOpenNew : (req) ->
        urls  = []
        focus = true
        pop   = false

        for arg in req.args then switch arg
            when "-b","--background" then focus = false
            when "-p","--pop"        then pop   = true
            else urls.push( arg.replace( /%url/g, g.view.getHref() ) )

        if pop then chrome.tabs.getSelected(null, (tab) ->
            if urls.length == 0
                chrome.windows.create( focused : focus, tabId : tab.id )
            else
                chrome.windows.create( url : urls, focused : focus, tabId : tab.id )
            )
        else
            if urls.length == 0 then urls = @getDefaultNewTabPage()
            chrome.windows.create( url : urls, focused : focus )
        false

    reqTabCloseCurrent : (req) ->
        for arg in req.args then switch arg
            when "--focusprev" then prev = true

        chrome.tabs.getSelected(null, (tab) =>
            if prev and tab.index > 0
                @moveTab(-1, tab.index, -> chrome.tabs.remove(tab.id))
            else
                chrome.tabs.remove(tab.id)
        )
        false

    reqTabCloseAll : (req) ->
        for arg in req.args then switch arg
            when "--only" then only = true

        if only
            chrome.tabs.getAllInWindow( null, (tabs) ->
                chrome.tabs.getSelected(null, (selected) ->
                    for tab in tabs
                        unless selected.id == tab.id
                            chrome.tabs.remove( tab.id )
                    return
                )
            )
        else
            chrome.windows.getCurrent( (win) ->
                chrome.windows.remove( win.id )
            )
        false

    reqTabReloadAll : (req) ->
        g.tabs?.reloadAllTabs?()
        false

    reqTabFocusNext : (req) ->
        if req.args?[0]?
            if req.args[0] <= 0 then return
            @moveTab( parseInt( req.args[0] ) - 1, 0 )
        else
            if req.timesSpecified and req.times > 0
                @moveTab( req.times-1, 0 )
            else
                @moveTab( 1 )
        false

    reqTabFocusPrev : (req) ->
        times = if req.times then req.times else 1
        if req.args?[0]?
            @moveTab( -parseInt( req.args[0] ) )
        else
            @moveTab( -times )
        false

    reqTabFocusNextHistory : (req) ->
        @tabSelHist.moveForward()
        false

    reqTabFocusPrevHistory : (req) ->
        @tabSelHist.moveBackward()
        false

    reqTabSwitchLast : (req) ->
        @tabSelHist.switchToLast()
        false

    reqTabFocusFirst : (req) ->
        @moveTab( 0, 0 )
        false

    reqTabFocusLast  : (req) ->
        @moveTab( -1, 0 )
        false

    reqRestoreTab    : (req) ->
        @tabHistory.restoreLastClosedTab()
        false

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
        false


    reqPushSearchHistory : (req) ->
        unless req.value? then return

        history = JSON.parse( localStorage.getItem("_searchHistory") )
        history or= []

        if ( idx = history.indexOf(req.value) ) >= 0
            history.splice(idx, 1)

        history.push( req.value )
        if( history.length > 10 ) then history.shift()
        localStorage.setItem( "_searchHistory", JSON.stringify(history) )
        false

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
        unless @gglLoaded then return false

        if @cWSrch.isExec then return false
        @cWSrch.reset().sgst({
            kw  : req.value
            hl : g.util.getLang()
            res : (res) -> sendResponse res.raw
        }).start()
        true

    reqGetWebSuggest : (req, sendResponse) ->
        unless @gglLoaded then return false
        if @cWSrch.isExec then return false
        @cWSrch.init({
            type : "web"
            opt  : (obj) ->
                obj.setResultSetSize(google.search.Search.LARGE_RESULTSET)
        }).start()
        @cWSrch.reset().srch({
            type : "web"
            page : 1
            key : req.value
            res : (res) =>
                if !res or res.length <= 0
                    @cWSrch.cmndsBreak()
                    sendResponse()
                    return

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
        req.times = 1
        url = chrome.extension.getURL("options.html")
        url += "#keymapping" if key
        req.args.push url
        @reqTabOpenNew( req )

    reqTopFrame : (req, response, sender) ->
        req.command = req.innerCommand
        req.frameID = @tabHistory.getTopFrameID(sender.tab)

        if req.frameID?
            chrome.tabs.sendRequest( sender.tab.id, req )
        else
            g.logger.e "Can't send request to top frame: frame ID is invalid"
            o = {}
            o.error = true
            o.errorMsg = "Something's wrong. Try to reload page"

            response o
            return true
        false

    reqPassToFrame : (req, response, sender) ->
        req.command = req.innerCommand
        chrome.tabs.sendRequest( sender.tab.id, req )
        false

    reqSendToCommandBox : (req, response, sender) ->
        req.command = req.innerCommand
        req.frameID = @tabHistory.getCommandBoxID(sender.tab)

        if req.frameID?
            chrome.tabs.sendRequest( sender.tab.id, req )
        else
            g.logger.e "Can't send request to command box: frame ID is invalid"
            o = {}
            o.error = true
            o.errorMsg = "Can't open commandbox. Try to reload page"

            response o
            return true

        false

    reqGetCommandTable : (req, response, sender) ->
        req.frameID = @tabHistory.getTopFrameID(sender.tab)
        chrome.tabs.sendRequest( sender.tab.id, req, (msg) ->
            response msg
        )
        true

    reqGetAliases : (req, response, sender) ->
        req.frameID = @tabHistory.getTopFrameID(sender.tab)
        chrome.tabs.sendRequest( sender.tab.id, req, (msg) ->
            response msg
        )
        true

    reqGetClipboard : (req, response, sender) ->
        response( g.clipboard.get() )
        true

    reqExtendURL : (req, response, sender) ->
        response( extendURL( req.url ) )
        true

    init : ->
        @tabHistory = (new g.TabHistory).init()
        @tabSelHist = (new g.TabSelectionHistory).init()
        g.SettingManager.init()

        $WA = crocro.webAi
        @cWSrch   = new $WA.WebSrch()
        @cWSrch.ready( => @gglLoaded = true )

        chrome.extension.onRequest.addListener( (req, sender, sendResponse) =>
            g.logger.d "onRequest command: #{req.command}"
            switch req.command
                when "NotifyTopFrame"
                    g.logger.d "top frame #{req.frameID}"
                    @tabHistory.setTopFrameID(sender.tab, req.frameID)
                    sendResponse()
                when "InitCommandFrame"
                    msg = {}
                    frameID = @tabHistory.getFrames(sender.tab)
                    @tabHistory.setCommandBoxID(sender.tab, frameID)
                    @tabHistory.addFrames(sender.tab)
                    g.logger.d "commandBoxFrameID: #{frameID}"
                    msg.frameID = frameID
                    msg.enableCompletion   = g.SettingManager.get "enableCompletion"
                    msg.commandBoxWidth    = g.SettingManager.get "commandBoxWidth"
                    msg.commandBoxAlign    = g.SettingManager.get "commandBoxAlign"
                    msg.commandWaitTimeOut = g.SettingManager.get "commandWaitTimeOut"

                    sendResponse msg
                else
                    if this["req"+req.command]
                        if not this["req"+req.command]( req, sendResponse, sender )
                            sendResponse()
                    else g.logger.e("INVALID command!:", req.command)
        )

        if g.SettingManager.get "notifyUpdateSucceeded"
            storedVersion = localStorage.version
            if storedVersion? and storedVersion != g.VICHROME_VERSION
                req = {}
                req.args = ["https://github.com/k2nr/ViChrome/wiki/Release-History"]
                @reqTabOpenNew( req )

        localStorage.version = g.VICHROME_VERSION


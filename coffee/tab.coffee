this.vichrome ?= {}
g = this.vichrome

class g.TabSelectionHistory
    init : ->
        @array  = []
        @curPos = 0

        chrome.tabs.onSelectionChanged.addListener( (tabId, info) =>
            g.logger.d "selhist selChanged id:" + tabId, this
            if @array[@curPos]?.id == tabId
                return

            @array.splice( @curPos+1 )
            for elem,i in @array
                if elem.id == tabId
                    @array.splice( i, 1 )
                    break

            @array.push {id:tabId, info:info}
            @curPos = @array.length - 1
        )

        chrome.tabs.onRemoved.addListener( (tabId, info) =>
            g.logger.d "selhist tab removed id:" + tabId, this
            for elem,i in @array
                if elem.id == tabId
                    @array.splice( i, 1 )
                    @curPos-- if @curPos >= i
                    break
        )
        this

    moveBackward : ->
        unless @array.length > 0 then return
        if @curPos > 0
            --@curPos
        else
            @curPos = @array.length - 1

        chrome.tabs.update( @array[@curPos].id, selected:true )
        this

    moveForward  : ->
        unless @array.length > 0 then return
        if @curPos < @array.length - 1
            ++@curPos
        else
            @curPos = 0

        chrome.tabs.update( @array[@curPos].id, selected:true )
        this

    switchToLast : ->
        unless @array.length > 0 then return
        unless @curPos > 0       then return

        chrome.tabs.update( @array[@curPos-1].id, selected:true )

class g.TabHistory
    closeHistStack : []
    openTabs : {}
    findOpenTabItem : (tabId) ->
        for win,tabs of @openTabs
            if tabs[tabId] then return tabs[tabId]

    popOpenTabItem : (tabId) ->
        for win,tabs of @openTabs
            if tabs[tabId]
                result = tabs[tabId]
                tabs[tabId] = undefined
                return result
        return

    addOpenTabItem : (tab, history) ->
        @openTabs[tab.windowId][tab.id] = {}
        @openTabs[tab.windowId][tab.id].tab = tab
        @openTabs[tab.windowId][tab.id].frames = 0
        if history
            @openTabs[tab.windowId][tab.id].history = history
        else
            @openTabs[tab.windowId][tab.id].history = []
            @openTabs[tab.windowId][tab.id].history.push( tab.url )
    setTopFrameID   : (tab, id) ->
        if @openTabs[tab.windowId]?[tab.id]?
            @openTabs[tab.windowId][tab.id].topFrame = id
    getTopFrameID   : (tab)     -> @openTabs[tab.windowId]?[tab.id]?.topFrame
    setCommandBoxID : (tab, id) ->
        if @openTabs[tab.windowId]?[tab.id]?
            @openTabs[tab.windowId][tab.id].comBoxID = id
    getCommandBoxID : (tab)     -> @openTabs[tab.windowId]?[tab.id]?.comBoxID
    setFrames       : (tab, frames) ->
        if @openTabs[tab.windowId]?[tab.id]?
            @openTabs[tab.windowId][tab.id].frames = frames
    addFrames       : (tab)     ->
        if @openTabs[tab.windowId]?[tab.id]?
            ++@openTabs[tab.windowId][tab.id].frames
    getFrames       : (tab)     -> @openTabs[tab.windowId]?[tab.id]?.frames

    initTabHist : (winId) ->
        chrome.windows.getAll( {populate : true}, (wins) =>
            for win in wins
                @openTabs[win.id] = {}
                for tab in win.tabs
                    @addOpenTabItem tab
        )

    setupListeners : ->
        chrome.tabs.onRemoved.addListener( (tabId, info) =>
            g.logger.d "tab removed id:" + tabId
            if info.isWindowClosing then return

            item = @popOpenTabItem( tabId )

            if item
                @closeHistStack.push( item )
                if @closeHistStack.length > 10 then @closeHistStack.shift()
                return
        )

        chrome.tabs.onCreated.addListener( (tab) =>
            g.logger.d "tab created id:" + tab.id
            @addOpenTabItem tab
        )

        chrome.tabs.onAttached.addListener( (tabId, aInfo) =>
            g.logger.d "tab attached tab:#{tabId} -> win:#{aInfo.newWindowId}"
            chrome.tabs.get( tabId, (tab) =>
                @addOpenTabItem( tab )
            )
        )

        chrome.tabs.onDetached.addListener( (tabId, dInfo) =>
            g.logger.d "tab detached tab:#{tabId} <- win:#{dInfo.oldWindowId}"
            @popOpenTabItem tabId
        )

        chrome.tabs.onUpdated.addListener( (tabId, info, tab) =>
            target = @openTabs[tab.windowId][tabId]
            if info.url
                target.tab.url = info.url
                target.history.push info.url
            if info.pinned
                target.tab.pinned = info.pinned
        )

        chrome.windows.onCreated.addListener( (win) =>
            g.logger.d "win created id:" + win.id
            @openTabs[win.id] = {}
        )

        chrome.windows.onRemoved.addListener( (winId) =>
            delete @openTabs[winId]
        )
        return this

    init : ->
        @initTabHist()
        @setupListeners()
        return this

    restoreLastClosedTab : ->
        item = @closeHistStack.pop()
        while item? and not @openTabs[item.tab.windowId]
            item = @closeHistStack.pop()

        unless item? then return

        chrome.windows.update( item.tab.windowId, { focused : true } )
        opt = { windowId : item.tab.windowId, url : item.tab.url }
        chrome.tabs.create( opt, (tab) => )


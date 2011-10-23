g = this

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
    setTopFrameID : (tab, id) -> @openTabs[tab.windowId][tab.id].topFrame = id
    getTopFrameID : (tab) -> @openTabs[tab.windowId][tab.id].topFrame
    setCommandBoxID : (tab, id) -> @openTabs[tab.windowId][tab.id].comBoxID = id
    getCommandBoxID : (tab) -> @openTabs[tab.windowId][tab.id].comBoxID
    setFrames : (tab, frames) -> @openTabs[tab.windowId][tab.id].frames = frames
    addFrames : (tab) -> ++@openTabs[tab.windowId][tab.id].frames
    getFrames : (tab) -> @openTabs[tab.windowId][tab.id]?.frames

    initTabHist : (winId) ->
        chrome.windows.getAll( {populate : true}, (wins) =>
            for win in wins
                @openTabs[win.id] = {}
                for tab in win.tabs
                    @addOpenTabItem tab
        )

    setupListeners : ->
        chrome.tabs.onRemoved.addListener( (tabId, info) =>
            logger.d "tab removed id:" + tabId
            if info.isWindowClosing then return

            item = @popOpenTabItem( tabId )

            if item
                @closeHistStack.push( item )
                if @closeHistStack.length > 10 then @closeHistStack.shift()
                return
        )

        chrome.tabs.onCreated.addListener( (tab) =>
            logger.d "tab created id:" + tab.id
            @addOpenTabItem tab
        )

        chrome.tabs.onAttached.addListener( (tabId, aInfo) =>
            logger.d "tab attached tab:#{tabId} -> win:#{aInfo.newWindowId}"
            chrome.tabs.get( tabId, (tab) =>
                @addOpenTabItem( tab )
            )
        )

        chrome.tabs.onDetached.addListener( (tabId, dInfo) =>
            logger.d "tab detached tab:#{tabId} <- win:#{dInfo.oldWindowId}"
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
            logger.d "win created id:" + win.id
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


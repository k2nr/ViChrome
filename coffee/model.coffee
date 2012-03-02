this.vichrome ?= {}
g = this.vichrome

getNMapFirst = ->
    nmap    = g.object( @getSetting "keyMappingNormal" )
    pageMap = @getSetting "pageMap"

    unless g.view.getHref()?.length > 0
        return nmap

    myMap = nmap
    for url,map of pageMap
        if @isUrlMatched( g.view.getHref(), url )
            g.extend( map.nmap, myMap )

    @getNMap = -> myMap
    myMap

getIMapFirst = ->
    imap    = g.object( @getSetting "keyMappingInsert" )
    pageMap = @getSetting "pageMap"

    unless g.view.getHref()?.length > 0
        return imap

    myMap = imap
    for url,map of pageMap
        if @isUrlMatched( g.view.getHref(), url )
            g.extend( map.imap, myMap )

    @getIMap = -> myMap
    myMap

getCMapFirst = ->
    cmap    = g.object( @getSetting "keyMappingCommand" )
    pageMap = @getSetting "pageMap"

    unless g.view.getHref()?.length > 0
        return cmap

    myMap = cmap
    for url,map of pageMap
        if @isUrlMatched( g.view.getHref(), url )
            g.extend( map.cmap, myMap )

    @getCMap = -> myMap
    myMap

getEMapFirst = ->
    emap    = g.object( @getSetting "keyMappingEmergency" )
    pageMap = @getSetting "pageMap"

    unless g.view.getHref()?.length > 0
        return emap

    myMap = emap
    for url,map of pageMap
        if @isUrlMatched( g.view.getHref(), url )
            g.extend( map.emap, myMap )

    @getEMap = -> myMap
    myMap

getAliasFirst = ->
    aliases = g.object( @getSetting "aliases" )
    pageMap = @getSetting "pageMap"

    unless g.view.getHref()?.length > 0
        return aliases

    myAlias = aliases
    for url,map of pageMap
        if @isUrlMatched( g.view.getHref(), url )
            g.extend( map.alias, myAlias )

    @getAlias = -> myAlias
    myAlias


g.model =
    initEnabled  : false
    domReady     : false
    disAutoFocus : false
    searcher     : null
    pmRegister   : null
    curMode      : null
    settings     : null
    frameID      : 0

    changeMode   :(newMode) ->
        if @curMode? then @curMode.exit()
        @curMode = newMode
        @curMode.enter()
        @commandManager?.setUseNumPrefix( @curMode.getUseNumPrefix() )

    init : ->
        @enterNormalMode()
        @commandManager = new g.CommandManager( this, @getSetting "commandWaitTimeOut" )
        @pmRegister     = new g.PageMarkRegister

    isReady : -> @initEnabled and @domReady

    setPageMark : (key) ->
        mark =
            top  : window.pageYOffset
            left : window.pageXOffset

        @pmRegister.set mark, key

    goPageMark : (key) ->
        offset = @pmRegister.get key
        if offset then g.view.scrollTo offset.left, offset.top

    setSearcher : (@searcher) ->

    cancelSearchHighlight : -> @searcher?.cancelHighlight()

    enterNormalMode : ->
        g.logger.d "enterNormalMode"
        @changeMode new g.NormalMode

    enterInsertMode : ->
        g.logger.d "enterInsertMode"
        @changeMode new g.InsertMode
    enterEmergencyMode : ->
        g.logger.d "enterEmergencyMode"
        @changeMode new g.EmergencyMode

    enterCommandMode : (executer, sources)->
        mode = new g.CommandMode
        mode.setExecuter(executer).setSources(sources)

        g.logger.d "enterCommandMode"
        @cancelSearchHighlight()
        @changeMode mode

    enterSearchMode : (backward, searcher_) ->
        @searcher = searcher_ ? new g.NormalSearcher

        g.logger.d "enterSearchMode"

        @changeMode( (new g.SearchMode).init( @searcher, backward ) )
        @setPageMark();

    enterFMode : (opt) ->
        g.logger.d "enterFMode"
        @changeMode( (new g.FMode).setOption( opt ) )

    isInNormalMode    : -> @curMode.getName() == "NormalMode"
    isInInsertMode    : -> @curMode.getName() == "InsertMode"
    isInSearchMode    : -> @curMode.getName() == "SearchMode"
    isInCommandMode   : -> @curMode.getName() == "CommandMode"
    isInFMode         : -> @curMode.getName() == "FMode"
    isInEmergencyMode : -> @curMode.getName() == "EmergencyMode"

    goNextSearchResult : (reverse) ->
        unless @searcher? then return

        @setPageMark()
        @searcher.goNext reverse

    getNMap  : getNMapFirst
    getIMap  : getIMapFirst
    getCMap  : getCMapFirst
    getEMap  : getEMapFirst
    getAlias : getAliasFirst

    getSetting : (name) -> @settings[name]

    escape : ->
        @commandManager.reset()
        g.view.hideStatusLine()
        unless @isInNormalMode() then @enterNormalMode()

    onBlur : (target) -> @curMode.blur( target )

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        @disAutoFocus = false
        @curMode.prePostKeyEvent(key, ctrl, alt, meta)

    isValidKeySeq : (keySeq) ->
        if @getKeyMapping()[keySeq]
            return true
        else
            return false

    isValidKeySeqAvailable : (keySeq) ->
        # since escaping meta character for regexp is so complex that
        # using regexp to compare should cause bugs, using slice & comparison
        # with '==' may be a better & simple way.
        keyMapping = @getKeyMapping()
        length     = keySeq.length

        for seq, command of keyMapping
            cmpStr = seq.slice( 0, length )
            pos    = cmpStr.indexOf("<", 0)
            if pos >= 0
                pos = seq.indexOf( ">", pos )
                if pos >= length
                    cmpStr = seq.slice( 0, pos+1 )
            if keySeq == cmpStr
                return true

        false

    isUrlMatched : (url, matchPattern) ->
        str = matchPattern.replace(/\*/g, ".*" )
                          .replace(/\/$/g, "")
                          .replace(/\//g, "\\/")
        str = "^" + str + "$"
        url = url.replace(/\/$/g, "")

        regexp = new RegExp(str, "m")
        if regexp.test( url )
            g.logger.d "URL pattern matched:#{url}:#{matchPattern}"
            return true
        false

    isEnabled : ->
        urls = @getSetting "ignoredUrls"

        for url in urls
            if @isUrlMatched g.view.getHref(), url
                g.logger.d "matched ignored list"
                return false
        true

    handleKey : (msg) -> @commandManager.handleKey msg, @getKeyMapping()

    triggerCommand : (method, args, times, timesSpecified) ->
        if @curMode[method]?
            @curMode[method]( args, times, timesSpecified )
        else
            g.logger.e "INVALID command!:", method

    onSettings : (msg) ->
        if msg.name == "all"
            @settings = msg.value
        else
            @settings[msg.name] = msg.value

        unless @isEnabled()
            @settings.keyMappingNormal = {}
            @settings.keyMappingInsert = {}

        switch msg.name
            when "keyMappingNormal"  then @getNMap = getNMapFirst
            when "keyMappingInsert"  then @getIMap = getIMapFirst
            when "keyMappingCommand" then @getCMap = getCMapFirst
            when "keyMappingEmergency" then @getEMap = getEMapFirst
            when "aliases" then @getAlias = getAliasFirst

    onFocus : (target) ->
        if @isInCommandMode() or @isInSearchMode() or @isInEmergencyMode()
            g.logger.d "onFocus:nothing should be done in the cur mode"
            return

        if @disAutoFocus
            setTimeout( ( => @disAutoFocus = false ) , 500)
            @enterNormalMode()
            g.view.blurActiveElement()
            return

        if g.util.isEmbededFlash target
            @enterEmergencyMode()
        else if g.util.isEditable target
            @enterInsertMode()
        else
            @enterNormalMode()

    onMouseDown : (e) ->
        @disAutoFocus = false;

    getKeyMapping : -> @curMode.getKeyMapping()

    onInitEnabled : ( msg ) ->
        g.logger.d "onInitEnabled"
        @onSettings msg
        @disAutoFocus = @getSetting "disableAutoFocus"
        @init()
        @frameID = msg.frameID
        @initEnabled = true
        if top?
            chrome.extension.sendRequest( {
                command : "NotifyTopFrame"
                frameID : @frameID
            } )
        if @domReady then @onDomReady()

    onDomReady : ->
        g.logger.d "onDomReady"
        @domReady = true

        if not @initEnabled
            g.logger.w "onDomReady is called before onInitEnabled"
            return

        g.view.init()

        g.logger.d("disAutoFocus", @disAutoFocus)
        if g.util.isEditable( document.activeElement ) and not @disAutoFocus
            @enterInsertMode()
        else
            g.view.blurActiveElement()
            @enterNormalMode()

    openCommandBox : (param) ->
        if top?
            param.command      = "SendToCommandBox"
            g.view.showCommandFrame()
        else
            param.command      = "TopFrame"
        param.innerCommand = 'OpenCommandBox'

        param.sender  ?= @frameID
        param.keyMap  ?= g.extendDeep( @getCMap() )
        param.aliases ?= g.extendDeep( @getAlias() )
        chrome.extension.sendRequest( param, (msg)-> g.handler.onCommandResponse(msg) )

$(document).ready( ->
    g.model.onDomReady()
)


g = this

getNMapFirst = ->
    nmap    = g.object( @getSetting "keyMappingNormal" )
    pageMap = @getSetting "pageMap"

    unless window.location.href?.length > 0
        return nmap

    myMap = nmap
    for url,map of pageMap
        if @isUrlMatched( window.location.href, url )
            g.extend( map.nmap, myMap )

    @getNMap = -> myMap
    myMap

getIMapFirst = ->
    imap    = g.object( @getSetting "keyMappingInsert" )
    pageMap = @getSetting "pageMap"

    unless window.location.href?.length > 0
        return nmap

    myMap = imap
    for url,map of pageMap
        if @isUrlMatched( window.location.href, url )
            g.extend( map.imap, myMap )

    @getIMap = -> myMap
    myMap

getCMapFirst = ->
    cmap    = g.object( @getSetting "keyMappingCommand" )
    pageMap = @getSetting "pageMap"

    unless window.location.href?.length > 0
        return nmap

    myMap = cmap
    for url,map of pageMap
        if @isUrlMatched( window.location.href, url )
            g.extend( map.cmap, myMap )

    @getIMap = -> myMap
    myMap

getAliasFirst = ->
    aliases = g.object( @getSetting "aliases" )
    pageMap = @getSetting "pageMap"

    unless window.location.href?.length > 0
        return nmap

    myAlias = aliases
    for url,map of pageMap
        if @isUrlMatched( window.location.href, url )
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

    changeMode   :(newMode) ->
        if @curMode? then @curMode.exit()
        @curMode = newMode
        @curMode.enter()

    init : ->
        @enterNormalMode()
        @commandManager = new g.CommandManager
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

    enterCommandMode : (executer, sources)->
        mode = new g.CommandMode
        mode.setExecuter( executer ) if executer?
        mode.setSources(sources) if sources?

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

    isInNormalMode  : -> @curMode.getName() == "NormalMode"
    isInInsertMode  : -> @curMode.getName() == "InsertMode"
    isInSearchMode  : -> @curMode.getName() == "SearchMode"
    isInCommandMode : -> @curMode.getName() == "CommandMode"
    isInFMode       : -> @curMode.getName() == "FMode"

    goNextSearchResult : (reverse) ->
        unless @searcher? then return

        @setPageMark()
        @searcher.goNext reverse

    getNMap  : getNMapFirst
    getIMap  : getIMapFirst
    getCMap  : getCMapFirst
    getAlias : getAliasFirst

    getSetting : (name) -> @settings[name]

    escape : ->
        @commandManager.reset()
        g.view.hideStatusLine()
        unless @isInNormalMode() then @enterNormalMode()

    onBlur : -> @curMode.blur()

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
            if @isUrlMatched window.location.href, url
                g.logger.d "matched ignored list"
                return false
        true

    handleKey : (msg) -> @commandManager.handleKey msg, @getKeyMapping()

    triggerCommand : (method, args) ->
        if @curMode[method]?
            @curMode[method]( args )
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
            when "aliases" then @getAlias = getAliasFirst

    onFocus : (target) ->
        if @isInCommandMode() or @isInSearchMode()
            g.logger.d "onFocus:current mode is command or search.do nothing"
            return

        if @disAutoFocus
            setTimeout( ( => @disAutoFocus = false ) , 500)
            @enterNormalMode()
            g.view.blurActiveElement()
        else
            if g.util.isEditable target
                @enterInsertMode()
            else
                @enterNormalMode()

    getKeyMapping : -> @curMode.getKeyMapping()

    onInitEnabled : ( msg ) ->
        g.logger.d "onInitEnabled"
        @onSettings msg
        @disAutoFocus = @getSetting "disableAutoFocus"
        @init()
        @initEnabled = true
        if @domReady then @onDomReady()

    onDomReady : ->
        g.logger.d "onDomReady"
        @domReady = true

        if not @initEnabled
            g.logger.w "onDomReady is called before onInitEnabled"
            return

        g.view.init()

        if g.util.isEditable( document.activeElement ) and not @disAutoFocus
            @enterInsertMode()
        else
            @enterNormalMode()

$(document).ready( => g.model.onDomReady() )


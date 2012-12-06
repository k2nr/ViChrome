this.vichrome ?= {}
g = this.vichrome

class g.Mode
    exit  : ->
    enter : ->
    getUseNumPrefix : -> false
    enterInteractiveOpen : (baseCom, opt)->
        dscr = baseCom
        sources = []
        if opt.bookmark
            dscr += " Bookmark"
            sources.push( class : "CandSourceBookmark" )
        if opt.history
            dscr += " History"
            sources.push( class : "CandSourceHistory" )
        if opt.web
            dscr += " Web"
            sources.push( class : "CandSourceWebSuggest" )

        if !opt.bookmark and !opt.history and !opt.web
            if opt.search
                baseCom += " g"
                dscr += " Google Search"
                sources = [
                    { class : "CandSourceGoogleSuggest" }
                ]
            else
                sources = [
                    { class: "CandSourceGoogleSuggest", num: 3, reqPrefix: true }
                    { class: "CandSourceWebSuggest", num: 3 }
                    { class: "CandSourceBookmark", num: 3 }
                    { class: "CandSourceHistory", num: 3 }
                ]

        executer = (new g.CommandExecuter).setDescription(dscr).set(baseCom)
        g.model.enterCommandMode( executer, sources )

    reqOpen : (args) ->
        urls = []
        for arg in args then switch arg
            when "-i" then interactive = true
            when "-b" then bookmark    = true
            when "-w" then web         = true
            when "-h" then history     = true
            when "-g","g"  then search = true
            else
                urls.push arg.replace( /%url/g, g.view.getHref() )

        if interactive or bookmark or history or web
            opt =
                bookmark : bookmark
                history  : history
                web      : web
                search   : search
            com = "Open" + urls.join(' ')
            @enterInteractiveOpen( com, opt )
        else if search
            word = ""
            word += "+" + encodeURIComponent(i) for i in urls
            word = word.substr(1)

            url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + word + "&qscrl=1"
            g.view.open( url, "_self" )

        else
            chrome.extension.sendRequest {command: "ExtendURL", url: urls[0]}, (url) ->
                g.view.open( url, "_self" )

    reqTabOpenNew : (args, times) ->
        words = []
        times = 1 if times > 10 # prevent pluto force attack
        for arg in args then switch arg
            when "-i"      then interactive = true
            when "-b"      then bookmark    = true
            when "-w"      then web         = true
            when "-h"      then history     = true
            when "-g","g"  then search      = true
            else
                words.push arg.replace( /%url/g, g.view.getHref() )

        if interactive or bookmark or history or web
            opt =
                bookmark : bookmark
                history  : history
                web      : web
                search   : search
            com = "TabOpenNew " + words.join(' ')
            @enterInteractiveOpen( com, opt )
        else if search
            word = ""
            word += "+" + encodeURIComponent(i) for i in words
            word = word.substr(1)

            url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + word + "&qscrl=1"
            chrome.extension.sendRequest({command : "TabOpenNew", args : [url], times : times}, g.handler.onCommandResponse)
        else
            chrome.extension.sendRequest({command: "TabOpenNew", args: words, times: times, extend: true}, g.handler.onCommandResponse)

    blur : ->
    reqScrollDown   : (args, times) -> g.view.scrollBy( 0,  g.model.getSetting("scrollPixelCount") * times )
    reqScrollUp     : (args, times) -> g.view.scrollBy( 0, -g.model.getSetting("scrollPixelCount") * times )
    reqScrollLeft   : (args, times) -> g.view.scrollBy( -g.model.getSetting("scrollPixelCount") * times, 0 )
    reqScrollRight  : (args, times) -> g.view.scrollBy(  g.model.getSetting("scrollPixelCount") * times, 0 )
    reqPageHalfDown : (args, times) -> g.view.scrollHalfPage( hor :  0, ver :  times )
    reqPageHalfUp   : (args, times) -> g.view.scrollHalfPage( hor :  0, ver : -times )
    reqPageDown     : (args, times) -> g.view.scrollHalfPage( hor :  0, ver :  2*times )
    reqPageUp       : (args, times) -> g.view.scrollHalfPage( hor :  0, ver : -2*times )
    reqGoTop : ->
        g.model.setPageMark()
        g.view.goTop()

    reqGoBottom : ->
        g.model.setPageMark()
        g.view.goBottom()

    reqBackHist    : -> g.view.backHist()
    reqForwardHist : -> g.view.forwardHist()
    reqTabReload   : -> g.view.reload()
    reqGoSearchModeForward  : -> g.model.enterSearchMode( false )
    reqGoSearchModeBackward : -> g.model.enterSearchMode( true )
    reqGoLinkTextSearchMode : -> g.model.enterSearchMode( false, new g.LinkTextSearcher )
    reqGoEmergencyMode : -> g.model.enterEmergencyMode()

    reqBackToPageMark : ->
        # TODO:enable to go any pagemark, not only unnamed.
        g.model.goPageMark()

    reqEscape : ->
        g.view.blurActiveElement()
        g.model.escape()
        @escape?()

    reqGoFMode : (args) ->
        for arg in args then switch arg
            when "--newtab" then newTab = true
            when "--continuous" then continuous = true

        opt = { newTab : newTab, continuous : continuous }
        g.model.enterFMode( opt )


    reqGoCommandMode : (args) ->
        sources = [
            { class : "CandSourceCommand" }
            { class : "CandSourceAlias" }
        ]
        g.model.enterCommandMode( new g.CommandExecuter, sources )


    reqFocusOnFirstInput : (args, times) ->
        g.model.setPageMark()
        g.view.focusInput( times-1 )

    reqTabList : ->
        sources = [
            { class : "CandSourceTabs" }
        ]
        executer = (new g.CommandExecuter)
                   .set("MoveToNextTab")
                   .setDescription("TabList")

        g.model.enterCommandMode( executer, sources )

    reqBarrelRoll : ->
        $(document.body).addClass('vichrome-barrelroll')
        setTimeout( ->
            $(document.body).removeClass('vichrome-barrelroll')
        , 2000 )

    reqHideJimmy : -> $("div#centralNotice").hide()

    reqToggleImageSize : ->
        if document.images.length == 1
            evt = document.createEvent('MouseEvents')
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            document.images[0].dispatchEvent(evt)

    req_ChangeLogLevel : (args) ->
        if not args or args.length < 1 then return

        if g.logLevels[args[0]]?
            g.LOG_LEVEL = g.logLevels[args[0]]
        else
            g.view.setStatusLineText "log level '#{args[0]}' doesn't exist", 2000

    getKeyMapping : -> g.model.getNMap()

class g.NormalMode extends g.Mode
    getName : -> "NormalMode"
    getUseNumPrefix : -> true
    prePostKeyEvent : (key, ctrl, alt, meta) -> true
    escape : ->
        g.model.cancelSearchHighlight()
    enter : ->
    reqNextSearch : -> g.model.goNextSearchResult( false )
    reqPrevSearch : -> g.model.goNextSearchResult( true )

class g.InsertMode extends g.Mode
    getName : -> "InsertMode"
    blur    : -> g.model.enterNormalMode()
    getKeyMapping : -> g.model.getIMap()

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then return true
        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false
        true

class g.SearchMode extends g.Mode
    getName : -> "SearchMode"

    init : ( searcher_, backward_, opt_ ) ->
        @opt   = opt_ ? {
            wrap         : g.model.getSetting("wrapSearch")
            ignoreCase   : g.model.getSetting("ignoreCase")
            incSearch    : g.model.getSetting("incSearch")
            useMigemo    : g.model.getSetting("useMigemo")
            minIncSearch : g.model.getSetting("minIncSearch")
            minMigemoLength : g.model.getSetting("minMigemoLength")
            backward     : backward_
        }
        @searcher = searcher_.init( @opt )
        @backward = backward_
        this

    cancelSearch : ->
        g.model.goPageMark()
        @searcher.finalize()
        g.model.enterNormalMode();

    prePostKeyEvent : (key, ctrl, alt, meta) -> true

    escape : -> @cancelSearch()

    enter : ->
        sources = [
            { class : "CandSourceSearchHist" }
        ]

        g.view.setStatusLineText ""
        param =
            sources      : sources
            mode         : 'Search'
            modeChar     : if @backward == true then '?' else '/'
            incSearch    : @opt.incSearch
        g.model.openCommandBox( param )

    exit : ->
        g.view.hideCommandFrame()
        window.focus()

    notifyInputUpdated : (msg) ->
        clearTimeout @timerId if @waiting

        @timerId = setTimeout( =>
            g.logger.e "set"
            @searcher.updateInput(msg.word)
            @waiting = false
        , 200 )
        @waiting = true

    notifySearchFixed : (msg) ->
        if @waiting
            clearTimeout @timerId
            @waiting = false

        @searcher.fix( msg.word )
        g.model.setSearcher( this.searcher )
        g.model.enterNormalMode()

    getKeyMapping : -> g.model.getCMap()

class g.CommandMode extends g.Mode
    getName : -> "CommandMode"
    reqExecuteCommand : (req) ->
        try
            @executer.set(req.commandLine).parse().execute()
            g.view.hideStatusLine()
        catch e
            g.view.setStatusLineText("Command Not Found : " + this.executer.get(), 2000);
        g.model.enterNormalMode()

    prePostKeyEvent : (key, ctrl, alt, meta) -> true

    enter : ->
        @executer ?= new g.CommandExecuter
        if @executer.getDescription()?
            g.view.setStatusLineText( @executer.getDescription() )
        else
            g.view.setStatusLineText( @executer.get() )

        param =
            sources      : @sources
            mode         : 'Command'
            modeChar     : ':'
        g.model.openCommandBox( param )

    exit : ->
        g.view.hideCommandFrame()
        window.focus()

    getKeyMapping : -> g.model.getCMap()

    setExecuter : (@executer) -> this
    setSources  : (@sources)  -> this

class g.EmergencyMode extends g.Mode
    getName : -> "EmergencyMode"

    prePostKeyEvent : (key, ctrl, alt, meta) -> true

    enter : ->
        keyMap = g.model.getEMap()
        text = "Emergency Mode: press "
        for key,mapped of keyMap
            text += key + ", " if mapped == "Escape"
        text = text
               .replace( /</g, "&lt;" )
               .replace( />/g, "&gt;" )
               .replace( /, $/, " " )
        text += "to escape"
        g.view.setStatusLineText( text )

    exit  : -> g.view.hideStatusLine()

    blur  : (target) ->
        if g.util.isEmbededFlash target
            g.model.enterNormalMode()

    getKeyMapping : -> g.model.getEMap()

class g.FMode extends g.Mode
    getName   : -> "FMode"
    setOption : (@opt) -> this

    hit : (i) ->
        primary = false
        target = $(@hints[i].target)

        if target.is('a')
            primary = @opt.newTab
            unless @opt.continuous
                g.model.enterNormalMode()
        else
            target.focus()
            if g.util.isEditable( target.get(0) )
                g.model.enterInsertMode()
            else
                g.model.enterNormalMode()

        g.util.dispatchMouseClickEvent target.get(0), primary, false, false

    isValidKey : (key) ->
        return ( @keys.indexOf( key ) >= 0 && key.length == 1 ) ||
               ( key == 'BS' ) ||
               ( key == 'DEL' )

    searchTarget : ->
        for elem, i in @hints
            if @currentInput == elem.key then return i
        return -1

    treatNewInput : (key) ->
        if key == "BS" || key == "DEL"
            if @currentInput.length == 0
                g.model.enterNormalMode()
                return
            @currentInput = @currentInput.slice( 0, @currentInput.length - 1 )
        else
            @currentInput += key

        g.view.setStatusLineText( 'f Mode : ' + @currentInput )

        if @currentInput.length < @keyLength
            @updateHints()
            return
        else
            idx = @searchTarget()
            if idx >= 0
                @hit idx
            else
                g.model.enterNormalMode() unless @opt.continuous

            if @opt.continuous
                @currentInput = ""
                g.view.setStatusLineText 'f Mode : '
            else
                g.view.hideStatusLine()

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if key == "ESC" then return true
        if ctrl or alt or meta then return true

        key = key.toUpperCase() if g.model.getSetting("fModeIgnoreCase")

        if @isValidKey( key )
            event.stopPropagation()
            event.preventDefault()
            @treatNewInput( key )
            return false
        else
            return true

    getKeyLength : (candiNum) ->
        if candiNum     == 1 then return 1
        if @keys.length == 1 then return 1
        Math.ceil( Math.log( candiNum ) / Math.log( @keys.length ) )

    updateHints : ->
        for hint in @hints
            if hint.key.indexOf( @currentInput ) == 0
                hint.elem.find("span#vichromehintchar").remove()
                for c in @currentInput
                    hint.elem = hint.elem.append( $('<span id="vichromehintchar" />')
                               .css("color", g.model.getSetting("hintColorSelected"))
                               .html(c) )
                for c in hint.key.slice(@currentInput.length)
                    hint.elem = hint.elem.append( $('<span id="vichromehintchar" />')
                               .css("color", g.model.getSetting("hintColor"))
                               .html(c) )
                if not hint.elem.is(':visible')
                    @showFunc.call( hint.elem )
                $(hint.target).addClass('vichrome-fModeTarget')
            else
                @hideFunc.call( hint.elem )
                $(hint.target).removeClass('vichrome-fModeTarget')

    createHints : (links) ->
        for elem,i in links
            key=''
            j = @keyLength
            k = i
            while j--
                key = @keys.charAt( k % @keys.length ) + key
                k /= @keys.length

            @hints[i]        = {}
            @hints[i].key    = key
            @hints[i].target = elem

            $(elem).addClass('vichrome-fModeTarget')

        hintHeight   = "" + (g.model.getSetting("hintFontSize") + 4) + "px"
        tmpElem = $( '<span id="vichromehint" />' )
                 .css("height",      hintHeight)
                 .css("line-height", hintHeight)
                 .css("font-size", "" + g.model.getSetting("hintFontSize") + "px")
                 .css("background-color", g.model.getSetting("hintBackgroundColor"))
        for hint in @hints
            offset = hint.target._offset_
            top  =  offset.top - 7
            left = offset.left - 7
            top  = 0 if top < 0
            left = 0 if left < 0
            elem = tmpElem.clone()
                   .css("top",  top)
                   .css("left", left)
            for c in hint.key
                elem = elem.append( $('<span id="vichromehintchar" />').html(c) )
                           .css("color", g.model.getSetting("hintColor"))
                           .hide()
            hint.elem = elem
            $('html').append( hint.elem )
            @showFunc.call( hint.elem )

    enter : ->
        @currentInput = ""
        @hints        = []
        if g.model.getSetting("useFModeAnimation")
            @showFunc = -> this.fadeIn(200)
            @hideFunc = -> this.fadeOut(200)
        else
            @showFunc = $.fn.show
            @hideFunc = $.fn.hide

        links = $('a:_visible,*:input:_visible,.button:_visible')
        $('img[usemap^="#"]:_visible').each(->
          offset = this._offset_
          mapName = $(this).attr('usemap').slice(1)
          areas = $('map[name="' + mapName + '"] area')
          console.log areas
          areas.each(->
            if $(this).attr('shape') != 'default'
              coords = $(this).attr('coords').split(',')
              this._offset_ = {top: offset.top + ~~coords[1], left: offset.left + ~~coords[0]}
            else
              this._offset_ = offset

            links.push(this);
          );
        )

        if links.length == 0
            g.view.setStatusLineText( "No visible links found", 2000 )
            setTimeout( ( -> g.model.enterNormalMode() ) , 0 )
            return

        @keys = g.model.getSetting("fModeAvailableKeys")
        @keys = @keys.toUpperCase() if g.model.getSetting("fModeIgnoreCase")
        @keyLength = @getKeyLength( links.length )

        @createHints( links )

        g.view.setStatusLineText 'f Mode : '

    exit : ->
        $('span#vichromehint').remove()
        $('.vichrome-fModeTarget').removeClass('vichrome-fModeTarget')

$.extend( $.expr[':'],
    _visible : (elem) ->
        winLeft = window.pageXOffset
        winTop  = window.pageYOffset
        winH    = window.innerHeight
        winW    = window.innerWidth
        offset  = $(elem).offset()

        if winTop > offset.top or winTop + winH < offset.top
            return false
        if winLeft > offset.left or offset.left > winLeft + winW
            return false

        if $.expr[':'].hidden(elem)
            return false
        if $.curCSS(elem, 'visibility') == 'hidden'
            return false

        elem._offset_ = offset # for performance improvement
        true
)

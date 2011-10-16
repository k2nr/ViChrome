g = this

class g.Mode
    exit  : ->
    enter : ->
    reqOpen : (args) ->
        urls = []
        for arg in args then switch arg
            when "-i" then interactive = true
            when "-b" then bookmark    = true
            when "-h" then history     = true
            when "-g","g"  then search      = true
            else urls.push arg

        if interactive or bookmark or history
            com = "Open " + urls.join(' ')
            if search
                com += " g"
                sources = [
                    new g.CandSourceGoogleSuggest
                ]
            else if bookmark
                sources = [
                    new g.CandSourceBookmark
                ]
            else if history
                sources = [
                    new g.CandSourceHistory
                ]
            else
                sources = [
                    (new g.CandSourceGoogleSuggest(3)).requirePrefix(true)
                    new g.CandSourceWebSuggest(3)
                    new g.CandSourceBookmark(3)
                    new g.CandSourceHistory(3)
                ]
            g.model.enterCommandMode((new g.CommandExecuter).set(com), sources)
            return
        else if search
            url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + urls.join('+') + "&qscrl=1"
            window.open( url, "_self" )

        else
            window.open( urls[0], "_self" )

    reqOpenNewTab : (args) ->
        words = []
        for arg in args then switch arg
            when "-i" then interactive = true
            when "-b" then bookmark    = true
            when "-h" then history     = true
            when "-g","g"  then search      = true
            else words.push arg

        if interactive or bookmark or history
            com = "OpenNewTab " + words.join(' ')
            if search
                com += " g"
                sources = [
                    new g.CandSourceGoogleSuggest
                ]
            else if bookmark
                sources = [
                    new g.CandSourceBookmark
                ]
            else if history
                sources = [
                    new g.CandSourceHistory
                ]
            else
                sources = [
                    (new g.CandSourceGoogleSuggest(3)).requirePrefix(true)
                    new g.CandSourceWebSuggest(3)
                    new g.CandSourceBookmark(3)
                    new g.CandSourceHistory(3)
                ]
            g.model.enterCommandMode((new g.CommandExecuter).set(com), sources)
        else if search
            url = "http://" + g.model.getSetting("searchEngine") + "/search?gcx=c&sourceid=chrome&ie=UTF-8&q=" + words.join('+') + "&qscrl=1"
            urls = []
            urls.push url
            chrome.extension.sendRequest {command : "OpenNewTab", args : urls}, g.handler.onCommandResponse
        else
            chrome.extension.sendRequest {command : "OpenNewTab", args : words}, g.handler.onCommandResponse

    blur : ->
    reqScrollDown   : -> g.view.scrollBy(0, g.model.getSetting "scrollPixelCount")
    reqScrollUp     : -> g.view.scrollBy(0, -g.model.getSetting "scrollPixelCount")
    reqScrollLeft   : -> g.view.scrollBy(-g.model.getSetting "scrollPixelCount", 0)
    reqScrollRight  : -> g.view.scrollBy(g.model.getSetting "scrollPixelCount", 0)
    reqPageHalfDown : -> g.view.scrollBy(0, window.innerHeight / 2)
    reqPageHalfUp   : -> g.view.scrollBy(0, -window.innerHeight / 2)
    reqPageDown     : -> g.view.scrollBy(0, window.innerHeight)
    reqPageUp       : -> g.view.scrollBy(0, -window.innerHeight)
    reqGoTop : ->
        g.model.setPageMark()
        g.view.scrollTo( window.pageXOffset, 0 )

    reqGoBottom : ->
        g.model.setPageMark()
        g.view.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight )

    reqBackHist    : -> g.view.backHist()
    reqForwardHist : -> g.view.forwardHist()
    reqReloadTab   : -> g.view.reload()
    reqGoSearchModeForward  : -> g.model.enterSearchMode( false )
    reqGoSearchModeBackward : -> g.model.enterSearchMode( true )
    reqGoLinkTextSearchMode : -> g.model.enterSearchMode( false, new g.LinkTextSearcher )

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

        opt = newTab : newTab, continuous : continuous
        g.model.enterFMode( opt )

    reqGoCommandMode : ->
        sources = [
            new g.CandSourceCommand
            new g.CandSourceAlias
        ]
        g.model.enterCommandMode( null, sources )

    reqFocusOnFirstInput : ->
        g.model.setPageMark()
        g.view.focusInput( 0 )

    req_ChangeLogLevel : (args) ->
        if not args or args.length < 1 then return

        if g.logLevels[args[0]]?
            g.LOG_LEVEL = g.logLevels[args[0]]
        else
            g.view.setStatusLineText "log level '#{args[0]}' doesn't exist", 2000

    getKeyMapping : -> g.model.getNMap()

class g.NormalMode extends g.Mode
    getName : -> "NormalMode"
    prePostKeyEvent : (key, ctrl, alt, meta) -> true
    escape : -> g.model.cancelSearchHighlight()
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

Commandable =
    commandBox : null
    reqFocusNextCandidate : (args) -> @commandBox.nextCandidate()
    reqFocusPrevCandidate : (args) -> @commandBox.prevCandidate()

class g.SearchMode extends g.Mode
    constructor : ->
        g.extend( Commandable, this )

    getName : -> "SearchMode"

    init : ( searcher_, backward_, opt_ ) ->
        opt   = opt_ ? {
            wrap         : g.model.getSetting("wrapSearch")
            ignoreCase   : g.model.getSetting("ignoreCase")
            incSearch    : g.model.getSetting("incSearch")
            useMigemo    : g.model.getSetting("useMigemo")
            minIncSearch : g.model.getSetting("minIncSearch")
            minMigemoLength : g.model.getSetting("minMigemoLength")
            backward     : backward_
        }
        align = g.model.getSetting("commandBoxAlign")
        width = g.model.getSetting("commandBoxWidth")

        @commandBox = (new g.CommandBox).init( g.view, align, width )

        @searcher = searcher_.init( opt, this.commandBox )
        @backward = backward_
        this

    cancelSearch : ->
        g.model.goPageMark()
        @searcher.finalize()
        g.model.enterNormalMode();

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then return true
        event.stopPropagation()

        word = @commandBox.value()
        if word.length == 0 and ( key == "BS" or key == "DEL" )
            @cancelSearch()
            return false


        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false

        if key == "CR"
            @searcher.fix( word )
            g.model.setSearcher( this.searcher )
            g.model.enterNormalMode()
            return false

        true

    escape : -> @cancelSearch()

    enter : ->
        modeChar = if @backward == true then "?" else "/"
        candBox = (new g.CandidateBox)
                  .addSource( new g.CandSourceSearchHist )

        @commandBox.attachTo( g.view )
                   .show( modeChar )
                   .focus()
                   .setCandidateBox( candBox )

    exit : -> @commandBox.hide().detachFrom( g.view )

    getKeyMapping : -> g.model.getCMap()

class g.CommandMode extends g.Mode
    constructor : ->
        g.extend( Commandable, this )

    getName : -> "CommandMode"

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then return true

        event.stopPropagation()
        if @commandBox.value().length == 0 and ( key == "BS" or key == "DEL" )
            event.preventDefault()
            g.model.enterNormalMode()
            g.view.hideStatusLine()
            return false

        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false

        if key == "CR"
            try
                @executer ?= new g.CommandExecuter
                @executer.set( @commandBox.value() ).parse().execute()
                g.view.hideStatusLine()
            catch e
                g.view.setStatusLineText "Command Not Found : "+@executer.get(), 2000
            g.model.enterNormalMode()
            return false

        true

    enter : ->
        align = g.model.getSetting("commandBoxAlign")
        width = g.model.getSetting("commandBoxWidth")
        if @executer?
            g.view.setStatusLineText @executer.get()

        candBox = (new g.CandidateBox)
        if @sources? then for source in @sources
            candBox.addSource( source )

        @commandBox = (new g.CommandBox)
                      .init( g.view, align, width )
                      .attachTo( g.view )
                      .show( ":" )
                      .focus()
                      .setCandidateBox( candBox )
    exit : ->
        @commandBox.hide().detachFrom( g.view )

    getKeyMapping : -> g.model.getCMap()

    setExecuter : (@executer) ->
    setSources  : (@sources) ->

class g.FMode extends g.Mode
    getName   : -> "FMode"
    setOption : (@opt) -> this

    hit : (i) ->
        primary = false

        if @hints[i].target.is('a')
            primary = @opt.newTab
            unless @opt.continuous
                g.model.enterNormalMode()
        else
            @hints[i].target.focus()
            if g.util.isEditable( @hints[i].target.get(0) )
                g.model.enterInsertMode()
            else
                g.model.enterNormalMode()

        g.util.dispatchMouseClickEvent @hints[i].target.get(0), primary, false, false

    isValidKey : (key) ->
        unless key.length == 1 then return false
        if @keys.indexOf( key ) < 0
            return false
        else
            return true

    searchTarget : ->
        for elem, i in @hints
            if @currentInput == elem.key then return i
        return -1

    highlightCandidate : ->
        # TODO:

    putValidChar : (key) ->
        @currentInput += key
        g.view.setStatusLineText( 'f Mode : ' + @currentInput )

        if @currentInput.length < @keyLength
            @highlightCandidate()
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

        if @isValidKey( key )
            event.stopPropagation()
            event.preventDefault()
            @putValidChar( key )
            return false
        else
            return true

    getKeyLength : (candiNum) ->
        if candiNum     == 1 then return 1
        if @keys.length == 1 then return 1
        Math.ceil( Math.log( candiNum ) / Math.log( @keys.length ) )

    enter : ->
        @currentInput = "";
        @hints        = [];
        @keys         = "";

        links = $('a:_visible,*:input:_visible,.button:_visible')

        if links.length == 0
            g.view.setStatusLineText( "No visible links found", 2000 )
            setTimeout( ( -> g.model.enterNormalMode() ) , 0 )
            return

        @keys = g.model.getSetting("fModeAvailableKeys")
        @keyLength = @getKeyLength( links.length )

        that = this
        links.each( (i) ->
            key=''
            j = that.keyLength
            k = i;
            while j--
                key += that.keys.charAt( k % that.keys.length )
                k /= that.keys.length

            that.hints[i]        = {}
            that.hints[i].offset = $(this).offset()
            that.hints[i].key    = key
            that.hints[i].target = $(this)

            $(this).addClass('vichrome-fModeTarget')
        )

        for elem in @hints
            x = elem.offset.left - 7
            y = elem.offset.top  - 7
            if x < 0 then x = 0
            if y < 0 then y = 0
            div = $( '<span id="vichromehint" />' )
            .css( "top",  y )
            .css( "left", x )
            .html(elem.key)
            $(document.body).append(div)

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
        if $.expr[':'].hidden(elem) then return false
        if $.curCSS(elem, 'visibility') == 'hidden' then return false
        if winLeft <= offset.left <= winLeft + winW and \
           winTop  <= offset.top <= winTop + winH
            return true
        else
            return false
)

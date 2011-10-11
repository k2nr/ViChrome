g = this

class g.Mode
    exit  : ->
    enter : ->

    reqOpen : (args) -> if args?[0]? then window.open( args[0], "_self" )
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
        for arg in args
            switch arg
                when "--newtab" then newTab = true
                when "--continuous" then continuous = true

        opt = newTab : newTab, continuous : continuous
        g.model.enterFMode( opt )

    reqGoCommandMode : -> g.model.enterCommandMode()

    reqFocusOnFirstInput : ->
        g.model.setPageMark()
        g.view.focusInput( 0 )

    req_ChangeLogLevel : (args) ->
        unless args?.length > 0 then return

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

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then return true
        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false

        true

    enter : ->

    blur : -> g.model.enterNormalMode()

    getKeyMapping : -> g.model.getIMap()

class g.SearchMode extends g.Mode
    getName : -> "SearchMode"

    init : ( searcher_, backward_, opt_ ) ->
        opt   = opt_ ? {
            wrap         : g.model.getSetting("wrapSearch")
            ignoreCase   : g.model.getSetting("ignoreCase")
            incSearch    : g.model.getSetting("incSearch")
            minIncSearch : g.model.getSetting("minIncSearch")
            backward     : backward_
        }
        align = g.model.getSetting("commandBoxAlign")
        width = g.model.getSetting("commandBoxWidth")

        @commandBox = (new g.CommandBox).init( g.view, align, width )

        searcher_.init( opt, this.commandBox )
        @searcher = searcher_
        @backward = backward_

        return this

    cancelSearch : ->
        g.model.goPageMark()
        @searcher.finalize()
        g.model.enterNormalMode();

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then true

        word = @commandBox.value()
        if word.length == 0 and ( key == "BS" or key == "DEL" )
            @cancelSearch()
            return false

        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false

        if key == "CR"
            event.stopPropagation()

            @searcher.fix( word )
            g.model.setSearcher( this.searcher )
            g.model.enterNormalMode()
            return false

        return true

    escape : -> @cancelSearch()

    enter : ->
        modeChar = if @backward == true then "?" else "/"
        @commandBox.attachTo( g.view ).show( modeChar ).focus()

    exit : -> @commandBox.hide().detachFrom( g.view )

    getKeyMapping : -> g.model.getIMap()

class g.CommandMode extends g.Mode
    getName : -> "CommandMode"

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if ctrl or alt or meta then return true

        if @commandBox.value().length == 0 and ( key == "BS" || key == "DEL" )
            g.model.enterNormalMode()
            return false

        if g.KeyManager.isNumber(key) or g.KeyManager.isAlphabet(key)
            return false

        if key == "CR"
            executer = new g.CommandExecuter
            try
                executer.set( @commandBox.value() ).parse().execute()
                g.view.hideStatusLine()
            catch e
                g.view.setStatusLineText "Command Not Found : "+executer.get(), 2000

            event.stopPropagation()
            event.preventDefault()
            g.model.enterNormalMode()
            return false

        return true

    enter : ->
        align = g.model.getSetting("commandBoxAlign")
        width = g.model.getSetting("commandBoxWidth")

        @commandBox = (new g.CommandBox)
                          .init( g.view, align, width )
                          .attachTo( g.view )
                          .show( ":" )
                          .focus()

    exit : -> @commandBox.hide().detachFrom( g.view )

    getKeyMapping : -> g.model.getIMap()

class g.FMode extends g.Mode
    getName : -> "FMode"

    setOption : (@opt) -> this

    hit : (i) ->
        primary = false

        if @hints[i].target.is('a')
            primary = @opt.newTab
            if not @opt.continuous
                setTimeout( ->
                    g.view.hideStatusLine()
                    g.model.enterNormalMode()
                , 0 )
        else
            @hints[i].target.focus()

        g.util.dispatchMouseClickEvent @hints[i].target.get(0), primary, false, false

    isValidKey : (key) ->
        unless key.length == 1 then return false
        if @keys.indexOf( key ) < 0
            return false
        else
            return true

    searchTarget : ->
        for elem, i in @hints
            if @currentInput == elem.key
                return i
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
            if idx >= 0 then @hit idx
            if @opt.continuous
                @currentInput = ""
                g.view.setStatusLineText 'f Mode : '

    prePostKeyEvent : (key, ctrl, alt, meta) ->
        if key == "ESC" then return true
        if ctrl or alt or meta then return true

        if @isValidKey( key )
            event.stopPropagation()
            event.preventDefault()
            @putValidChar( key )
        return false

    getKeyLength : (candiNum) ->
        if candiNum == 1 then return 1
        if @keys.length == 1 then return 1
        Math.ceil( Math.log( candiNum ) / Math.log( @keys.length ) )

    enter : ->
        @currentInput = "";
        @hints        = [];
        @keys         = "";

        links = $('a:_visible,*:input:_visible')

        if links.length == 0
            g.view.setStatusLineText( "No visible links found", 2000 )
            setTimeout( ->
                g.model.enterNormalMode()
            , 0 )
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

            $(this).addClass('fModeTarget')
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
        $('.fModeTarget').removeClass('fModeTarget')

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

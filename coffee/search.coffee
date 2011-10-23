g = this

class g.NormalSearcher
    buildSortedResults : ->
        @sortedResults = []
        results = @sortedResults
        $('span.vichrome-highlight:visible').each( (i) ->
            results[i] = {}
            results[i].offset = $(this).offset()
            results[i].value  = $(this)
        )

        @sortedResults.sort( (a, b) ->
            if a.offset.top == b.offset.top
                return a.offset.left - b.offset.left
            else
                return a.offset.top - b.offset.top
        )

    getResultCnt : -> @sortedResults.length

    getFirstInnerSearchResultIndex : ->
        for i in [0..@getResultCnt()-1]
            idx = if @opt.backward then total - 1 - i else i
            span = @getResult( idx )
            if span? and span.isWithinScreen() then return idx

        return -1

    updateInput : (@word) ->
        if @word.length >= @opt.minIncSearch
            @searchAndHighlight @word
            if @getResultCnt() == 0
                g.view.setStatusLineText( "no matches" )
                return

            @curIndex = @getFirstInnerSearchResultIndex()
            if @curIndex < 0
                if @opt.backward
                    @curIndex = @getResultCnt() - 1
                else
                    @curIndex = 0

            @moveTo( @curIndex )
        else
            g.view.setStatusLineText("")
            @removeHighlight()

        return

    init : (@opt) -> this

    getOption : ->
        ret = g.object( @opt )
        if @opt.useMigemo and @word.length < @opt.minMigemoLength
            ret.useMigemo = false
        ret

    highlight : (word) ->
        opt = @getOption()
        $(document.body).highlight( word, {
            ignoreCase : opt.ignoreCase
            useMigemo  : opt.useMigemo
        })

    getCurIndex : -> @curIndex

    removeHighlight : ->
        $(document.body).removeHighlight()

    searchAndHighlight : (word) ->
        @removeHighlight()
        @highlight(word)
        @buildSortedResults()

    getResult : (cnt) -> @sortedResults[cnt]?.value

    fix : (word) ->
        if not @opt.incSearch or word.length < @opt.minIncSearch or @word != word
            if @opt.useMigemo and word.length < @opt.minMigemoLength
                @opt.useMigemo = false
            @word = word
            @searchAndHighlight( word )
            if @getResultCnt() == 0
                g.view.setStatusLineText( "no matches" )
                return

            @curIndex = @getFirstInnerSearchResultIndex()
            if @curIndex < 0
                if @opt.backward
                    @curIndex = @getResultCnt() - 1
                else
                    @curIndex = 0
            @moveTo( @curIndex )
        else
            @word = word

        chrome.extension.sendRequest(
            command : "PushSearchHistory"
            value   : @word
        )

        span = @getResult( @getCurIndex() )
        span?.closest("a").get(0)?.focus()
        @fixed = true

    moveTo : (pos) ->
        if @getResultCnt() > pos
            span = @getResult( pos )
            if span?
                $('span').removeClass('vichrome-highlightFocus')
                span.addClass('vichrome-highlightFocus')
                span.scrollTo()
                g.view.setStatusLineText( (pos+1) + " / " + @getResultCnt() )
                if @fixed
                    g.view.blurActiveElement()
                    span.closest("a").get(0)?.focus()
        else g.logger.e("out of searchResults length", pos)


    goNext : (reverse) ->
        forward = (@opt.backward == reverse)

        if @removed
            @searchAndHighlight( @word )
            @removed = false

        if forward then @curIndex++ else @curIndex--

        if forward and @curIndex >= @getResultCnt()
            if @opt.wrap
                @curIndex = 0
            else
                @curIndex = @getResultCnt() - 1
                return false
        else if not forward and @curIndex < 0
            if @opt.wrap
                @curIndex = @getResultCnt() - 1
            else
                @curIndex = 0
                return false

        @moveTo( @curIndex )
        return true

    cancelHighlight : ->
        g.logger.d "cancelHighlight"
        @removeHighlight()
        @removed = true

    finalize : ->
        g.logger.d "finalize"
        @sortedResults = undefined
        @opt = undefined
        g.view.hideStatusLine()
        @removeHighlight()

class g.LinkTextSearcher extends g.NormalSearcher
    highlight : (word) ->
        opt = @getOption()
        $("a").highlight( word, {
            ignoreCase : opt.ignoreCase
            useMigemo  : opt.useMigemo
        })

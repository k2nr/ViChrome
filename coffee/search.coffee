g = this

class g.NormalSearcher
    buildSortedResults : ->
        @sortedResults = []
        results = @sortedResults
        $('span.highlight:visible').each( (i) ->
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
        total = @getResultCnt()
        for i in [0..total-1]
            if @opt.backward
                offset = @getSearchResultSpan( total - 1 - i ).offset()
                if offset.top + 10 < window.pageYOffset + window.innerHeight
                    return total - 1 - i
            else
                offset = @getSearchResultSpan(i).offset()
                if offset.top - 10 > window.pageYOffset
                    return i

        return -1

    updateInput : (@word) ->
        # because search for string the length of which is 1 may be slow,
        # search starts with string whose length is over 2.
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

    init : (@opt, commandBox) ->
        if @opt.incSearch
            commandBox.addInputUpdateListener( (word) => @updateInput(word) )

    getOption : -> @opt

    highlight : (word) ->
        $(document.body).highlight( word, {ignoreCase : @opt.ignoreCase} )

    getCurIndex : -> @curIndex

    removeHighlight : -> $(document.body).removeHighlight()

    searchAndHighlight : (word) ->
        @removeHighlight()
        @highlight(word)
        @buildSortedResults()

    getSearchResultSpan : (cnt) -> @sortedResults[cnt].value

    fix : (@word) ->
        if not @opt.incSearch or word.length < @opt.minIncSearch
            @searchAndHighlight( @word )
            @curIndex = @getFirstInnerSearchResultIndex()
            @moveTo( @curIndex )
        @fixed = true

    moveTo : (pos) ->
        if @getResultCnt() > pos
            span = @getSearchResultSpan( pos )
            if span?
                $('span').removeClass('highlightFocus')
                span.addClass('highlightFocus')
                span.scrollTo()
                g.view.setStatusLineText( (pos+1) + " / " + @getResultCnt() )
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
        $("a").highlight( word, {ignoreCase : @getOption().ignoreCase} )

    moveTo : (pos) ->
        super pos
        if @fixed
            @getSearchResultSpan( pos )?.closest("a").get(0).focus()

    fix : (word) ->
        super word
        span = @getSearchResultSpan( @getCurIndex() )
        span?.closest("a").get(0).focus()

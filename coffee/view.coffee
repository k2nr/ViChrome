g = this

$.fn.extend {
    isWithinScreen : ->
        offset = $(@).offset()
        padding = 10
        if offset.left + padding > window.pageXOffset + window.innerWidth or \
           offset.left - padding < window.pageXOffset
            return false

        if offset.top + padding > window.pageYOffset + window.innerHeight or \
           offset.top - padding < window.pageYOffset
            return false

        return true

    scrollTo : (x, y, speed=80) ->
        offset = $($(@).get(0)).offset()
        newX = offset.left - window.innerWidth / 2
        newY = offset.top - window.innerHeight / 2

        if newX > document.body.scrollLeft - window.innerWidth
            newX - document.body.scrollLeft - window.innerWidth

        if newY > document.body.scrollHeight - window.innerHeight
            newX = document.body.scrollHeight - window.innerHeight

        unless x? or y?
            if $(@).isWithinScreen() then return $(@)

        left = x ? newX
        top  = y ? newY

        if not g.model.getSetting "smoothScroll"
            speed = 0

        $(document.body).animate( {scrollTop : top, scrollLeft : left}, speed )
        return $(@)

    scrollBy : (x=0, y=0, speed=80) ->
        top  = window.pageYOffset  + y
        left = window.pageXOffset  + x

        if g.model.getSetting "smoothScroll"
            speed = 0

        $(document.body).animate( {scrollTop : top, scrollLeft : left}, speed )
        return $(@)
}

class g.Surface
    init : ->
        align = g.model.getSetting "commandBoxAlign"
        width = g.model.getSetting "commandBoxWidth"
        alignClass = "statusline" + align

        @statusLine = $( '<div id="vichromestatusline" />' )
                      .addClass( 'statuslineinactive' )
                      .addClass( alignClass )
                      .width( width )

        @hideStatusLine()
        @attach( @statusLine )
        @initialized = true

    attach : (w) ->
        $(document.body).append( w )
        return this

    activeStatusLine : ->
        @statusLine.removeClass( 'statuslineinactive' )
        @statusLine.show()

        if @slTimeout
            clearTimeout( @slTimeout )
            @slTimeout = undefined

        return this

    inactiveStatusLine : ->
        @statusLine.addClass( 'statuslineinactive' )
        return this

    hideStatusLine : ->
        if @slTimeout
            clearTimeout( @slTimeout )
            @slTimeout = undefined

        @statusLine.html("").hide()
        return this

    setStatusLineText : (text, timeout) ->
        @statusLine.html( text )
        @activeStatusLine()

        if timeout
            @slTimeout = setTimeout ( => @statusLine.html("").hide() ), timeout

        return this

    detach : (w) -> w.detach()

    focusInput : (idx) ->
        if not @initialized then return this

        $('form input:text:visible').scrollTo?().get(0)?.focus()
        return this

    scrollBy : (x, y) ->
        if not @initialized then return this

        $(document.body).scrollBy(x, y, 40)
        return this

    scrollTo : (x, y) ->
        if not @initialized then return this

        $(document.body).scrollTo(x, y, 80)
        return this

    backHist : ->
        if not @initialized then return this

        window.history.back()
        return this

    forwardHist : ->
        if not @initialized then return this
        window.history.forward()
        return this

    reload : ->
        if not @initialized then return this

        window.location.reload()
        return this

    blurActiveElement : ->
        if not @initialized then return this

        document.activeElement.blur()
        return this

class g.CommandBox
    init : (view, align, w) ->
        alignClass = "vichromebox" + align

        @box   = $( '<div id="vichromebox" />' )
                 .addClass( alignClass )
                 .width( w )

        @input = $( '<input type="text" id="vichromeinput" spellcheck="false" value="" />' )
        @modeChar  = $( '<div id="vichromemodechar" />' )
        @inputField = $( '<table />' )
                       .append( $('<tr />')
                        .append( $('<td id="vichromemodechar" />')
                         .append( @modeChar ))
                        .append( $('<td id="vichromeinput" />')
                         .append( @input )))

        @inputField = $( '<div id="vichromefield" />' ).append( @inputField )

        @box.append( @inputField )

        @view = view

        return this

    addInputUpdateListener : (fn) ->
        @inputUpdateListener = fn
        return this

    removeInputUpdateListener : ->
        @inputUpdateListener = null
        return this

    attachTo : (view) ->
        view.attach( @box )
        return this

    detachFrom : (view) ->
        view.detach( @box )

        @inputUpdateListener = null
        return this

    show : (modeChar, input) ->
        @input.attr( "value", input )
        @modeChar.html( modeChar )

        @box.show()
        @inputField.show()

        @box.keyup (e) =>
            if @isVisible() and @inputUpdateListener
                @inputUpdateListener( @value() )

        @view.activeStatusLine()

        return this

    hide : ->
        if @isVisible()
            @inputField.hide()
            @input.blur()

        @box.unbind()

        return this

    focus : ->
        @input.get(0)?.focus()
        return this

    isVisible : -> @inputField.css( 'display' ) isnt 'none'

    value : -> @input.val()


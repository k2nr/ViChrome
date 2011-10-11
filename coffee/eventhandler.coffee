g = this

class g.EventHandler
    constructor : (@model) ->

    onBlur : (e) ->
        g.logger.d "onBlur", e
        @model.onBlur()

    onKeyDown : (e) ->
        g.logger.d "onKeyDown", e
        msg = @getHandlableKey e
        if msg? then @model.handleKey msg

    # decide whether to post the key event and do some pre-post process
    # return true if the key event can be posted.
    getHandlableKey : (e) ->
        if g.KeyManager.isOnlyModifier( e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey )
            g.logger.d "getHandlableKey:only modefier"
            return undefined

        code = g.KeyManager.getLocalKeyCode( e.keyIdentifier, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey )
        unless code?
            g.logger.d "getHandlableKey:cant be handled"
            return undefined

        if @model.prePostKeyEvent( code, e.ctrlKey, e.altKey, e.metaKey )
            return code: code, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey
        else
            g.logger.d "prePostKeyEvent:key ignored by current mode"
            return

    onFocus : (e) ->
        g.logger.d "onFocus", e.target
        @model.onFocus e.target

    addWindowListeners : ->
        window.addEventListener("keydown" , ((e) => @onKeyDown(e)) , true)
        window.addEventListener("focus"   , ((e) => @onFocus(e))   , true)
        window.addEventListener("blur"    , ((e) => @onBlur(e))    , true)

    init : -> @addWindowListeners()

    onInitEnabled : (msg) ->
        @init()
        @model.onInitEnabled( msg )

    onCommandResponse : (msg) ->
        if msg?.command == "Settings" then @model.onSettings msg


this.vichrome ?= {}
g = this.vichrome

class g.EventHandler
    constructor : (@model) ->

    onBlur : (e) ->
        g.logger.d "onBlur", e
        @model.onBlur()

    onKeyPress : (e) ->
        if g.model.isInSearchMode() or g.model.isInCommandMode()
            if !e.ctrlKey and !e.altKey and !e.metaKey
                event.stopPropagation()

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
            return {
                code  : code
                shift : e.shiftKey
                ctrl  : e.ctrlKey
                alt   : e.altKey
                meta  : e.metaKey
            }
        else
            g.logger.d "prePostKeyEvent:key ignored by current mode"
            return

    onFocus : (e) ->
        g.logger.d "onFocus", e.target
        @model.onFocus e.target

    addWindowListeners : ->
        document.addEventListener("keydown" , ((e) => @onKeyDown(e)) , true)
        document.addEventListener("keypress" , ((e) => @onKeyPress(e)) , true)
        document.addEventListener("focus"   , ((e) => @onFocus(e))   , true)
        document.addEventListener("blur"    , ((e) => @onBlur(e))    , true)

    addExtListener : ->
        chrome.extension.onRequest.addListener( (req, sender, sendResponse) =>
            g.logger.d "onRequest command: #{req.command}"
            if req.frameID? and req.frameID != g.model.frameID
                g.logger.d "onRequest: different frameID"
                sendResponse()
                return

            if req.command == "GetCommandTable"
                commands = []
                for com,method of g.CommandExecuter::commandTable
                    commands.push com
                sendResponse commands
            else if req.command == "GetAliases"
                aliases = {}
                for a,com of g.model.getAlias()
                    aliases[a] = com
                sendResponse aliases
            else if req.command == "ExecuteCommand"
                g.model.curMode.reqExecuteCommand( req )
                sendResponse()
            else if req.command == "NotifyInputUpdated"
                g.model.curMode.notifyInputUpdated( req )
                sendResponse()
            else if req.command == "NotifySearchFixed"
                g.model.curMode.notifySearchFixed( req )
                sendResponse()
            else
                g.model.triggerCommand( "req#{req.command}", req.args, req.senderFrameID )
                sendResponse()
        )

    init : ->
        @addWindowListeners()
        @addExtListener()

    onInitEnabled : (msg) ->
        @init()
        @model.onInitEnabled( msg )

    onCommandResponse : (msg) ->
        if msg?.command == "Settings" then @model.onSettings msg


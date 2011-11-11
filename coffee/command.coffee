this.vichrome ?= {}
g = this.vichrome

sendToBackground = (com, args) ->
    chrome.extension.sendRequest( {command : com, args : args}, (msg) ->
        g.handler.onCommandResponse msg
    )

triggerInsideContent = (com, args) -> g.model.triggerCommand "req#{com}", args

passToTopFrame = (com, args) ->
    chrome.extension.sendRequest( {
        command      : "TopFrame"
        innerCommand : com
        args         : args
        senderFrameID : g.model.frameID
    }, g.handler.onCommandResponse )

passToFrame = (com, args, target) ->
    chrome.extension.sendRequest( {
        command      : "PassToFrame"
        innerCommand : com
        args         : args
        frameID      : target
        senderFrameID : g.model.frameID
    }, g.handler.onCommandResponse )

escape = (com) -> triggerInsideContent "Escape"


class g.CommandExecuter
    setTargetFrame : (@targetFrame) -> this
    getTargetFrame : -> @targetFrame

    commandsBeforeReady : [
        "OpenNewTab"
        "CloseCurTab"
        "MoveToNextTab"
        "MoveToPrevTab"
        "MoveToFirstTab"
        "MoveToLastTab"
        "NMap"
        "IMap"
        "Alias"
        "OpenNewWindow"
        "OpenOptionPage"
        "RestoreTab"
    ]

    commandTable :
        Open                  : triggerInsideContent
        OpenNewTab            : triggerInsideContent
        CloseCurTab           : sendToBackground
        CloseAllTabs          : sendToBackground
        MoveToNextTab         : sendToBackground
        MoveToPrevTab         : sendToBackground
        MoveToFirstTab        : sendToBackground
        MoveToLastTab         : sendToBackground
        NMap                  : sendToBackground
        IMap                  : sendToBackground
        Alias                 : sendToBackground
        OpenNewWindow         : sendToBackground
        ReloadTab             : triggerInsideContent
        ScrollUp              : triggerInsideContent
        ScrollDown            : triggerInsideContent
        ScrollLeft            : triggerInsideContent
        ScrollRight           : triggerInsideContent
        PageHalfUp            : triggerInsideContent
        PageHalfDown          : triggerInsideContent
        PageUp                : triggerInsideContent
        PageDown              : triggerInsideContent
        GoTop                 : triggerInsideContent
        GoBottom              : triggerInsideContent
        NextSearch            : triggerInsideContent
        PrevSearch            : triggerInsideContent
        BackHist              : triggerInsideContent
        ForwardHist           : triggerInsideContent
        GoCommandMode         : passToTopFrame
        GoSearchModeForward   : triggerInsideContent
        GoSearchModeBackward  : triggerInsideContent
        GoLinkTextSearchMode  : triggerInsideContent
        GoFMode               : triggerInsideContent
        GoEmergencyMode       : triggerInsideContent
        FocusOnFirstInput     : triggerInsideContent
        BackToPageMark        : triggerInsideContent
        RestoreTab            : sendToBackground
        FocusNextCandidate    : triggerInsideContent
        FocusPrevCandidate    : triggerInsideContent
        Readability           : sendToBackground
        ShowTabList           : triggerInsideContent
        OpenOptionPage        : sendToBackground
        BarrelRoll            : triggerInsideContent
        Escape                : escape
        # hidden commands
        "_ChangeLogLevel"     : triggerInsideContent

    get : -> @command
    getArgs : -> @args
    setDescription : (@description) -> this
    getDescription : -> @description
    set : (command, times=1) ->
        if @command? then @command += " " else @command = ""
        @command += command
                    .replace(/^[\t ]*/, "")
                    .replace(/[\t ]*$/, "")
        @times = times ? 1
        this

    solveAlias : (alias) ->
        aliases = g.model.getAlias()
        alias = aliases[alias]
        while alias?
            command = alias
            alias = aliases[alias]
        command

    parse : ->
        unless @command then throw "invalid command"
        @args = @command.split(/\ +/)
        if not @args or @args.length == 0 then throw "invalid command"

        for i in [@args.length-1..0]
            if @args[i].length == 0
                @args.splice( i, 1 )

        command = @solveAlias( @args[0] )
        if command?
            @args = command.split(' ').concat( @args.slice(1) )

        if @commandTable[ @args[0] ]
            return this
        else throw "invalid command"

    execute : ->
        com  = @args[0]
        unless g.model.isReady() or com in @commandsBeforeReady then return

        setTimeout( =>
            if @targetFrame? and @commandTable[com] != sendToBackground
                passToFrame( com, @args.slice(1), @targetFrame )
            else
                @commandTable[com]( com, @args.slice(1) ) while @times--
            return
        , 0 )

class g.CommandManager
    keyQueue :
        init : (@model, @timeout, @enableMulti=true)->
            @a = ""
            @times = ""
            @timerId = 0
            @waiting = false

        stopTimer : ->
            if @waiting
                g.logger.d "stop timeout"
                clearTimeout @timerId
                @waiting = false

        startTimer : (callback, ms) ->
            if @waiting then return

            @waiting = true;
            @timerId = setTimeout( callback, ms )

        queue : (s) ->
            if @enableMulti and s.length == 1 and s.search(/[0-9]/) >= 0 and @a.length == 0
                @times += s
            else
                @a += s

            this

        reset : ->
            @a = ""
            @times = ""
            @stopTimer()

        isWaiting : -> @waiting

        getTimes : -> if @times.length > 0 then parseInt(@times, 10) else 1

        getNextKeySequence : ->
            @stopTimer()

            if @model.isValidKeySeq(@a)
                ret = @a
                @reset()
                return ret
            else
                if @model.isValidKeySeqAvailable(@a)
                    @startTimer( =>
                        @a       = ""
                        @times   = ""
                        @waiting = false
                    , @timeout )
                else
                    g.logger.d "invalid key sequence: #{@a}"
                    @reset()
                null

    constructor : (@model, timeout, enableMulti=true) ->
        @keyQueue.init( @model, timeout, enableMulti )

    getCommandFromKeySeq : (s, keyMap) ->
        @keyQueue.queue(s)
        keySeq = @keyQueue.getNextKeySequence()

        if keyMap and keySeq then keyMap[keySeq] else null

    reset : -> @keyQueue.reset()

    isWaitingNextKey : -> @keyQueue.isWaiting()

    handleKey : (msg, keyMap) ->
        s     = g.KeyManager.getKeyCodeStr(msg)
        times = @keyQueue.getTimes()
        com   = @getCommandFromKeySeq( s, keyMap )

        unless com
            if @isWaitingNextKey()
                event.stopPropagation()
                event.preventDefault()
            return

        switch com
            when "<NOP>" then return
            when "<DISCARD>"
                event.stopPropagation()
                event.preventDefault()
            else
                (new g.CommandExecuter).set( com, times ).parse().execute()
                event.stopPropagation()
                event.preventDefault()

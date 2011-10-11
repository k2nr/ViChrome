
g  = this

sendToBackground = (com, args) ->
    chrome.extension.sendRequest {command : com, args : args}, g.handler.onCommandResponse

triggerInsideContent = (com, args) ->
    g.model.triggerCommand "req" + com, args

escape = (com) -> triggerInsideContent "Escape"

class g.CommandExecuter

    commandsBeforeReady : [
        "OpenNewTab"
        "CloseCurTab"
        "MoveToNextTab"
        "MoveToPrevTab"
        "NMap"
        "IMap"
        "Alias"
        "OpenNewWindow"
        "RestoreTab"
    ]

    commandTable :
        Open                  : triggerInsideContent
        OpenNewTab            : sendToBackground
        CloseCurTab           : sendToBackground
        MoveToNextTab         : sendToBackground
        MoveToPrevTab         : sendToBackground
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
        GoCommandMode         : triggerInsideContent
        GoSearchModeForward   : triggerInsideContent
        GoSearchModeBackward  : triggerInsideContent
        GoLinkTextSearchMode  : triggerInsideContent
        GoFMode               : triggerInsideContent
        FocusOnFirstInput     : triggerInsideContent
        BackToPageMark        : triggerInsideContent
        RestoreTab            : sendToBackground
        Escape                : escape
        # hidden commands
        "_ChangeLogLevel"     : triggerInsideContent

    get : -> @command

    set : (command, times) ->
        if not command then throw "invalid command"
        @command = command
                   .replace(/^[\t ]*/, "")
                   .replace(/[\t ]*$/, "")

        @times = times ? 1

        return this

    parse : ->
        @args = @command.split(/\ +/)
        if not @args or @args.length == 0 then throw "invalid command"

        aliases = g.model.getAlias()
        if aliases[ @args[0] ]
            @args = aliases[ @args[0] ].split(' ').concat( @args.slice(1) )

        if @commandTable[ @args[0] ]
            return this
        else
            throw "invalid command"

    execute : ->
        com  = @args[0]

        unless g.model.isReady() or com in @commandsBeforeReady then return

        setTimeout( =>
            while @times--
                @commandTable[com]( com, @args.slice(1) )
        , 0 )

class g.CommandManager
    keyQueue :
        init : ->
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
            if @waiting
                g.logger.e "startTimer:timer already running"
            else
                @waiting = true;
                @timerId = setTimeout( callback, ms )

        queue : (s) ->
            if s.search(/[0-9]/) >= 0 and @a.length == 0
                @times += s
            else
                @a += s

            return this

        reset : ->
            @a = ""
            @times = ""
            @stopTimer()

        isWaiting : -> @waiting

        getTimes : ->
            if @times.length == 0 then return 1
            parseInt @times, 10

        getNextKeySequence : ->
            @stopTimer()

            if g.model.isValidKeySeq(@a)
                ret = @a
                @reset()
                return ret
            else
                if not g.model.isValidKeySeqAvailable(@a)
                    g.logger.d "invalid key sequence: #{@a}"
                    @reset()
                else
                    @startTimer( =>
                        @a       = ""
                        @times   = ""
                        @waiting = false
                    , g.model.getSetting "commandWaitTimeOut" )

                return null

    constructor : -> @keyQueue.init()

    getCommandFromKeySeq : (s, keyMap) ->
        @keyQueue.queue(s)
        keySeq = @keyQueue.getNextKeySequence()

        if keyMap and keySeq
            return keyMap[keySeq]
        return

    reset : -> @keyQueue.reset()

    isWaitingNextKey : -> @keyQueue.isWaiting()

    handleKey : (msg, keyMap) ->
        s     = KeyManager.getKeyCodeStr(msg)
        times = @keyQueue.getTimes()
        com   = @getCommandFromKeySeq( s, keyMap )

        if com? and com != "<NOP>"
            (new g.CommandExecuter).set( com, times ).parse().execute()

            # some web sites set their own key bind(google instant search etc).
            # to prevent messing up vichrome's key bind from them,
            # we have to stop event propagation here.
            event.stopPropagation()
            event.preventDefault()
        else if @isWaitingNextKey()
            event.stopPropagation()
            event.preventDefault()

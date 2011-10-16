g  = this

sendToBackground = (com, args) ->
    chrome.extension.sendRequest {command : com, args : args}, g.handler.onCommandResponse

triggerInsideContent = (com, args) -> g.model.triggerCommand "req#{com}", args

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
        OpenNewTab            : triggerInsideContent
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
        FocusNextCandidate    : triggerInsideContent
        FocusPrevCandidate    : triggerInsideContent
        TriggerReadabilityRedux : sendToBackground
        Escape                : escape
        # hidden commands
        "_ChangeLogLevel"     : triggerInsideContent

    get : -> @command
    set : (command, times) ->
        if @command? then @command += " " else @command = ""
        @command += command
                    .replace(/^[\t ]*/, "")
                    .replace(/[\t ]*$/, "")
        @times = times ? 1
        this

    parse : ->
        unless @command then throw "invalid command"
        @args = @command.split(/\ +/)
        if not @args or @args.length == 0 then throw "invalid command"

        for i in [@args.length-1..0]
            if @args[i].length == 0
                @args.splice( i, 1 )

        aliases = g.model.getAlias()
        if aliases[ @args[0] ]
            @args = aliases[ @args[0] ].split(' ').concat( @args.slice(1) )

        if @commandTable[ @args[0] ]
            return this
        else throw "invalid command"

    execute : ->
        com  = @args[0]
        unless g.model.isReady() or com in @commandsBeforeReady then return

        setTimeout( =>
            @commandTable[com]( com, @args.slice(1) ) while @times--
            return
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
            if @waiting then return

            @waiting = true;
            @timerId = setTimeout( callback, ms )

        queue : (s) ->
            if s.length == 1 and s.search(/[0-9]/) >= 0 and @a.length == 0
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

            if g.model.isValidKeySeq(@a)
                ret = @a
                @reset()
                return ret
            else
                if g.model.isValidKeySeqAvailable(@a)
                    @startTimer( =>
                        @a       = ""
                        @times   = ""
                        @waiting = false
                    , g.model.getSetting "commandWaitTimeOut" )
                else
                    g.logger.d "invalid key sequence: #{@a}"
                    @reset()
                null

    constructor : -> @keyQueue.init()

    getCommandFromKeySeq : (s, keyMap) ->
        @keyQueue.queue(s)
        keySeq = @keyQueue.getNextKeySequence()

        if keyMap and keySeq then keyMap[keySeq] else null

    reset : -> @keyQueue.reset()

    isWaitingNextKey : -> @keyQueue.isWaiting()

    handleKey : (msg, keyMap) ->
        s     = KeyManager.getKeyCodeStr(msg)
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

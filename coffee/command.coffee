this.vichrome ?= {}
g = this.vichrome

sendToBackground = (com, args, times, timesSpecified) ->
    chrome.extension.sendRequest( {
        command : com
        args    : args
        times   : times
        timesSpecified : timesSpecified
    }, (msg) -> g.handler.onCommandResponse msg )

triggerInsideContent = (com, args, times, timesSpecified) ->
    g.model.triggerCommand "req#{com}", args, times, timesSpecified

passToTopFrame = (com, args, times, timesSpecified) ->
    chrome.extension.sendRequest( {
        command      : "TopFrame"
        innerCommand : com
        args         : args
        times        : times
        timesSpecified : timesSpecified
        senderFrameID  : g.model.frameID
    }, g.handler.onCommandResponse )

escape = (com) -> triggerInsideContent "Escape"


class g.CommandExecuter
    commandsBeforeReady : [
        "TabOpenNew"
        "TabCloseCurrent"
        "TabCloseAll"
        "TabFocusNext"
        "TabFocusPrev"
        "TabFocusFirst"
        "TabFocusLast"
        "TabFocusNextHistory"
        "TabFocusPrevHistory"
        "TabSwitchLast"
        "TabReloadAll"
        "NMap"
        "IMap"
        "Alias"
        "WinOpenNew"
        "OpenOptionPage"
        "RestoreTab"
    ]

    commandTable :
        Open                  : passToTopFrame
        TabOpenNew            : passToTopFrame
        TabCloseCurrent       : sendToBackground
        TabCloseAll           : sendToBackground
        TabFocusNext          : sendToBackground
        TabFocusPrev          : sendToBackground
        TabFocusNextHistory   : sendToBackground
        TabFocusPrevHistory   : sendToBackground
        TabFocusFirst         : sendToBackground
        TabFocusLast          : sendToBackground
        TabSwitchLast         : sendToBackground
        TabReload             : triggerInsideContent
        TabReloadAll          : sendToBackground
        TabList               : triggerInsideContent
        NMap                  : sendToBackground
        IMap                  : sendToBackground
        Alias                 : sendToBackground
        WinOpenNew            : sendToBackground
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
        GoEmergencyMode       : triggerInsideContent
        FocusOnFirstInput     : triggerInsideContent
        BackToPageMark        : triggerInsideContent
        RestoreTab            : sendToBackground
        FocusNextCandidate    : triggerInsideContent
        FocusPrevCandidate    : triggerInsideContent
        Readability           : sendToBackground
        OpenOptionPage        : sendToBackground
        BarrelRoll            : triggerInsideContent
        Copy                  : sendToBackground
        Escape                : escape
        HideJimmy             : triggerInsideContent
        ToggleImageSize       : triggerInsideContent
        # hidden commands
        "_ChangeLogLevel"     : triggerInsideContent

    get : -> @command ? ""
    getArgs : -> @args
    setDescription : (@description) -> this
    getDescription : -> @description
    reset : -> @command = null
    set : (command, times) ->
        if @command? then @command += " " else @command = ""
        @command += command
                    .replace(/^[\t ]*/, "")
                    .replace(/[\t ]*$/, "")
        @times = times ? 1
        @timesSpecified = if times? then true else false
        this

    delimLine : (line) ->
        result = []
        pos = 0
        pre = 0
        len = line.length
        while pos < len
            c = line.charAt(pos)
            switch c
                when " "
                    result.push line.slice( pre, pos )
                    ++pos while line.charAt(pos) == " "
                    pre = pos
                when "'","\""
                    start = pos
                    while line.charAt(++pos) != c
                        if pos >= len
                            pos = start
                            break
                    ++pos
                else ++pos

        result.push line.slice( pre, pos )

        for i in [result.length-1..0]
            if result[i].length == 0
                result.splice( i, 1 )

        result

    solveAlias : (alias) ->
        aliases = g.model.getAlias()
        alias = aliases[alias]
        while alias?
            command = alias
            alias = aliases[alias]
        command

    parse : ->
        unless @command then throw "invalid command"

        @args = @delimLine( @command )
        command = @solveAlias( @args[0] )
        if command?
            @args = @delimLine( command ).concat( @args.slice(1) )

        command = @command
        @args = []
        while command
            @args = @delimLine( command ).concat( @args.slice(1) )
            command = @solveAlias( @args[0] )

        if @commandTable[ @args[0] ]
            return this
        else throw "invalid command"

    execute : ->
        com  = @args[0]
        unless g.model.isReady() or com in @commandsBeforeReady then return

        setTimeout( =>
            @commandTable[com]( com, @args.slice(1), @times, @timesSpecified )
        , 0 )

class g.CommandManager
    keyQueue :
        init : (@model, @timeout, @useNumPrefix=true)->
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
            if @useNumPrefix and s.length == 1 and s.search(/[0-9]/) >= 0 and @a.length == 0
                @times += s
            else
                @a += s

            this

        reset : ->
            @a = ""
            @times = ""
            @stopTimer()

        isWaiting : -> @waiting

        getTimes : -> if @times.length > 0 then parseInt(@times, 10) else null

        getNextKeySequence : ->
            @stopTimer()

            if @model.isValidKeySeq(@times+@a)
                ret = { times: null, seq: @times+@a }
                @reset()
                return ret
            else if @model.isValidKeySeq(@a)
                ret = { times: @getTimes(), seq: ""+@a }
                @reset()
                return ret
            else
                if @model.isValidKeySeqAvailable(@times+@a) or @model.isValidKeySeqAvailable(@a)
                    @startTimer( =>
                        @a       = ""
                        @times   = ""
                        @waiting = false
                    , @timeout )
                else
                    g.logger.d "invalid key sequence: #{@a}"
                    @reset()
                null

        setUseNumPrefix  : (@useNumPrefix) -> this

    constructor : (@model, timeout, useNumPrefix=true) ->
        @keyQueue.init( @model, timeout, useNumPrefix )

    getCommandFromKeySeq : (s, keyMap) ->
        @keyQueue.queue(s)
        keySeq = @keyQueue.getNextKeySequence()

        if keyMap and keySeq
            return { times: keySeq.times, str: keyMap[keySeq.seq] }
        else
            return null

    reset : -> @keyQueue.reset()

    isWaitingNextKey : -> @keyQueue.isWaiting()
    setUseNumPrefix : (use) -> @keyQueue.setUseNumPrefix( use )

    handleKey : (msg, keyMap) ->
        s     = g.KeyManager.getKeyCodeStr(msg)
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
                @execCommand(com)
                event.stopPropagation()
                event.preventDefault()
    execCommand : (com) ->
        (new g.CommandExecuter).set( com.str, com.times ).parse().execute()


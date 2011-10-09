vichrome.command = {};


(function(o) {
    function sendToBackground (com, args) {
        chrome.extension.sendRequest({command : com, args : args},
            vichrome.handler.onCommandResponse );
    }

    function triggerInsideContent(com, args) {
        vichrome.model.triggerCommand( "req" + com, args );
    }

    function escape(com) {
        triggerInsideContent("Escape");
    }

    // commands that can be executed before DOM is ready
    commandsBeforeReady = [
        "OpenNewTab",
        "CloseCurTab",
        "MoveToNextTab",
        "MoveToPrevTab",
        "NMap",
        "IMap",
        "Alias",
        "OpenNewWindow",
        "RestoreTab"
    ];

    commandTable = {
        Open                  : triggerInsideContent,
        OpenNewTab            : sendToBackground,
        CloseCurTab           : sendToBackground,
        MoveToNextTab         : sendToBackground,
        MoveToPrevTab         : sendToBackground,
        NMap                  : sendToBackground,
        IMap                  : sendToBackground,
        Alias                 : sendToBackground,
        OpenNewWindow         : sendToBackground,
        ReloadTab             : triggerInsideContent,
        ScrollUp              : triggerInsideContent,
        ScrollDown            : triggerInsideContent,
        ScrollLeft            : triggerInsideContent,
        ScrollRight           : triggerInsideContent,
        PageHalfUp            : triggerInsideContent,
        PageHalfDown          : triggerInsideContent,
        PageUp                : triggerInsideContent,
        PageDown              : triggerInsideContent,
        GoTop                 : triggerInsideContent,
        GoBottom              : triggerInsideContent,
        NextSearch            : triggerInsideContent,
        PrevSearch            : triggerInsideContent,
        BackHist              : triggerInsideContent,
        ForwardHist           : triggerInsideContent,
        GoCommandMode         : triggerInsideContent,
        GoSearchModeForward   : triggerInsideContent,
        GoSearchModeBackward  : triggerInsideContent,
        GoLinkTextSearchMode  : triggerInsideContent,
        GoFMode               : triggerInsideContent,
        FocusOnFirstInput     : triggerInsideContent,
        BackToPageMark        : triggerInsideContent,
        RestoreTab            : sendToBackground,
        Escape                : escape,

        // hidden commands
        _ChangeLogLevel       : triggerInsideContent
    };


    vichrome.command.CommandExecuter = {
        get : function() {
            return this.command;
        },

        set : function(command, times) {
            if( !command ) {
                throw "invalid command";
            }
            this.command = command
            .replace(/^[\t ]*/, "")
            .replace(/[\t ]*$/, "");

            if( !times && times !== 0 ) { times = 1; }
            this.times = times;

            return this;
        },

        parse : function() {
            var aliases = vichrome.model.getAlias();

            this.args = this.command.split(/ +/);
            if( !this.args || this.args.length === 0 ) {
                throw "invalid command";
            }

            if( aliases[ this.args[0] ] ) {
                this.args = aliases[ this.args[0] ]
                .split(' ')
                .concat( this.args.slice(1) );
            }
            if( commandTable[ this.args[0] ] ) {
                return this;
            } else {
                throw "invalid command";
            }
        },

        execute : function() {
            var times = this.times, com, args;

            args = this.args.slice(1);
            com  = this.args[0];

            if( !vichrome.model.isReady() && commandsBeforeReady.indexOf(com) < 0 ) {
                return;
            }

            setTimeout( function() {
                while( times-- ) {
                    commandTable[com](com, args);
                }
            }, 0);
        }
    };
}());

// command Manager definition
(function() {
    // dependencies
    var keyQueue,
        KeyManager   = vichrome.key.KeyManager,
        CommandExecuter = vichrome.command.CommandExecuter;

    // keyQueue definition
    (function() {
        var logger = vichrome.log.logger,
        a         = "",
        times     = "",
        timerId   = 0,
        waiting = false;

        function stopTimer() {
            if( waiting ) {
                logger.d("stop timeout");
                clearTimeout( timerId );
                waiting = false;
            }
        }

        function startTimer( callback, ms ) {
            if( waiting ) {
                logger.e("startTimer:timer already running");
            } else {
                waiting = true;
                timerId = setTimeout( callback, ms );
            }
        }

        keyQueue = {
            queue : function(s) {
                if( s.search(/[0-9]/) >= 0 && a.length === 0 ) {
                    times += s;
                } else {
                    a += s;
                }

                return this;
            },

            reset : function() {
                a = "";
                times = "";
                stopTimer();
            },

            isWaiting : function() {
                return waiting;
            },

            getTimes : function() {
                if( times.length === 0 ) {
                    return 1;
                }

                return parseInt( times, 10 );
            },

            // returns valid key sequence.if valid key sequence isn't built up, return null
            getNextKeySequence : function() {
                stopTimer();

                if( vichrome.model.isValidKeySeq(a) ) {
                    // keySeq has corresponding command
                    ret = a;
                    this.reset();
                    return ret;
                } else {
                    if( !vichrome.model.isValidKeySeqAvailable(a) ) {
                        logger.d("invalid key sequence:" + a);
                        this.reset();
                    } else {
                        // possible key sequences are available.wait next key.
                        startTimer( function() {
                            a       = "";
                            times   = "";
                            waiting = false;
                        }, vichrome.model.getSetting("commandWaitTimeOut") );
                    }
                    return null;
                }
            }
        };
    }());

    function getCommandFromKeySeq (s, keyMap) {
        var keySeq;

        keyQueue.queue(s);
        keySeq = keyQueue.getNextKeySequence();

        if( keyMap && keySeq ) {
            return keyMap[keySeq];
        }
    }

    vichrome.command.commandManager = {
        reset : function() {
            keyQueue.reset();
        },

        isWaitingNextKey : function() {
            return keyQueue.isWaiting();
        },

        handleKey : function(msg, keyMap){
            var s     = KeyManager.getKeyCodeStr(msg),
            times = keyQueue.getTimes(),
            com   = getCommandFromKeySeq( s, keyMap );

            if( com && com !== "<NOP>" ) {
                vichrome.object( CommandExecuter )
                .set( com, times ).parse().execute();

                // some web sites set their own key bind(google instant search etc).
                // to prevent messing up vichrome's key bind from them,
                // we have to stop event propagation here.
                event.stopPropagation();
                event.preventDefault();
            } else if( this.isWaitingNextKey() ) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
}());

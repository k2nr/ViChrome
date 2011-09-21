vichrome.command = {};

vichrome.command.KeyQueue = function(){
    var a         = "",
        timerId   = 0,
        waiting = false;

    function stopTimer() {
        if( waiting ) {
            vichrome.log.logger.d("stop timeout");
            clearTimeout( timerId );
            waiting = false;
        }
    }

    function startTimer( callback, ms ) {
        if( waiting ) {
            vichrome.log.logger.e("startTimer:timer already running");
        } else {
            vichrome.log.logger.d("commandTimer set");
            waiting = true;
            setTimeout( callback, ms );
        }
    }

    if( !(this instanceof vichrome.command.KeyQueue) ) {
        return new vichrome.command.KeyQueue();
    }


    this.queue = function(s) {
        a += s;
        return this;
    };

    this.reset = function() {
        a = "";
        stopTimer();
    };

    this.isWaiting = function() {
        return waiting;
    };

    // returns valid key sequence.if valid key sequence isn't built up, return null
    this.getNextKeySequence = function() {
        stopTimer();

        if( vichrome.model.isValidKeySeq(a) ) {
            // keySeq has corresponding command
            ret = a;
            a = "";
            return ret;
        } else {
            if( !vichrome.model.isValidKeySeqAvailable(a) ) {
                vichrome.log.logger.d("invalid key sequence:" + a);
                a = "";
            } else {
                // possible key sequences are available.wait next key.
                startTimer( function() {
                    vichrome.log.logger.d("command wait timeout.reset key queue:" + a);
                    a = "";
                    waiting = false;
                }, vichrome.model.getSetting("commandWaitTimeOut") );
            }
            return null;
        }
    };
};

vichrome.command.CommandExecuter = function() {
};

(function(o) {
    function sendToBackground (com, args) {
        chrome.extension.sendRequest({command : com, args : args},
            vichrome.handler.onCommandResponse );
    }

    function triggerInsideContent(com, args) {
        vichrome.model.triggerCommand( "req" + com, args );
    }

    function escape(com) {
        triggerInsideContent("Blur");
    }

    o.commandTable = {
        Open                  : triggerInsideContent,
        OpenNewTab            : sendToBackground,
        CloseCurTab           : sendToBackground,
        MoveNextTab           : sendToBackground,
        MovePrevTab           : sendToBackground,
        NMap                  : sendToBackground,
        IMap                  : sendToBackground,
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
        GoFMode               : triggerInsideContent,
        GoFModeWithNewTab     : triggerInsideContent,
        FocusOnFirstInput     : triggerInsideContent,
        BackToPageMark        : triggerInsideContent,
        RestoreTab            : sendToBackground,
        Escape                : escape
    };

    o.get = function() {
        return this.command;
    };

    o.set = function(command) {
        if( !command ) {
            throw "invalid command";
        }
        this.command = command
                       .replace(/^[\t ]*/, "")
                       .replace(/[\t ]*$/, "");

        return this;
    };

    o.parse = function() {
        var aliases = vichrome.model.getSetting("aliases");

        this.args = this.command.split(/ +/);
        if( !this.args || this.args.length === 0 ) {
            throw "invalid command";
        }

        if( aliases[ this.args[0] ] ) {
            this.args = aliases[ this.args[0] ]
                        .split(' ')
                        .concat( this.args.slice(1) );
        }
        if( this.commandTable[ this.args[0] ] ) {
            return this;
        } else {
            throw "invalid command";
        }
    };

    o.execute = function() {
        var com, args, commandTable = this.commandTable;

        args = this.args.slice(1);
        com  = this.args[0];

        setTimeout( function() {
            commandTable[com](com, args);
        }, 0);
    };
}(vichrome.command.CommandExecuter.prototype));

vichrome.command.CommandManager = function(m) {
    // dependencies
    var KeyQueue     = vichrome.command.KeyQueue,
        KeyManager   = vichrome.key.KeyManager,
        keyQueue     = new KeyQueue(),
        model        = m,
        CommandExecuter = vichrome.command.CommandExecuter;

    function getCommandFromKeySeq (s) {
        var keySeq,
            keyMap = model.getKeyMapping();

        if( s === "<ESC>" ) {
            keyQueue.reset();
            keySeq = s;
        } else {
            keyQueue.queue(s);
            keySeq = keyQueue.getNextKeySequence();
        }

        if( keyMap && keySeq ) {
            return keyMap[keySeq];
        }
    }

    this.reset = function() {
        keyQueue.reset();
    };

    this.isWaitingNextKey = function() {
        return keyQueue.isWaiting();
    };

    this.handleKey = function(msg){
        var s   = KeyManager.getKeyCodeStr(msg),
            com = getCommandFromKeySeq( s ),
            executer;

        if( com ) {
            executer = new CommandExecuter();
            executer.set(com).parse().execute();

            // some web sites set their own key bind(google instant search etc).
            // to prevent messing up vichrome's key bind from them,
            // we have to stop event propagation here.
            event.stopPropagation();
            event.preventDefault();
        } else if( this.isWaitingNextKey() ) {
            event.stopPropagation();
            event.preventDefault();
        }
    };
};


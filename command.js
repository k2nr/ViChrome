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

    // returns right key sequence.if right key sequence isn't built up, return null
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


vichrome.command.CommandManager = function(m) {
    // dependencies
    var KeyQueue     = vichrome.command.KeyQueue,
        KeyManager   = vichrome.key.KeyManager,
        keyQueue     = new KeyQueue(),
        model        = m,
        commandTable = {
            OpenNewTab            : sendToBackground,
            CloseCurTab           : sendToBackground,
            MoveNextTab           : sendToBackground,
            MovePrevTab           : sendToBackground,
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
            Escape                : escape
        };

    function getCommand (s) {
        var keySeq,
            keyMap = model.getSetting("keyMappings");

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

    function executeCommand (com) {
        setTimeout( function() {
            commandTable[com](com);
        }, 0);
    }

    function escape(com) {
        keyQueue.reset();
        triggerInsideContent("Blur");
    }

    function sendToBackground (com) {
        chrome.extension.sendRequest({command : com});
    }

    function triggerInsideContent(com) {
        model.triggerCommand( "req" + com );
    }

    this.isWaitingNextKey = function() {
        return keyQueue.isWaiting();
    };

    this.handleKey = function(msg){
        var s   = KeyManager.getKeyCodeStr(msg),
            com = getCommand( s );

        if( com ) {
            // some web sites set their own key bind(google instant search etc).
            // to prevent messing up vichrome's key bind from them,
            // we have to stop event propagation here.
            event.stopPropagation();
            event.preventDefault();

            executeCommand( com );
        } else if( this.isWaitingNextKey() ) {
            event.stopPropagation();
            event.preventDefault();
        }
    };
};


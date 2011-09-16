var KeyQueue = function(){
    this.a = "";
    this.timerId = 0;
    this.isWaiting = false;

    this.queue = function(s) {
        this.a += s;
        return this;
    };

    this.reset = function() {
        this.a = "";
        this.stopTimer();
    };

    this.stopTimer = function() {
        if( this.isWaiting ) {
            Logger.d("stop timeout");
            clearTimeout( this.timerId );
            this.isWaiting = false;
        }
    };

    this.startTimer = function( callback, ms ) {
        if( this.isWaiting ) {
            Logger.e("startTimer:timer already running");
        } else {
            Logger.d("commandTimer set");
            this.isWaiting = true;
            setTimeout( callback, ms );
        }
    };

    // returns right key sequence.if right key sequence isn't built up, return null
    this.getNextKeySequence = function() {
        this.stopTimer();

        if( SettingManager.isValidKeySeq(this.a) ) {
            // keySeq has corresponding command
            ret = this.a;
            this.a = "";
            return ret;
        } else {
            if( !SettingManager.isValidKeySeqAvailable(this.a) ) {
                Logger.d("invalid key sequence:" + this.a);
                this.a = "";
            } else {
                // possible key sequences are available.wait next key.
                var thisObj = this;

                this.startTimer( function() {
                    Logger.d("command wait timeout.reset key queue:" + thisObj.a);
                    thisObj.a = "";
                    thisObj.isWaiting = false;
                }, SettingManager.get("commandWaitTimeOut") );
            }
            return null;
        }
    };
};
var keyQueue = new KeyQueue ();



function CommandManager() {
    var keyQueue = new KeyQueue();

    function getCommand (s) {
        var keySeq,
        keyMap = vichrome.getSetting("keyMappings");

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
        var commandTable = {
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
        if(vichrome.mode["req"+com]) {
            vichrome.mode["req"+com]();
        } else {
            Logger.e("INVALID command!:", com);
        }
    }

    this.isWaitingNextKey = function() {
        return keyQueue.isWaiting;
    };

    this.handleKey = function(e){
        var s = KeyManager.convertKeyCodeToStr(e),
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
}
var commandManager = new CommandManager();


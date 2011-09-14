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

function sendRequestToSelectedTab (com) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {command:com}, function(){});
    });
}

function openNewTab () {
    chrome.tabs.create({}, function(tab){});
}

function closeCurTab () {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.remove(tab.id, function(){});
    });
}

function escape () {
    keyQueue.reset();
    sendRequestToSelectedTab( "Blur" );
}

function moveTab ( offset ) {
    chrome.tabs.getAllInWindow( null, function( tabs ) {
        var nTabs = tabs.length;
        chrome.tabs.getSelected(null, function( tab ) {
            var idx = tab.index + offset;
            if( idx < 0 ) {
                idx = nTabs - 1;
            } else if( idx >= nTabs ) {
                idx = 0;
            }
            chrome.tabs.update( tabs[idx].id, { selected:true }, function(){ });
        });
    });
}

function moveNextTab () {
    moveTab( 1 );
}

function movePrevTab () {
    moveTab( -1 );
}



var commandTable = {
    OpenNewTab            : openNewTab,
    CloseCurTab           : closeCurTab,
    MoveNextTab           : moveNextTab,
    MovePrevTab           : movePrevTab,
    ReloadTab             : sendRequestToSelectedTab,
    ScrollUp              : sendRequestToSelectedTab,
    ScrollDown            : sendRequestToSelectedTab,
    ScrollLeft            : sendRequestToSelectedTab,
    ScrollRight           : sendRequestToSelectedTab,
    PageHalfUp            : sendRequestToSelectedTab,
    PageHalfDown          : sendRequestToSelectedTab,
    PageUp                : sendRequestToSelectedTab,
    PageDown              : sendRequestToSelectedTab,
    GoTop                 : sendRequestToSelectedTab,
    GoBottom              : sendRequestToSelectedTab,
    NextSearch            : sendRequestToSelectedTab,
    PrevSearch            : sendRequestToSelectedTab,
    BackHist              : sendRequestToSelectedTab,
    ForwardHist           : sendRequestToSelectedTab,
    GoCommandMode         : sendRequestToSelectedTab,
    GoSearchModeForward   : sendRequestToSelectedTab,
    GoSearchModeBackward  : sendRequestToSelectedTab,
    GoFMode               : sendRequestToSelectedTab,
    FocusOnFirstInput     : sendRequestToSelectedTab,
    Escape                : escape
};

function getCommand (s) {
    var keySeq,
        keyMap = SettingManager.get("keyMappings");

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
    commandTable[com](com);
}


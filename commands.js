
var commandTable = {
     openNewTab      : openNewTab
    ,closeCurTab     : closeCurTab
    ,moveNextTab     : moveNextTab
    ,movePrevTab     : movePrevTab
    ,reloadTab       : sendRequestToSelectedTab
    ,scrollUp        : sendRequestToSelectedTab
    ,scrollDown      : sendRequestToSelectedTab
    ,scrollLeft      : sendRequestToSelectedTab
    ,scrollRight     : sendRequestToSelectedTab
    ,pageHalfUp      : sendRequestToSelectedTab
    ,pageHalfDown    : sendRequestToSelectedTab
    ,pageUp          : sendRequestToSelectedTab
    ,pageDown        : sendRequestToSelectedTab
    ,goTop           : sendRequestToSelectedTab
    ,goBottom        : sendRequestToSelectedTab
    ,backHist        : sendRequestToSelectedTab
    ,forwardHist     : sendRequestToSelectedTab
    ,goCommandMode   : sendRequestToSelectedTab
    ,goSearchMode    : sendRequestToSelectedTab
    ,goFMode         : sendRequestToSelectedTab
    ,escape          : escape
}

var KeyQueue = function(){
    this.a = "";
    this.timerId = 0;
    this.isWaiting = false;

    this.queue = function(s) {
        this.a += s;
        return this;
    }

    this.reset = function() {
        this.a = "";
        this.stopTimer();
    }

    this.stopTimer = function() {
        if( this.isWaiting ) {
            Logger.d("stop timeout");
            clearTimeout( this.timerId );
            this.isWaiting = false;
        }
    }

    this.startTimer = function( callback, ms ) {
        if( this.isWaiting ) {
            Logger.e("startTimer:timer already running");
        } else {
            Logger.d("commandTimer set");
            this.isWaiting = true;
            setTimeout( callback, ms );
        }
    }

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
    }
};

var keyQueue = new KeyQueue ();

function executeCommand (com) {
    commandTable[com](com);
}

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

function moveNextTab () {
    moveTab( 1 );
}

function movePrevTab () {
    moveTab( -1 );
}

function escape () {
    keyQueue.reset();
    sendRequestToSelectedTab( "blur" );
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

function getCommand (s) {
    if( s == "<ESC>" ) {
        keyQueue.reset();
        var keySeq = s;
    } else {
        keyQueue.queue(s);
        var keySeq = keyQueue.getNextKeySequence();
    }

    var keyMap = SettingManager.get("keyMappings");
    if( keyMap && keySeq )
        return keyMap[keySeq];
}

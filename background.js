var closeHistStack = [];
var openTabs = {};
vichrome={};
vichrome.log={};

function getSettings (msg, response) {
    var sendMsg = {};

    sendMsg.name = msg.name;

    if( msg.name === "all" ) {
        sendMsg.value = SettingManager.getAll();
    } else {
        sendMsg.value = SettingManager.get(msg.name);
    }

    response( sendMsg );
}

function setSettings (msg, response) {
    SettingManager.set( msg.name, msg.value );
    response();
}

function reqSettings (msg, response) {
    if( msg.type === "get" ) {
        getSettings( msg, response );
    } else if( msg.type === "set" ) {
        setSettings( msg, response );
    }

    return true;
}

function notifySettingUpdated(name, value) {
}

function reqOpenNewTab () {
    chrome.tabs.create({}, function(tab){});
}

function reqCloseCurTab () {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.remove(tab.id, function(){});
    });
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

function reqMoveNextTab () {
    moveTab( 1 );
}

function reqMovePrevTab () {
    moveTab( -1 );
}

function initTabHist(winId) {
    chrome.windows.getAll( {populate : true}, function(wins) {
        var i, j, tabLen, winLen=wins.length, tab, win;

        for(i=0; i < winLen; i++) {
            win = wins[i];
            tabLen = win.tabs.length;
            openTabs[win.id] = {};
            for(j=0; j < tabLen; j++) {
                tab = win.tabs[j];
                openTabs[win.id][tab.id] = tab;
            }
        }
    });
}

function reqRestoreTab(req, sendResponse) {
    var tab = closeHistStack.pop();
    if( tab ) {
        chrome.windows.update( tab.windowId, { focused : true } );
        chrome.tabs.create({windowId : tab.windowId, url : tab.url});
    }
}

function init () {
    var that = this,
        logger = vichrome.log.logger;

    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener( portListeners[port.name] );
        ports[port.name] = port;
    });

    chrome.extension.onRequest.addListener(
        function( req, sender, sendResponse ) {
            if(that["req"+req.command]) {
                if( !that["req"+req.command]( req, sendResponse ) ) {
                    sendResponse();
                }
            } else {
                vichrome.log.logger.e("INVALID command!:", req.command);
            }
        }
    );

    initTabHist();

    //TODO: restore tab
    chrome.tabs.onRemoved.addListener( function (tabId, info) {
        logger.d("tab removed id:" + tabId);
        if( info.isWindowClosing ) {
            return;
        }

        var i, hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in openTabs ) if( hasOwnPrp.call( openTabs, i ) ) { if( openTabs[i][tabId] ) {
                closeHistStack.push( openTabs[i][tabId] );
                if( closeHistStack.length > 10 ) {
                    closeHistStack.shift();
                }
                delete openTabs[i][tabId];
                return;
            }
        }
    });
    chrome.tabs.onCreated.addListener( function (tab) {
        logger.d("tab created id:" + tab.id);
        openTabs[tab.windowId][tab.id] = tab;
    });
    chrome.tabs.onAttached.addListener( function (tabId, aInfo) {
        logger.d("tab attached tab:" + tabId + " -> win:" + aInfo.newWindowId);
        chrome.tabs.get( tabId, function(tab) {
            openTabs[aInfo.newWindowId][tabId] = tab;
        });
    });
    chrome.tabs.onDetached.addListener( function (tabId, dInfo) {
        logger.d("tab detached tab:" + tabId + " <- win:" + dInfo.oldWindowId);
        delete openTabs[dInfo.oldWindowId][tabId];
    });

    chrome.tabs.onUpdated.addListener( function(tabId, info, tab) {
        var target = openTabs[tab.windowId][tabId];
        if( info.url ) {
            target.url = info.url;
        }
        if( info.pinned ) {
            target.pinned = info.pinned;
        }
    });


    chrome.windows.onCreated.addListener( function (win) {
        logger.d("win created id:" + win.id);
        openTabs[win.id] = {};
    });
    chrome.windows.onRemoved.addListener( function (winId) {
        delete openTabs[winId];
    });
}


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

function reqOpenNewTab (req) {
    var url;
    if( req.args[0] ) {
        url = req.args[0];
    }

    chrome.tabs.create( {url : url} );
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
                addOpenTabItem( tab );
            }
        }
    });
}

function reqRestoreTab(req, sendResponse) {
    var item = closeHistStack.pop();
    if( item ) {
        chrome.windows.update( item.tab.windowId, { focused : true } );
        chrome.tabs.create({ windowId : item.tab.windowId,
                             url : item.tab.url },
                           function(tab) {
            item.history.pop();
            chrome.tabs.sendRequest( tab.id, {command : "UpdateHistoryState",
                                              args    : item.history} );
        });
    }
}

function findOpenTabItem( tabId ) {
    var i, hasOwnPrp  = Object.prototype.hasOwnProperty;

    for ( i in openTabs ) if( hasOwnPrp.call( openTabs, i ) ) {
        if( openTabs[i][tabId] ) {
            return openTabs[i][tabId];
        }
    }
}

function popOpenTabItem( tabId ) {
    var i, result, hasOwnPrp  = Object.prototype.hasOwnProperty;

    for ( i in openTabs ) if( hasOwnPrp.call( openTabs, i ) ) {
        if( openTabs[i][tabId] ) {
            result = openTabs[i][tabId];
            openTabs[i][tabId] = undefined;
            return result;
        }
    }
}

function addOpenTabItem( tab, history ) {
    openTabs[tab.windowId][tab.id] = {};
    openTabs[tab.windowId][tab.id].tab = tab;
    if( history ) {
        openTabs[tab.windowId][tab.id].history = history;
    } else {
        openTabs[tab.windowId][tab.id].history = [];
        openTabs[tab.windowId][tab.id].history.push( tab.url );
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

        var item = popOpenTabItem( tabId );

        if( item ) {
            closeHistStack.push( item );
            if( closeHistStack.length > 10 ) {
                closeHistStack.shift();
            }
            return;
        }
    });
    chrome.tabs.onCreated.addListener( function (tab) {
        logger.d("tab created id:" + tab.id);
        addOpenTabItem( tab );
    });
    chrome.tabs.onAttached.addListener( function (tabId, aInfo) {
        logger.d("tab attached tab:" + tabId + " -> win:" + aInfo.newWindowId);
        chrome.tabs.get( tabId, function(tab) {
            addOpenTabItem( tab );
        });
    });
    chrome.tabs.onDetached.addListener( function (tabId, dInfo) {
        logger.d("tab detached tab:" + tabId + " <- win:" + dInfo.oldWindowId);
        popOpenTabItem( tabId );
        //delete openTabs[dInfo.oldWindowId][tabId];
    });

    chrome.tabs.onUpdated.addListener( function(tabId, info, tab) {
        var target = openTabs[tab.windowId][tabId];
        if( info.url ) {
            target.tab.url = info.url;
            target.history.push( info.url );
        }
        if( info.pinned ) {
            target.tab.pinned = info.pinned;
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


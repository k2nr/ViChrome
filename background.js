vichrome={};
vichrome.log={};
var tabHistory;

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

function getSettings (msg, response) {
    var sendMsg = {};

    sendMsg.name = msg.name;

    if( msg.name === "all" ) {
        sendMsg.value = SettingManager.getAll();
    } else {
        sendMsg.value = SettingManager.get( msg.name );
    }

    response( sendMsg );
}

function setSettings (msg, response) {
    SettingManager.set( msg.name, msg.value );
}


//  Request Handlers
//
function reqSettings (msg, response) {
    if( msg.type === "get" ) {
        getSettings( msg, response );
    } else if( msg.type === "set" ) {
        setSettings( msg, response );
    }

    return true;
}

function getDefaultNewTabPage() {
    switch( SettingManager.get("defaultNewTab") ) {
        case "home"   : return undefined;
        case "newtab" : return "chrome://newtab";
        case "blank"  : return "about:blank";
    }
}

function reqOpenNewTab (req) {
    var url, urls = [], i, len = req.args.length, focus = true, pinned = false;

    for(i=0; i < len; i++) {
        switch( req.args[i] ) {
            case "-b":
            case "--background":
                focus = false;
                break;
            case "-p":
            case "--pinned":
                pinned = true;
                break;
            default:
                urls.push( req.args[i] );
                break;
        }
    }

    len = urls.length;
    if( len === 0 ) {
        url = getDefaultNewTabPage();
        chrome.tabs.create( {url : url, selected : focus, pinned : pinned} );
    } else {
        for(i=0; i < len; i++) {
            chrome.tabs.create({url : urls[i], selected : focus, pinned :pinned});
        }
    }
}

function reqOpenNewWindow (req) {
    var urls = [], i, len = req.args.length, focus = true, pop = false;

    for(i=0; i < len; i++) {
        switch( req.args[i] ) {
            case "-b":
            case "--background":
                focus = false;
                break;
            case "-p":
            case "--pop":
                pop = true;
                break;
            default:
                if( req.args[0] ) {
                    urls.push( req.args[0] );
                }
                break;
        }
    }

    if( pop ) {
        chrome.tabs.getSelected(null, function(tab) {
            if( urls.length === 0 ) {
                chrome.windows.create( {focused : focus, tabId : tab.id} );
            } else {
                chrome.windows.create( {url : urls, focused : focus, tabId : tab.id} );
            }
        });
    } else {
        if( urls.length === 0 ) {
            urls = getDefaultNewTabPage();
        }

        chrome.windows.create( {url : urls, focused : focus} );
    }
}

function reqCloseCurTab () {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.remove(tab.id, function(){});
    });
}

function reqMoveToNextTab () {
    moveTab( 1 );
}

function reqMoveToPrevTab () {
    moveTab( -1 );
}


function reqRestoreTab(req) {
    tabHistory.restoreLastClosedTab();
}

function reqNMap(req, sendResponse) {
    if( !req.args[0] || !req.args[1] ) {
        return;
    }

    var msg = {}, map;

    map = SettingManager.setNMap( req.args );
    msg.command = "Settings";
    msg.name    = "keyMappingNormal";
    msg.value   = map;
    sendResponse(msg);

    return true;
}

function reqIMap(req, sendResponse) {
    if( !req.args[0] || !req.args[1] ) {
        return;
    }

    var msg = {}, map;

    map = SettingManager.setIMap( req.args );
    msg.command = "Settings";
    msg.name    = "keyMappingInsert";
    msg.value   = map;
    sendResponse(msg);

    return true;
}

function reqAlias(req, sendResponse) {
    if( !req.args[0] || !req.args[1] ) {
        return;
    }

    var msg = {}, map;

    map = SettingManager.setAlias( req.args );
    msg.command = "Settings";
    msg.name    = "aliases";
    msg.value   = map;
    sendResponse(msg);

    return true;
}

function init () {
    var that = this,
        logger = vichrome.log.logger;

    tabHistory = new TabHistory();
    tabHistory.init();

    SettingManager.init();

    chrome.extension.onRequest.addListener(
        function( req, sender, sendResponse ) {
            if( that["req"+req.command] ) {
                if( !that["req"+req.command]( req, sendResponse ) ) {
                    sendResponse();
                }
            } else {
                logger.e("INVALID command!:", req.command);
            }
        }
    );
}


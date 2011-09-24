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
        sendMsg.value = SettingManager.get(msg.name);
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
    var url;
    if( req.args[0] ) {
        url = req.args[0];
    } else {
        url = getDefaultNewTabPage();
    }

    chrome.tabs.create( {url : url} );
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

    map = SettingManager.setNormalKeyMapping( req.args[0], req.args[1] );
    msg.command = "Settings";
    msg.name    = "keyMappingNormal";
    msg.value   = map;
    sendResponse(msg);

    chrome.management.getAll(function(infos) {
        var i;
        for( i=0; i<infos.length; i++ ) {
            if( infos[i].isApp ) {
                vichrome.log.logger.e("app:", infos[i]);
            }
        }
    });

    return true;
}

function reqIMap(req, sendResponse) {
    if( !req.args[0] || !req.args[1] ) {
        return;
    }

    var msg = {}, map;

    map = SettingManager.setInsertKeyMapping( req.args[0], req.args[1] );
    msg.command = "Settings";
    msg.name    = "keyMappingInsert";
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


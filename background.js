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

function init () {
    var that = this;

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

    //SettingManager.setCb = notifySettingUpdated;
}


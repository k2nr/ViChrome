var ports = {};

function getSettings (msg, port) {
    var sendMsg = {};

    sendMsg.name = msg.name;

    if( msg.name === "all" ) {
        sendMsg.value = SettingManager.getAll();
    } else {
        sendMsg.value = SettingManager.get(msg.name);
    }

    port.postMessage( sendMsg );
}

function setSettings (msg, port) {
    SettingManager.set( msg.name, msg.value );
}

function reqSettings (msg, port) {
    if( msg.type === "get" ) {
        getSettings( msg, port );
    } else if( msg.type === "set" ) {
        setSettings( msg, port );
    }
}

function notifySettingUpdated(name, value) {
    var sendMsg = { name : name, value : value };
    ports.settings.postMessage( sendMsg );
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
    var portListeners = {
        settings    : reqSettings
    };

    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener( portListeners[port.name] );
        ports[port.name] = port;
    });

    chrome.extension.onRequest.addListener(
        function( req, sender, sendResponse ) {
            if(this["req"+req.command]) {
                this["req"+req.command]();
            } else {
                Logger.e("INVALID command!:", req.command);
            }

            sendResponse();
        }
    );

    SettingManager.setCb = notifySettingUpdated;
}


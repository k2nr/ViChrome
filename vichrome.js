var portListeners = {
     key         : onKeyDown
    ,reqSettings : reqGetSettings
}

function onKeyDown (msg) {
    var s = KeyManager.convertKeyCodeToStr(msg);
    com = getCommand( s );
    Logger.d( "onKeyDown: " + s + " : " + com );
    if( com ) {
        executeCommand( com );
    }
}

function reqGetSettings (msg, port) {
    sendMsg = {name : msg.name};

    if(msg.name == "all") {
        sendMsg["value"] = SettingManager.getAll();
    } else {
        sendMsg["value"] = SettingManager.get(msg.name);
    }

    port.postMessage( sendMsg );
}

function init () {
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener( portListeners[port.name] );
    });
}


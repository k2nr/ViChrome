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

function onKeyDown (msg) {
    var s = KeyManager.convertKeyCodeToStr(msg),
        com = getCommand( s );

    Logger.d( "onKeyDown: " + s + " : " + com );
    if( com ) {
        executeCommand( com );
    }
}

function init () {
    var portListeners = {
        key         : onKeyDown,
        settings    : reqSettings
    };

    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener( portListeners[port.name] );
        ports[port.name] = port;
    });

    SettingManager.setCb = notifySettingUpdated;
}


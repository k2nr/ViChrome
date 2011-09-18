vichrome.event = {};

vichrome.event.EventHandler =  function(m, v) {
    // dependencies
    var keyCodes         = vichrome.key.keyCodes,
        KeyManager       = vichrome.key.KeyManager,
        util             = vichrome.util,
        logger           = vichrome.log.logger,

    // private variables
        model = m,
        view = v,
        settingPort = null;

    function onBlur (e) {
        logger.d("onBlur");
        model.blur();
    }

    function onKeyDown (e) {
        logger.d("onKeyDown", e);

        var msg = getHandlableKey( e );
        if( msg ) {
            model.handleKey(msg);
        }
    }

    function onKeyPress (e) {
        logger.d( "onKeyPress", e );
    }

    function onKeyUp (e) {
        logger.d( "onKeyUp", e );

        view.notifyInputUpdated();
    }


    // decide whether to post the key event and do some pre-post process
    // return true if the key event can be posted.
    function getHandlableKey (e) {
        // vichrome doesn't handle meta and alt key for now
        if( e.metaKey || e.altKey ) {
            return undefined;
        }

        if( KeyManager.isOnlyModifier( e.keyIdentifier, e.ctrlKey,
                                       e.shiftKey, e.altKey, e.metaKey ) ) {
            return undefined;
        }

        var code = KeyManager.getLocalKeyCode( e.keyIdentifier, e.ctrlKey,
                                       e.shiftKey, e.altKey, e.metaKey );

        if( model.prePostKeyEvent( code, e.ctrlKey, e.altKey, e.metaKey ) ) {
            return { code : code,
                     ctrl : e.ctrlKey,
                     alt  : e.altKey,
                     meta : e.metaKey };
        }
    }

    function onFocus (e) {
        logger.d("onFocus", e.target.id );
        model.onFocus( e.target );
    }

    function onSettingUpdated (msg) {
        model.onSettingUpdated( msg );
    }

    function setupPorts() {
        settingPort = chrome.extension.connect({ name : "settings" });
        settingPort.onMessage.addListener( onSettingUpdated );
        settingPort.postMessage({ type : "get", name : "all" });
    }

    function addWindowListeners() {
        window.addEventListener("keydown"    , onKeyDown    , true);
        window.addEventListener("keypress"   , onKeyPress   , true);
        window.addEventListener("focus"      , onFocus      , true);
        window.addEventListener("blur"       , onBlur       , true);
        window.addEventListener("keyup"      , onKeyUp      , true);
    }

    function addRequestListener() {
        chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
            sendResponse();
        });
    }

    function init() {
        setupPorts();
        addRequestListener();
        addWindowListeners();
    }

    // public APIs
    this.onEnabled = function() {
        init();
        view.init();
        model.init();
    };
};


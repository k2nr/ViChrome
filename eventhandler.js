vichrome.event = {};

vichrome.event.EventHandler =  function(m, v) {
    // dependencies
    var keyCodes         = vichrome.key.keyCodes,
        KeyManager       = vichrome.key.KeyManager,
    // private variables
        model = m,
        view = v,
        settingPort = null;

    function onBlur (e) {
        vichrome.log.logger.d("onBlur");
        model.blur();
        model.enterNormalMode();
    }

    function onKeyDown (e) {
        var msg;
        vichrome.log.logger.d("onKeyDown", e);

        msg = getHandlableKey( e );
        if( msg ) {
            model.handleKey(msg);
        }
    }

    function onKeyPress (e) {
        var msg;
        vichrome.log.logger.d( "onKeyPress", e );

        msg = getHandlableKey( e );
        if( msg ) {
            model.handleKey(msg);
        }
    }

    function onKeyUp (e) {
        vichrome.log.logger.d( "onKeyUp", e );
        if(!model.isInSearchMode()) {
            return;
        }

        model.updateSearchInput();
    }


    // decide whether to post the key event and do some pre-post process
    // return true if the key event can be posted.
    function getHandlableKey (e) {
        var key;

        // vichrome doesn't handle meta and alt key for now
        if( e.metaKey || e.altKey ) {
            return undefined;
        }

        if( e.type === "keydown" ) {
            key = e.keyCode;
            if( KeyManager.isESC( e.keyCode, e.ctrlKey ) ) {
                key = keyCodes.ESC;
            }

            // TODO: should detect exact keycode
            if( model.isInNormalMode() &&
                e.keyCode >= 48 && !e.ctrlKey && !e.altKey && !e.metaKey ) {
                event.stopPropagation();
            }

            // keydown only catch key codes that are not passed to keypress
            if( KeyManager.getLocalKeyCode(key) === keyCodes.ASCII ) {
                if( !e.ctrlKey ) { return undefined; }
            } else {
                key = KeyManager.getLocalKeyCode(key);
            }
        } else if( e.type === "keypress" ) {
            key = e.charCode;
        }

        if( model.prePostKeyEvent( key, e.ctrlKey, e.altKey, e.metaKey ) ) {
            return { code : key,
                     ctrl : e.ctrlKey,
                     alt  : e.altKey,
                     meta : e.metaKey };
        }
    }

    function onFocus (e) {
        vichrome.log.logger.d("onFocus", e.target.id );
        if(model.isInCommandMode() || model.isInSearchMode()) {
            return;
        }
        if( model.isEditable(e.target) ) {
            model.enterInsertMode();
        } else {
            model.enterNormalMode();
        }
    }

    function onSettingUpdated (msg) {
        if(msg.name === "all") {
            model.settings = msg.value;
        } else {
            model.settings[msg.name] = msg.value;
        }
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


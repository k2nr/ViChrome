vichrome.event = {};

vichrome.event.EventHandler =  function() {
    // dependencies
    var keyCodes         = vichrome.key.keyCodes,
        KeyManager       = vichrome.key.KeyManager,
    // private variables
        settingPort = null;

    function onBlur (e) {
        vichrome.log.logger.d("onBlur");
        vichrome.model.blur();
        vichrome.model.enterNormalMode();
    }

    function onKeyDown (e) {
        vichrome.log.logger.d("onKeyDown", e);

        if( prePostKeyEvent(e) ) {
            vichrome.model.handleKey(e);
        }
    }

    function onKeyPress (e) {
        vichrome.log.logger.d( "onKeyPress", e );
        if( prePostKeyEvent(e) ) {
            vichrome.model.handleKey(e);
        }
    }

    function onKeyUp (e) {
        vichrome.log.logger.d( "onKeyUp", e );
        if(!vichrome.model.isInSearchMode()) {
            return;
        }

        vichrome.model.updateSearchInput();
    }


    // decide whether to post the key event and do some pre-post process
    // return true if the key event can be posted.
    function prePostKeyEvent (e) {
        var key;

        // vichrome doesn't handle meta and alt key for now
        if( e.metaKey || e.altKey ) {
            return false;
        }

        if( e.type === "keydown" ) {
            key = e.keyCode;
            if( KeyManager.isESC( e.keyCode, e.ctrlKey ) ) {
                key = keyCodes.ESC;
            }

            // TODO: should detect exact keycode
            if( vichrome.model.isInNormalMode() &&
                e.keyCode >= 48 && !e.ctrlKey && !e.altKey && !e.metaKey ) {
                event.stopPropagation();
            }

            // keydown only catch key codes that are not passed to keypress
            if( KeyManager.getLocalKeyCode(key) === keyCodes.ASCII ) {
                if( e.ctrlKey ) { return false; }
            } else {
                key = KeyManager.getLocalKeyCode(key);
            }
        } else if( e.type === "keypress" ) {
            key = e.charCode;
        }

        return vichrome.model.prePostKeyEvent( key, e.ctrlKey, e.altKey, e.metaKey );
    }

    function onFocus (e) {
        vichrome.log.logger.d("onFocus", e.target.id );
        if(vichrome.model.isInCommandMode() || vichrome.model.isInSearchMode()) {
            return;
        }
        if( vichrome.model.isEditable(e.target) ) {
            vichrome.model.enterInsertMode();
        } else {
            vichrome.model.enterNormalMode();
        }
    }

    function onSettingUpdated (msg) {
        if(msg.name === "all") {
            vichrome.model.settings = msg.value;
        } else {
            vichrome.model.settings[msg.name] = msg.value;
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
        vichrome.view.init();
        vichrome.model.init();
    };
};


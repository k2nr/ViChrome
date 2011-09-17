function EventHandler() {
    var settingPort = null;

    function onBlur (e) {
        Logger.d("onBlur");
        vichrome.blur();
        vichrome.enterNormalMode();
    }

    function onKeyDown (e) {
        Logger.d("onKeyDown", e);

        if( prePostKeyEvent(e) ) {
            vichrome.commandManager.handleKey(e);
        }
    }

    function onKeyPress (e) {
        Logger.d( "onKeyPress", e );
        if( prePostKeyEvent(e) ) {
            vichrome.commandManager.handleKey(e);
        }
    }

    function onKeyUp (e) {
        Logger.d( "onKeyUp", e );
        if(!vichrome.isInSearchMode()) {
            return;
        }

        vichrome.updateSearchInput();
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
            if( vichrome.isInNormalMode() &&
                e.keyCode >= 48 && !e.ctrlKey && !e.altKey && !e.metaKey ) {
                event.stopPropagation();
            }

            // keydown only catch key codes that are not passed to keypress
            switch( key ) {
                case keyCodes.Tab   :
                case keyCodes.BS    :
                case keyCodes.DEL   :
                case keyCodes.ESC   :
                    break;
                case 37 :
                    key = keyCodes.Left;
                    break;
                case 38 :
                    key = keyCodes.Up;
                    break;
                case 39 :
                    key = keyCodes.Right;
                    break;
                case 40 :
                    key = keyCodes.Down;
                    break;
                case 112  :
                    key = keyCodes.F1;
                    break;
                case 113  :
                    key = keyCodes.F2;
                    break;
                case 114  :
                    key = keyCodes.F3;
                    break;
                case 115  :
                    key = keyCodes.F4;
                    break;
                case 116  :
                    key = keyCodes.F5;
                    break;
                case 117  :
                    key = keyCodes.F6;
                    break;
                case 118  :
                    key = keyCodes.F7;
                    break;
                case 119  :
                    key = keyCodes.F8;
                    break;
                case 120  :
                    key = keyCodes.F9;
                    break;
                case 121  :
                    key = keyCodes.F10;
                    break;
                case 122  :
                    key = keyCodes.F11;
                    break;
                case 123  :
                    key = keyCodes.F12;
                    break;
                default:
                    if( !e.ctrlKey ) {
                        return false;
                    }
                    break;
            }
        } else if( e.type === "keypress" ) {
            key = e.charCode;
        }

        return vichrome.prePostKeyEvent( key, e.ctrlKey, e.altKey, e.metaKey );
    }

    function onFocus (e) {
        Logger.d("onFocus", e.target.id );
        if(vichrome.isInCommandMode() || vichrome.isInSearchMode()) {
            return;
        }
        if( vichrome.isEditable(e.target) ) {
            vichrome.enterInsertMode();
        } else {
            vichrome.enterNormalMode();
        }
    }

    function onSettingUpdated (msg) {
        if(msg.name === "all") {
            vichrome.settings = msg.value;
        } else {
            vichrome.settings[msg.name] = msg.value;
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

    this.init = function() {
        setupPorts();
        addRequestListener();
        addWindowListeners();
    };

    this.onEnabled = function() {
        view.init();
        this.init();
        vichrome.init();
    };
}


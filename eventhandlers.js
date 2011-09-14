function EventHandler() {
    var keyPort = null,
        settingPort = null;

    function onBlur (e) {
        Logger.d("onBlur");
        vichrome.enterNormalMode();
    }

    function onKeyDown (e) {
        Logger.d("onKeyDown", e);

        if( prePostKeyEvent(e) ) {
            postKeyMessage(e);
        }
    }

    function onKeyPress (e) {
        Logger.d( "onKeyPress", e );
        if( prePostKeyEvent(e) ) {
            postKeyMessage(e);
        }
    }

    function onKeyUp (e) {
        Logger.d( "onKeyUp", e );
        if(!vichrome.isInSearchMode()) {
            return;
        }

        vichrome.updateSearchInput();
    }

    function postKeyMessage (e) {
        keyPort.postMessage({keyCode  : e.keyCode,
                             charCode : e.charCode,
                             meta     : e.metaKey,
                             alt      : e.altKey,
                             ctrl     : e.ctrlKey,
                             shift    : e.shiftKey});
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
            // some web sites set their own key bind(google instant search etc).
            // to prevent messing up vichrome's key bind from them,
            // we have to stop event propagation here.
            // TODO:we should only stop when a valid(handlable) key event come.
            event.stopPropagation();

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
        keyPort     = chrome.extension.connect({ name : "key" });

        settingPort = chrome.extension.connect({ name : "settings" });
        settingPort.onMessage.addListener( onSettingUpdated );
        settingPort.postMessage({ type : "get",
            name : "all" });
    }

    function addWindowListeners() {
        window.addEventListener("keydown"    , onKeyDown    , true);
        window.addEventListener("keypress"   , onKeyPress   , true);
        window.addEventListener("focus"      , onFocus      , true);
        window.addEventListener("blur"       , onBlur       , true);
        window.addEventListener("keyup"      , onKeyUp      , true);
    }

    function addRequestListener() {
    /*
        var reqListeners = {
            scrollUp             : reqScrollUp,
            scrollDown           : reqScrollDown,
            scrollLeft           : reqScrollLeft,
            scrollRight          : reqScrollRight,
            pageHalfUp           : reqPageHalfUp,
            pageHalfDown         : reqPageHalfDown,
            pageUp               : reqPageUp,
            pageDown             : reqPageDown,
            goTop                : reqGoTop,
            goBottom             : reqGoBottom,
            reloadTab            : reqReloadTab,
            backHist             : reqBackHist,
            forwardHist          : reqForwardHist,
            goCommandMode        : reqGoCommandMode,
            goSearchModeForward  : reqGoSearchModeForward,
            goSearchModeBackward : reqGoSearchModeBackward,
            goFMode              : reqGoFMode,
            nextSearch           : reqNextSearch,
            prevSearch           : reqPrevSearch,
            focusOnFirstInput    : reqFocusOnFirstInput,
            blur                 : reqBlur
        };
    */

        chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
            Logger.d("request received:", req);
            if(vichrome.mode["req"+req.command]) {
                vichrome.mode["req"+req.command]();
            } else {
                Logger.e("INVALID REQUEST received!:", req);
            }

            sendResponse();
        });
    }

    this.init = function() {
        setupPorts();
        addRequestListener();
        addWindowListeners();
    };

    this.onEnabled = function() {
        View.init();
        this.init();
        vichrome.init();
    };
}

eventHandler = new EventHandler();

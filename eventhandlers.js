function EventHandler() {
    var keyPort = null;
    var settingPort = null;

    var reqListeners = {
         scrollUp             : reqScrollUp
        ,scrollDown           : reqScrollDown
        ,scrollLeft           : reqScrollLeft
        ,scrollRight          : reqScrollRight
        ,pageHalfUp           : reqPageHalfUp
        ,pageHalfDown         : reqPageHalfDown
        ,pageUp               : reqPageUp
        ,pageDown             : reqPageDown
        ,goTop                : reqGoTop
        ,goBottom             : reqGoBottom
        ,reloadTab            : reqReloadTab
        ,backHist             : reqBackHist
        ,forwardHist          : reqForwardHist
        ,goCommandMode        : reqGoCommandMode
        ,goSearchModeForward  : reqGoSearchModeForward
        ,goSearchModeBackward : reqGoSearchModeBackward
        ,goFMode              : reqGoFMode
        ,nextSearch           : reqNextSearch
        ,prevSearch           : reqPrevSearch
        ,focusOnFirstInput    : reqFocusOnFirstInput
        ,blur                 : reqBlur
    };

    function reqScrollDown () {
        window.scrollBy( 0, vichrome.getSetting("scrollPixelCount") );
    };

    function reqScrollUp () {
        window.scrollBy( 0, -vichrome.getSetting("scrollPixelCount") );
    };

    function reqScrollLeft () {
        window.scrollBy( -vichrome.getSetting("scrollPixelCount"), 0 );
    };

    function reqScrollRight () {
        window.scrollBy( vichrome.getSetting("scrollPixelCount"), 0 );
    };

    function reqPageHalfDown () {
        window.scrollBy( 0, window.innerHeight / 2 );
    };

    function reqPageHalfUp () {
        window.scrollBy( 0, -window.innerHeight / 2 );
    };

    function reqPageDown () {
        window.scrollBy( 0, window.innerHeight );
    };

    function reqPageUp () {
        window.scrollBy( 0, -window.innerHeight );
    };

    function reqGoTop () {
        window.scrollTo( window.pageXOffset, 0 );
    };

    function reqGoBottom () {
        window.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight );
    };

    function reqBackHist () {
        window.history.back();
    };

    function reqForwardHist () {
        window.history.forward();
    };

    function reqBlur () {
        document.activeElement.blur();
        View.setStatusLineText("");
        View.removeHighlight();
        vichrome.enterNormalMode();
    };

    function reqGoCommandMode () {
        if( vichrome.isInCommandMode() ) {
            return;
        }

        vichrome.enterCommandMode();
        View.showCommandBox(":");
        View.focusCommandBox();
    };

    function reqGoSearchModeForward () {
        vichrome.enterSearchMode( false );
    };

    function reqGoSearchModeBackward () {
        vichrome.enterSearchMode( true );
    };

    function reqGoFMode () {
        // TODO
    };

    function reqReloadTab() {
        window.location.reload();
    };

    function reqNextSearch() {
        var found = vichrome.goNextSearchResult( false );
    };

    function reqPrevSearch() {
        var found = vichrome.goNextSearchResult( true );
    };

    function reqFocusOnFirstInput() {
        View.focusInput( 0 );
    };

    function onBlur (e) {
        Logger.d("onBlur");
        vichrome.enterNormalMode();
    };

    function onKeyDown (e) {
        Logger.d("onKeyDown", e);

        if( prePostKeyEvent(e) ) {
            postKeyMessage(e);
        }
    };

    function onKeyPress (e) {
        Logger.d( "onKeyPress", e );
        if( prePostKeyEvent(e) ) {
            postKeyMessage(e);
        }
    };

    function onKeyUp (e) {
        Logger.d( "onKeyUp", e );
        if(!vichrome.isInSearchMode()) {
            return;
        }

        vichrome.updateSearchInput();
    };

    function postKeyMessage (e) {
        keyPort.postMessage({keyCode  : e.keyCode,
                             charCode : e.charCode,
                             meta     : e.metaKey,
                             alt      : e.altKey,
                             ctrl     : e.ctrlKey,
                             shift    : e.shiftKey});
    };

    function isOnlyModifier (e) {
        switch(e.keyCode) {
            case keyCodes.Shift:
            case keyCodes.Ctrl:
            case keyCodes.Meta:
            case keyCodes.Alt:
                return true;
            default:
                return false;
        }
    };

    // decide whether to post the key event and do some pre-post process
    // return true if the key event can be posted.
    function prePostKeyEvent (e) {
        // vichrome doesn't handle meta and alt key for now
        if( e.metaKey || e.altKey ) {
            return false;
        }
        if( isOnlyModifier(e) ) {
            return false;
        }
        if( KeyManager.isESC( e.keyCode, e.ctrlKey ) ) {
            e.keyCode = keyCodes.ESC;
        }

        if( vichrome.isInSearchMode() || vichrome.isInCommandMode() ) {
            // TODO:
            if( View.getCommandBoxValue().length == 1 &&
            e.keyCode == keyCodes.BS) {
                View.setStatusLineText("");
                vichrome.enterNormalMode();
            }

            switch(e.keyCode) {
                case keyCodes.Tab   :
                case keyCodes.BS    :
                case keyCodes.DEL   :
                case keyCodes.Left  :
                case keyCodes.Up    :
                case keyCodes.Right :
                case keyCodes.Down  :
                case keyCodes.ESC   :
                case keyCodes.CR    :
                    event.stopPropagation();
                    break;
                default:
                    break;
            }
        }

        // TODO:commandmode
        if( vichrome.isInSearchMode() ) {
            if(e.type == "keydown") {
                if( KeyManager.isESC(e.keyCode, e.ctrlKey) ) {
                    View.removeHighlight();
                    return true;
                } else if(keyCodes.F1 <= e.keyCode && e.keyCode <= keyCodes.F12){
                    return true;
                } else if( e.ctrlKey ) {
                    return true;
                }
            } else if(e.type == "keypress" && e.keyCode == keyCodes.CR) {
                vichrome.enterNormalMode();
                return false;
            } else {
                return false;
            }
        } else if( vichrome.isInInsertMode() || vichrome.isInCommandMode() ){
            if( e.type == "keydown" ) {
                if( KeyManager.isESC(e.keyCode, e.ctrlKey) ) {
                    return true;
                } else if(keyCodes.F1 <= e.keyCode && e.keyCode <= keyCodes.F12){
                    return true;
                } else if( e.ctrlKey ) {
                    return true;
                }
            } else {
                // character key do not need to be handled in insert mode
                return false;
            }
        } else {
            if(e.type == "keypress") {
                event.preventDefault();
                event.stopPropagation();
                return true;
            } else if(e.type == "keydown") {
                // some web sites set their own key bind(google instant search etc).
                // to prevent messing up vichrome's key bind from them,
                // we have to stop event propagation here.
                // TODO:we should only stop when a valid(handlable) key event come.
                event.stopPropagation();
                if( e.ctrlKey ) {
                    // TODO:some keys cannot be recognized with keyCode e.g. C-@
                    return true;
                }
                // keydown only catch key codes that are not passed to keypress
                switch(e.keyCode) {
                    case keyCodes.Tab   :
                    case keyCodes.BS    :
                    case keyCodes.DEL   :
                    case keyCodes.Left  :
                    case keyCodes.Up    :
                    case keyCodes.Right :
                    case keyCodes.Down  :
                    case keyCodes.F1    :
                    case keyCodes.F2    :
                    case keyCodes.F3    :
                    case keyCodes.F4    :
                    case keyCodes.F5    :
                    case keyCodes.F6    :
                    case keyCodes.F7    :
                    case keyCodes.F8    :
                    case keyCodes.F9    :
                    case keyCodes.F10   :
                    case keyCodes.F11   :
                    case keyCodes.F12   :
                    case keyCodes.ESC   :
                        return true;
                    default:
                        return false;
                }
            }
        }
    };

    function onFocus (e) {
        Logger.d("onFocus", e.target.id );
        if(vichrome.isInCommandMode() || vichrome.isInSearchMode())
            return;
        if( vichrome.isEditable(e.target) ) {
            vichrome.enterInsertMode();
        } else {
            vichrome.enterNormalMode();
        }
    };

    function onSettingUpdated (msg) {
        if(msg.name == "all") {
            vichrome.settings = msg.value;
        } else {
            vichrome.settings[msg.name] = msg.value;
        }
    };

    function setupPorts() {
        keyPort     = chrome.extension.connect({ name : "key" });

        settingPort = chrome.extension.connect({ name : "settings" });
        settingPort.onMessage.addListener( onSettingUpdated );
        settingPort.postMessage({ type : "get",
            name : "all" });
    };

    function addWindowListeners() {
        window.addEventListener("keydown"    , onKeyDown    , true);
        window.addEventListener("keypress"   , onKeyPress   , true);
        window.addEventListener("focus"      , onFocus      , true);
        window.addEventListener("blur"       , onBlur       , true);
        window.addEventListener("keyup"      , onKeyUp      , true);
    };

    function addRequestListener() {
        chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
            Logger.d("request received:", req)
            if(reqListeners[req.command]) {
                reqListeners[req.command]();
            } else {
                Logger.e("INVALID REQUEST received!:", req)
            }

            sendResponse();
        });
    };

    this.init = function() {
        setupPorts();
        addRequestListener();
        addWindowListeners();
    };

    this.onEnabled = function() {
        this.init();
        vichrome.init();
        View.init();
    };
}

eventHandler = new EventHandler();

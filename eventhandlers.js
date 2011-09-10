var keyPort;
var settingPort;

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
    ,blur                 : reqBlur
}

function reqScrollDown () {
    window.scrollBy( 0, Vichrome.settings["scrollPixelCount"] );
}

function reqScrollUp () {
    window.scrollBy( 0, -Vichrome.settings["scrollPixelCount"] );
}

function reqScrollLeft () {
    window.scrollBy( -Vichrome.settings["scrollPixelCount"], 0 );
}

function reqScrollRight () {
    window.scrollBy( Vichrome.settings["scrollPixelCount"], 0 );
}

function reqPageHalfDown () {
    window.scrollBy( 0, window.innerHeight / 2 );
}

function reqPageHalfUp () {
    window.scrollBy( 0, -window.innerHeight / 2 );
}

function reqPageDown () {
    window.scrollBy( 0, window.innerHeight );
}

function reqPageUp () {
    window.scrollBy( 0, -window.innerHeight );
}

function reqGoTop () {
    window.scrollTo( window.pageXOffset, 0 );
}

function reqGoBottom () {
    window.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight );
}

function reqBackHist () {
    window.history.back();
}

function reqForwardHist () {
    window.history.forward();
}

function reqBlur () {
    document.activeElement.blur();
    Vichrome.enterNormalMode();
}

function reqGoCommandMode () {
    if( !Vichrome.isInCommandMode() ) {
        Vichrome.enterCommandMode();
        View.showCommandBox(":");
        View.focusCommandBox();
    }
}

function reqGoSearchModeForward () {
    if( !Vichrome.isInSearchMode() ) {
        Vichrome.currentSearchCnt = 0;
        Vichrome.enterSearchMode();
        View.showCommandBox("/");
        View.focusCommandBox();
    }
}

function reqGoSearchModeBackward () {
    if( !Vichrome.isInSearchMode() ) {
        Vichrome.currentSearchCnt = 0;
        Vichrome.enterSearchMode();
        View.showCommandBox("?");
        View.focusCommandBox();
    }
}

function reqGoFMode () {
    // TODO
}

function reqReloadTab() {
    window.location.reload();
}

function reqNextSearch() {
    var found = Vichrome.goNextSearchResult( {wrap : true, backward : false} );
}

function reqPrevSearch() {
    var found = Vichrome.goNextSearchResult( {wrap : true, backward : true} );
}

function onBlur (e) {
    Logger.d("onBlur");
    Vichrome.modeInsert = false;
}


function onKeyDown (e) {
    Logger.d("onKeyDown", e);

    if( preHandleKeyEvent(e) ) {
        postKeyMessage(e);
    }
}

function onKeyPress (e) {
    Logger.d( "onKeyPress", e );
    if( preHandleKeyEvent(e) ) {
        postKeyMessage(e);
    }
}

function onKeyUp (e) {
    Logger.d( "onKeyUp", e );
    if(!Vichrome.isInSearchMode()) {
        return;
    }

    var str = View.getCommandBoxValue();
    // the first character is always "/" so the char to search starts from 1
    var search = str.slice( 1, str.length );
    if(search.length > 0) {
        View.searchAndHighlight( search );
        if( View.getSearchResultCnt() == 0 )
            return;

        View.moveToSearchResult( currentSearchCnt );
    } else {
        View.removeHighlight();
    }
}

function postKeyMessage (e) {
    keyPort.postMessage({keyCode  : e.keyCode,
                         charCode : e.charCode,
                         meta     : e.metaKey,
                         alt      : e.altKey,
                         ctrl     : e.ctrlKey,
                         shift    : e.shiftKey});
}

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
}

// decide whether to post the key event and do some pre-post process
// return true if the key event can be posted.
function preHandleKeyEvent (e) {
    // vichrome doesn't handle meta and alt key for now
    if( e.metaKey || e.altKey ) {
        return false;
    }
    if( isOnlyModifier(e) ) {
        return false;
    }

    if( Vichrome.isInSearchMode() || Vichrome.isInCommandMode() ) {
        // TODO:
        if( View.getCommandBoxValue().length == 1 &&
                e.keyCode == keyCodes.BS) {
                Vichrome.enterNormalMode();
                event.stopPropagation();
        }
    }

    // TODO:commandmode
    if( Vichrome.isInSearchMode() ) {
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
            Vichrome.enterNormalMode();
            return false;
        } else {
            return false;
        }
    } else if( Vichrome.isInInsertMode() || Vichrome.isInCommandMode() ){
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
            if( KeyManager.isESC( e.keyCode, e.ctrlKey ) ) {
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
                    return true;
                default:
                    return false;
            }
        }
    }
}

function onFocus (e) {
    Logger.d("onFocus", e.target.id );
    if(Vichrome.isInCommandMode() || Vichrome.isInSearchMode())
        return;
    if( Vichrome.isEditable(e.target) ) {
        Vichrome.enterInsertMode();
    } else {
        Vichrome.enterNormalMode();
    }
}

function onEnabled() {
    Vichrome.init();
}

function onSettingUpdated (msg) {
    if(msg.name == "all") {
        Vichrome.settings = msg.value;
    } else {
        Vichrome.settings[msg.name] = msg.value;
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
    chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
        Logger.d("request received:", req)
        if(reqListeners[req.command]) {
            reqListeners[req.command]();
        } else {
            Logger.e("INVALID REQUEST received!:", req)
        }

        sendResponse();
    });
}


function Mode() {
}

Mode.prototype.reqScrollDown = function() {
    view.scrollBy( 0, vichrome.getSetting("scrollPixelCount") );
};

Mode.prototype.reqScrollUp = function() {
    view.scrollBy( 0, -vichrome.getSetting("scrollPixelCount") );
};

Mode.prototype.reqScrollLeft = function() {
    view.scrollBy( -vichrome.getSetting("scrollPixelCount"), 0 );
};

Mode.prototype.reqScrollRight = function() {
    view.scrollBy( vichrome.getSetting("scrollPixelCount"), 0 );
};

Mode.prototype.reqPageHalfDown = function() {
    view.scrollBy( 0, window.innerHeight / 2 );
};

Mode.prototype.reqPageHalfUp = function() {
    view.scrollBy( 0, -window.innerHeight / 2 );
};

Mode.prototype.reqPageDown = function() {
    view.scrollBy( 0, window.innerHeight );
};

Mode.prototype.reqPageUp = function() {
    view.scrollBy( 0, -window.innerHeight );
};

Mode.prototype.reqGoTop = function() {
    view.scrollTo( window.pageXOffset, 0 );
};

Mode.prototype.reqGoBottom = function() {
    view.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight );
};

Mode.prototype.reqBackHist = function() {
    view.backHist();
};

Mode.prototype.reqForwardHist = function() {
    view.forwardHist();
};

Mode.prototype.reqReloadTab = function() {
    view.reload();
};

Mode.prototype.reqGoSearchModeForward = function() {
    vichrome.enterSearchMode( false );
};

Mode.prototype.reqGoSearchModeBackward = function() {
    vichrome.enterSearchMode( true );
};

Mode.prototype.reqBlur = function() {
    view.blurActiveElement();

    if( this.blur ) {
        this.blur();
    }
};

Mode.prototype.reqGoFMode = function() {
    // TODO
};

Mode.prototype.reqGoCommandMode = function() {
    vichrome.changeMode( new CommandMode() );
    view.showCommandBox(":");
    view.focusCommandBox();
};

function NormalMode() {
}
NormalMode.prototype = new Mode();

NormalMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    // TODO:some keys cannot be recognized with keyCode e.g. C-@
    return true;
};

NormalMode.prototype.blur = function() {
    vichrome.cancelSearchHighlight();
};

NormalMode.prototype.enter = function() {
    view.hideCommandBox();
};

NormalMode.prototype.reqFocusOnFirstInput = function() {
    view.focusInput( 0 );
};

NormalMode.prototype.reqNextSearch = function() {
    var found = vichrome.goNextSearchResult( false );
};

NormalMode.prototype.reqPrevSearch = function() {
    var found = vichrome.goNextSearchResult( true );
};

function InsertMode() {
}

InsertMode.prototype = new Mode();

InsertMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    if( key === keyCodes.ESC ) {
        return true;
    } else if(keyCodes.F1 <= key && key <= keyCodes.F12){
        return true;
    } else if( ctrl ) {
        return true;
    } else {
        // character key do not need to be handled in insert mode
        return false;
    }
};

InsertMode.prototype.blur = function() {
};

InsertMode.prototype.enter = function() {
};


function SearchMode() {
}
SearchMode.prototype = new Mode();
SearchMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    if( view.getCommandBoxValue().length === 0 &&
        key === keyCodes.BS) {
        setTimeout( function() {
            vichrome.cancelSearch();
        }, 0);
    }

    switch(key) {
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

    if( key === keyCodes.ESC ) {
        setTimeout( function() {
            vichrome.cancelSearch();
        }, 0);
        return true;
    } else if(keyCodes.F1 <= key && key <= keyCodes.F12){
        return true;
    } else if( ctrl ) {
        return true;
    } else if( key === keyCodes.CR ) {
        setTimeout( function(){
            vichrome.enterNormalMode();
        }, 0);
        return false;
    } else {
        return false;
    }
};

SearchMode.prototype.blur = function() {
    vichrome.cancelSearch();
};

SearchMode.prototype.enter = function() {
    view.focusCommandBox();
};

SearchMode.prototype.reqNextSearch = function() {
    var found = vichrome.goNextSearchResult( false );
};

SearchMode.prototype.reqPrevSearch = function() {
    var found = vichrome.goNextSearchResult( true );
};

function CommandMode() {
}
CommandMode.prototype = new Mode();
CommandMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    // TODO:
    return true;
};

CommandMode.prototype.blur = function() {
};

CommandMode.prototype.enter = function() {
};

function FMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {

    };

    this.blur = function() {

    };

    this.enter = function() {

    };
}
FMode.prototype = new Mode();
FMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    // TODO:
    return true;
};

FMode.prototype.blur = function() {
};

FMode.prototype.enter = function() {
};


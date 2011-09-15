function Mode() {
}

Mode.prototype.exit = function() {
};

Mode.prototype.enter = function() {
};

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
    vichrome.setPageMark();
    view.scrollTo( window.pageXOffset, 0 );
};

Mode.prototype.reqGoBottom = function() {
    vichrome.setPageMark();
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

Mode.prototype.reqBackToPageMark = function() {
    // TODO:enable to go any pagemark, not only unnamed.
    vichrome.goPageMark();
}

Mode.prototype.reqBlur = function() {
    view.blurActiveElement();

    if( this.blur ) {
        this.blur();
    }
};

Mode.prototype.reqGoFMode = function() {
    vichrome.changeMode( new FMode(false) );
};

Mode.prototype.reqGoFModeWithNewTab = function() {
    vichrome.changeMode( new FMode(true) );
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
    vichrome.setPageMark();
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

function FMode( newWindow ) {
    this.currentInput = "";
    this.hints        = [];
    this.keys         = "";
    this.keyLength    = 2;
    this.newWindow    = newWindow;
}
FMode.prototype = new Mode();

FMode.prototype.hit = function(i) {
    this.hints[i].target.focus();
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    this.hints[i].target.get(0).dispatchEvent(e);
    event.preventDefault();
};

FMode.prototype.isValidKey = function(key) {
    var str = String.fromCharCode( key );
    if( str.length === 0 ) {
        return false;
    }
    if( this.keys.indexOf( str ) < 0 ) {
        return false;
    } else {
        return true;
    }
};

FMode.prototype.searchTarget = function() {
    var total = this.hints.length, i;
    for( i=0; i < total; i++ ) {
        if( this.currentInput === this.hints[i].key ) {
            return i;
        }
    }

    return -1;
};

FMode.prototype.highlightCandidate = function() {
};

FMode.prototype.putValidChar = function(key) {
    var str = String.fromCharCode( key ), idx;

    this.currentInput += str;
    view.setStatusLineText( 'HIT-A-HINT : ' + this.currentInput );

    if( this.currentInput.length < this.keyLength ) {
        this.highlightCandidate();
        return;
    } else {
        idx = this.searchTarget();
        if( idx >= 0 ) {
            this.hit( idx );
        }
        $('span#vichromehint').remove();
        vichrome.enterNormalMode();
    }
};

FMode.prototype.prePostKeyEvent = function(key, ctrl, alt, meta) {
    if( key === keyCodes.ESC ) {
        return true;
    }
    if(keyCodes.F1 <= key && key <= keyCodes.F12){
        return true;
    }
    if( ctrl ) {
        return true;
    }

    if( this.isValidKey( key ) ) {
        this.putValidChar( key );
    }
    return false;
};

FMode.prototype.blur = function() {
    vichrome.enterNormalMode();
};

FMode.prototype.getKeyLength = function(candiNum) {
    return Math.floor( Math.log( candiNum ) / Math.log( this.keys.length ) ) + 1;
};

$.extend($.expr[':'], {
    _visible: function(elem){
        if($.expr[':'].hidden(elem)) return false;
        if($.curCSS(elem, 'visibility') == 'hidden') return false;
        return true;
    }
});

FMode.prototype.enter = function() {
    var that = this, div, links, total, x, y;
    this.keys = vichrome.getSetting("fModeAvailableKeys");
    links = $('a:_visible,*:input:_visible');
    this.keyLength = this.getKeyLength( links.length );
    links.each( function(i) {
        var key='', j, k;
        k = i;
        for( j=0; j < that.keyLength; j++ ) {
            key += that.keys.charAt( k % that.keys.length );
            k /= that.keys.length;
        }
        that.hints[i] = {};
        that.hints[i].offset = $(this).offset();
        that.hints[i].key    = key;
        that.hints[i].target = $(this);

        $(this).addClass('fModeTarget');
    });

    total = this.hints.length;
    for( i=0; i < total; i++) {
        x = this.hints[i].offset.left - 10;
        y = this.hints[i].offset.top  - 10;
        if( x < 0 ) { x = 0; }
        if( y < 0 ) { y = 0; }
        div = $( '<span id="vichromehint" />' )
                .css( "top",  y )
                .css( "left", x )
                .html(this.hints[i].key);
        $(document.body).append(div);
    }

    view.setStatusLineText('HIT-A-HINT : ');
};

FMode.prototype.exit = function() {
    $('span#vichromehint').remove();
    $('.fModeTarget').removeClass('fModeTarget');
    view.setStatusLineText('');
};


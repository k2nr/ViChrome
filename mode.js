
vichrome.mode = {};

vichrome.mode.Mode = function() { };

// Mode Class prototype definition
(function(o) {
    o.exit = function() {
    };

    o.enter = function() {
    };

    o.reqOpen = function(args) {
        if( args && args[0] ) {
            window.open(args[0], "_self");
        }
    };

    o.blur = function() {
    };

    o.reqScrollDown = function() {
        vichrome.view.scrollBy( 0, vichrome.model.getSetting("scrollPixelCount") );
    };

    o.reqScrollUp = function() {
        vichrome.view.scrollBy( 0, -vichrome.model.getSetting("scrollPixelCount") );
    };

    o.reqScrollLeft = function() {
        vichrome.view.scrollBy( -vichrome.model.getSetting("scrollPixelCount"), 0 );
    };

    o.reqScrollRight = function() {
        vichrome.view.scrollBy( vichrome.model.getSetting("scrollPixelCount"), 0 );
    };

    o.reqPageHalfDown = function() {
        vichrome.view.scrollBy( 0, window.innerHeight / 2 );
    };

    o.reqPageHalfUp = function() {
        vichrome.view.scrollBy( 0, -window.innerHeight / 2 );
    };

    o.reqPageDown = function() {
        vichrome.view.scrollBy( 0, window.innerHeight );
    };

    o.reqPageUp = function() {
        vichrome.view.scrollBy( 0, -window.innerHeight );
    };

    o.reqGoTop = function() {
        vichrome.model.setPageMark();
        vichrome.view.scrollTo( window.pageXOffset, 0 );
    };

    o.reqGoBottom = function() {
        vichrome.model.setPageMark();
        vichrome.view.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight );
    };

    o.reqBackHist = function() {
        vichrome.view.backHist();
    };

    o.reqForwardHist = function() {
        vichrome.view.forwardHist();
    };

    o.reqReloadTab = function() {
        vichrome.view.reload();
    };

    o.reqGoSearchModeForward = function() {
        vichrome.model.enterSearchMode( false );
    };

    o.reqGoSearchModeBackward = function() {
        vichrome.model.enterSearchMode( true );
    };

    o.reqBackToPageMark = function() {
        // TODO:enable to go any pagemark, not only unnamed.
        vichrome.model.goPageMark();
    }

    o.reqEscape = function() {
        vichrome.view.blurActiveElement();
        vichrome.model.escape();

        if( this.escape ) {
            this.escape();
        }
    };

    o.reqGoFMode = function(args) {
        var i, newTab, continuous, opt;
            len = args.length;

        for(i=0; i<len; i++) {
            switch(args[i]) {
                case "--newtab":
                    newTab = true;
                    break;
                case "--continuous":
                    continuous = true;
                    break;
            }
        }

        opt = { newTab     : newTab,
                continuous : continuous };

        vichrome.model.enterFMode( opt );
    };

    o.reqGoCommandMode = function() {
        vichrome.model.enterCommandMode();
        vichrome.view.showCommandBox(":", "");
        vichrome.view.focusCommandBox();
    };

    o.getKeyMapping = function() {
        return vichrome.model.getSetting("keyMappingNormal");
    };

}(vichrome.mode.Mode.prototype));


vichrome.mode.NormalMode = function() {
};

vichrome.mode.NormalMode.prototype = new vichrome.mode.Mode();
(function(o) {
    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        // TODO:some keys cannot be recognized with keyCode e.g. C-@

        return true;
    };

    o.escape = function() {
        vichrome.model.cancelSearchHighlight();
    };

    o.enter = function() {
        vichrome.view.hideCommandBox();
    };

    o.reqFocusOnFirstInput = function() {
        vichrome.model.setPageMark();
        vichrome.view.focusInput( 0 );
    };

    o.reqNextSearch = function() {
        var found = vichrome.model.goNextSearchResult( false );
    };

    o.reqPrevSearch = function() {
        var found = vichrome.model.goNextSearchResult( true );
    };
}(vichrome.mode.NormalMode.prototype));


vichrome.mode.InsertMode = function() {
};

vichrome.mode.InsertMode.prototype = new vichrome.mode.Mode();
(function(o) {
    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( ctrl || alt || meta ) {
            return true;
        }
        if( vichrome.key.KeyManager.isNumber(key) ||
            vichrome.key.KeyManager.isAlphabet(key) ) {
           return false;
        }
        return true;
    };

    o.enter = function() {
    };

    o.getKeyMapping = function() {
        return vichrome.model.getSetting("keyMappingInsert");
    };
}(vichrome.mode.InsertMode.prototype));

vichrome.mode.SearchMode = function(opt_) {
    this.opt = opt_;
};

vichrome.mode.SearchMode.prototype = new vichrome.mode.Mode();
(function(o) {
    var NormalSearcher = vichrome.search.NormalSearcher,
        searcher;

    function cancelSearch() {
        vichrome.model.goPageMark();

        searcher.finalize();
        vichrome.model.enterNormalMode();
    }

    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( ctrl || alt || meta ) {
            return true;
        }

        var word = vichrome.view.getCommandBoxValue();
        if( word.length === 0 && (key === "BS" || key === "DEL") ) {
            cancelSearch();
            return false;
        }

        if( vichrome.key.KeyManager.isNumber(key) ||
            vichrome.key.KeyManager.isAlphabet(key) ) {
           return false;
        }

        if( key === "CR" ) {
            event.stopPropagation();

            if( !this.opt.incSearch ) {
                searcher.searchAndHighlight( word );
            }
            vichrome.model.setSearcher( searcher );
            vichrome.model.enterNormalMode();
            return false;
        }

        return true;
    };

    o.escape = function() {
        cancelSearch();
    };

    o.enter = function() {
        searcher = new NormalSearcher( this.opt );
        vichrome.view.focusCommandBox();
    };

    o.getKeyMapping = function() {
        // TODO: should return search mode specialized map ?
        return vichrome.model.getSetting("keyMappingInsert");
    };
}(vichrome.mode.SearchMode.prototype));

vichrome.mode.CommandMode = function() {
};
vichrome.mode.CommandMode.prototype = new vichrome.mode.Mode();
(function(o) {
    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        var executer;

        if( ctrl || alt || meta ) {
            return true;
        }

        if( vichrome.view.getCommandBoxValue().length === 0 &&
            (key === "BS" || key === "DEL") ) {
            vichrome.model.enterNormalMode();
            return false;
        }

        if( vichrome.key.KeyManager.isNumber(key) ||
            vichrome.key.KeyManager.isAlphabet(key) ) {
           return false;
        }

        if( key === "CR" ) {
            executer = new vichrome.command.CommandExecuter();
            try {
                executer.set( vichrome.view.getCommandBoxValue() )
                .parse()
                .execute();
            } catch(e) {
                vichrome.view.setStatusLineText( "Command Not Found : "+executer.get(),
                                                 2000 );

            }

            vichrome.model.enterNormalMode();
            return false;
        }

        return true;
    };

    o.enter = function() {
        vichrome.view.focusCommandBox();
    };

    o.getKeyMapping = function() {
        // TODO: should return command mode specialized map ?
        return vichrome.model.getSetting("keyMappingInsert");
    };
}(vichrome.mode.CommandMode.prototype));

vichrome.mode.FMode = function( opt ) {
    this.opt = opt;
};


vichrome.mode.FMode.prototype = new vichrome.mode.Mode();
(function(o) {
    var currentInput = "",
        hints        = [],
        keys         = "",
        keyLength    = 0;

    o.hit = function(i) {
        var primary = this.opt.newTab;

        if( hints[i].target.is('a') ) {
            vichrome.util.dispatchMouseClickEvent(hints[i].target.get(0),
                                    primary, false, false );
        } else {
            hints[i].target.focus();
        }
        event.preventDefault();
    };

    o.isValidKey = function(key) {
        if( key.length !== 1 ) {
            return false;
        }
        if( keys.indexOf( key ) < 0 ) {
            return false;
        } else {
            return true;
        }
    };

    o.searchTarget = function() {
        var total = hints.length, i;
        for( i=0; i < total; i++ ) {
            if( currentInput === hints[i].key ) {
                return i;
            }
        }

        return -1;
    };

    o.highlightCandidate = function() {
    };

    o.putValidChar = function(key) {
        var idx;

        currentInput += key;
        vichrome.view.setStatusLineText( 'f Mode : ' + currentInput );

        if( currentInput.length < keyLength ) {
            this.highlightCandidate();
            return;
        } else {
            idx = this.searchTarget();
            if( idx >= 0 ) {
                this.hit( idx );
            }
            if( this.opt.continuous ) {
                currentInput = "";
            } else {
                vichrome.model.enterNormalMode();
            }
        }
    };

    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( key === "ESC" ) {
            return true;
        }
        if( ctrl || alt || meta ) {
            return true;
        }

        if( this.isValidKey( key ) ) {
            event.stopPropagation();
            event.preventDefault();
            this.putValidChar( key );
        }
        return false;
    };

    o.getKeyLength = function(candiNum) {
        return Math.floor( Math.log( candiNum ) / Math.log( keys.length ) ) + 1;
    };

    o.enter = function() {
        var div, links, total, x, y;
        currentInput = "";
        hints        = [];
        keys         = "";

        keys = vichrome.model.getSetting("fModeAvailableKeys");
        links = $('a:_visible,*:input:_visible');
        keyLength = this.getKeyLength( links.length );
        links.each( function(i) {
            var key='', j, k;
            k = i;
            for( j=0; j < keyLength; j++ ) {
                key += keys.charAt( k % keys.length );
                k /= keys.length;
            }
            hints[i]        = {};
            hints[i].offset = $(this).offset();
            hints[i].key    = key;
            hints[i].target = $(this);

            $(this).addClass('fModeTarget');
        });

        total = hints.length;
        for( i=0; i < total; i++) {
            x = hints[i].offset.left - 10;
            y = hints[i].offset.top  - 10;
            if( x < 0 ) { x = 0; }
            if( y < 0 ) { y = 0; }
            div = $( '<span id="vichromehint" />' )
            .css( "top",  y )
            .css( "left", x )
            .html(hints[i].key);
            $(document.body).append(div);
        }

        vichrome.view.setStatusLineText('f Mode : ');
    };

    o.exit = function() {
        $('span#vichromehint').remove();
        $('.fModeTarget').removeClass('fModeTarget');
        vichrome.view.setStatusLineText('');
    };
}(vichrome.mode.FMode.prototype));

$.extend($.expr[':'], {
    _visible: function(elem){
        if($.expr[':'].hidden(elem)) return false;
        if($.curCSS(elem, 'visibility') == 'hidden') return false;
        return true;
    }
});


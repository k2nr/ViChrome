vichrome.mode = {};

vichrome.mode.Mode = {
    exit : function() {},

    enter : function() {},

    reqOpen : function(args) {
        if( args && args[0] ) {
            window.open(args[0], "_self");
        }
    },

    blur : function() {
    },

    reqScrollDown : function() {
        vichrome.view.scrollBy( 0, vichrome.model.getSetting("scrollPixelCount") );
    },

    reqScrollUp : function() {
        vichrome.view.scrollBy( 0, -vichrome.model.getSetting("scrollPixelCount") );
    },

    reqScrollLeft : function() {
        vichrome.view.scrollBy( -vichrome.model.getSetting("scrollPixelCount"), 0 );
    },

    reqScrollRight : function() {
        vichrome.view.scrollBy( vichrome.model.getSetting("scrollPixelCount"), 0 );
    },

    reqPageHalfDown : function() {
        vichrome.view.scrollBy( 0, window.innerHeight / 2 );
    },

    reqPageHalfUp : function() {
        vichrome.view.scrollBy( 0, -window.innerHeight / 2 );
    },

    reqPageDown : function() {
        vichrome.view.scrollBy( 0, window.innerHeight );
    },

    reqPageUp : function() {
        vichrome.view.scrollBy( 0, -window.innerHeight );
    },

    reqGoTop : function() {
        vichrome.model.setPageMark();
        vichrome.view.scrollTo( window.pageXOffset, 0 );
    },

    reqGoBottom : function() {
        vichrome.model.setPageMark();
        vichrome.view.scrollTo( window.pageXOffset, document.body.scrollHeight - window.innerHeight );
    },

    reqBackHist : function() {
        vichrome.view.backHist();
    },

    reqForwardHist : function() {
        vichrome.view.forwardHist();
    },

    reqReloadTab : function() {
        vichrome.view.reload();
    },

    reqGoSearchModeForward : function() {
        vichrome.model.enterSearchMode( false );
    },

    reqGoSearchModeBackward : function() {
        vichrome.model.enterSearchMode( true );
    },

    reqGoLinkTextSearchMode : function() {
        vichrome.model.enterSearchMode( false,
          vichrome.object( vichrome.search.LinkTextSearcher ) );
    },

    reqBackToPageMark : function() {
        // TODO:enable to go any pagemark, not only unnamed.
        vichrome.model.goPageMark();
    },

    reqEscape : function() {
        vichrome.view.blurActiveElement();
        vichrome.model.escape();

        if( this.escape ) {
            this.escape();
        }
    },

    reqGoFMode : function(args) {
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
    },

    reqGoCommandMode : function() {
        vichrome.model.enterCommandMode();
    },

    reqFocusOnFirstInput : function() {
        vichrome.model.setPageMark();
        vichrome.view.focusInput( 0 );
    },

    req_ChangeLogLevel : function(args) {
        if( args.length === 0 ) {
            return;
        }
        if( vichrome.log.level[args[0]] ) {
            vichrome.log.VICHROME_LOG_LEVEL = vichrome.log.level[args[0]];
        } else {
            vichrome.view.setStatusLineText( "log level '"+args[0]+"' doesn't exist", 2000 );
        }
    },

    getKeyMapping : function() {
        return vichrome.model.getNMap();
    }
};

vichrome.mode.NormalMode = vichrome.object( vichrome.mode.Mode );

(function(o) {
    o.getName = function() {
        return "NormalMode";
    };

    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        return true;
    };

    o.escape = function() {
        vichrome.model.cancelSearchHighlight();
    };

    o.enter = function() {
    };

    o.reqNextSearch = function() {
        var found = vichrome.model.goNextSearchResult( false );
    };

    o.reqPrevSearch = function() {
        var found = vichrome.model.goNextSearchResult( true );
    };
}(vichrome.mode.NormalMode));

vichrome.mode.InsertMode = vichrome.object( vichrome.mode.Mode );

(function(o) {
    o.getName = function() {
        return "InsertMode";
    };

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

    o.blur = function() {
        vichrome.model.enterNormalMode();
    };

    o.getKeyMapping = function() {
        return vichrome.model.getIMap();
    };
}(vichrome.mode.InsertMode));

vichrome.mode.SearchMode = vichrome.object( vichrome.mode.Mode );
(function(o) {
    o.getName = function() {
        return "SearchMode";
    };

    o.init = function( searcher_, backward_, opt_ ) {
        var opt   = opt_ ||
                    { wrap          : vichrome.model.getSetting("wrapSearch"),
                      ignoreCase    : vichrome.model.getSetting("ignoreCase"),
                      incSearch     : vichrome.model.getSetting("incSearch"),
                      minIncSearch  : vichrome.model.getSetting("minIncSearch"),
                      backward      : backward_ },
            align = vichrome.model.getSetting("commandBoxAlign"),
            width = vichrome.model.getSetting("commandBoxWidth");

        this.commandBox = vichrome.object( vichrome.widgets.CommandBox )
                          .init( vichrome.view, align, width );

        searcher_.init( opt, this.commandBox );
        this.searcher = searcher_;
        this.backward = backward_;

        return this;
    };

    o.cancelSearch = function() {
        vichrome.model.goPageMark();

        this.searcher.finalize();
        vichrome.model.enterNormalMode();
    };

    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( ctrl || alt || meta ) {
            return true;
        }

        var word = this.commandBox.value();
        if( word.length === 0 && (key === "BS" || key === "DEL") ) {
            this.cancelSearch();
            return false;
        }

        if( vichrome.key.KeyManager.isNumber(key) ||
            vichrome.key.KeyManager.isAlphabet(key) ) {
            return false;
        }

        if( key === "CR" ) {
            event.stopPropagation();

            this.searcher.fix(word);
            vichrome.model.setSearcher( this.searcher );
            vichrome.model.enterNormalMode();
            return false;
        }

        return true;
    };

    o.escape = function() {
        this.cancelSearch();
    };

    o.enter = function() {
        var modeChar = (this.backward === true)? "?":"/";
        this.commandBox.attachTo( vichrome.view ).show( modeChar ).focus();
    };

    o.exit = function() {
        this.commandBox.hide().detachFrom( vichrome.view );
    };

    o.getKeyMapping = function() {
        // TODO: should return search mode specialized map ?
        return vichrome.model.getIMap();
    };
}(vichrome.mode.SearchMode));

vichrome.mode.CommandMode = vichrome.object( vichrome.mode.Mode );
(function(o) {
    o.getName = function() {
        return "CommandMode";
    };

    o.prePostKeyEvent = function(key, ctrl, alt, meta) {
        var executer;

        if( ctrl || alt || meta ) {
            return true;
        }

        if( this.commandBox.value().length === 0 &&
            (key === "BS" || key === "DEL") ) {
            vichrome.model.enterNormalMode();
            return false;
        }

        if( vichrome.key.KeyManager.isNumber(key) ||
            vichrome.key.KeyManager.isAlphabet(key) ) {
            return false;
        }

        if( key === "CR" ) {
            executer = vichrome.object( vichrome.command.CommandExecuter );
            try {
                executer.set( this.commandBox.value() )
                .parse()
                .execute();
            } catch(e) {
                vichrome.view.setStatusLineText(
                         "Command Not Found : "+executer.get(), 2000 );
            }

            event.stopPropagation();
            event.preventDefault();
            vichrome.model.enterNormalMode();
            return false;
        }

        return true;
    };

    o.enter = function() {
        var align = vichrome.model.getSetting("commandBoxAlign"),
            width = vichrome.model.getSetting("commandBoxWidth");

        this.commandBox = vichrome.object( vichrome.widgets.CommandBox )
                          .init( vichrome.view, align, width )
                          .attachTo( vichrome.view )
                          .show( ":" )
                          .focus();
    };

    o.exit = function() {
        this.commandBox.hide().detachFrom( vichrome.view );
    };

    o.getKeyMapping = function() {
        // TODO: should return command mode specialized map ?
        return vichrome.model.getIMap();
    };
}(vichrome.mode.CommandMode));

vichrome.mode.FMode = vichrome.object( vichrome.mode.Mode );
(function(o) {
    var currentInput = "",
        hints        = [],
        keys         = "",
        keyLength    = 0;

    o.getName = function() {
        return "FMode";
    };

    o.setOption = function(opt) {
        this.opt = opt;
        return this;
    };

    o.hit = function(i) {
        var primary = false;

        if( hints[i].target.is('a') ) {
            primary = this.opt.newTab;
            if( !this.opt.continuous ) {
                setTimeout(function() {
                    vichrome.view.hideStatusLine();
                    vichrome.model.enterNormalMode();
                }, 0);
            }
        } else {
            hints[i].target.focus();
        }
        vichrome.util.dispatchMouseClickEvent(hints[i].target.get(0),
                                              primary, false, false );
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
        // TODO:
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
                vichrome.view.setStatusLineText('f Mode : ');
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
        if( candiNum === 1 ) {
            return 1;
        }

        return Math.ceil( Math.log( candiNum ) / Math.log( keys.length ) );
    };

    o.enter = function() {
        var div, links, total, x, y;
        currentInput = "";
        hints        = [];
        keys         = "";

        links = $('a:_visible,*:input:_visible');

        if( links.length === 0 ) {
            vichrome.view.setStatusLineText("No visible links found", 2000);
            setTimeout( function() {
                vichrome.model.enterNormalMode();
            }, 0);

            return;
        }

        keys = vichrome.model.getSetting("fModeAvailableKeys");
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
            x = hints[i].offset.left - 7;
            y = hints[i].offset.top  - 7;
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
    };
}(vichrome.mode.FMode));

$.extend($.expr[':'], {
    _visible: function(elem){
        var win_left = window.pageXOffset,
            win_top  = window.pageYOffset,
            win_h    = window.innerHeight,
            win_w    = window.innerWidth,
            offset   = $(elem).offset();

        if($.expr[':'].hidden(elem)){
            return false;
        }
        if($.curCSS(elem, 'visibility') === 'hidden') {
            return false;
        }
        if( ( win_left <= offset.left &&  offset.left <= win_left + win_w ) &&
            ( win_top  <= offset.top  &&  offset.top  <= win_top  + win_h ) ) {
            return true;
        } else {
            return false;
        }
    }
});


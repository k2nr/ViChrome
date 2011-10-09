vichrome.Model = function() {
        // dependencies
    var NormalMode     = vichrome.mode.NormalMode,
        InsertMode     = vichrome.mode.InsertMode,
        SearchMode     = vichrome.mode.SearchMode,
        CommandMode    = vichrome.mode.CommandMode,
        FMode          = vichrome.mode.FMode,
        util           = vichrome.util,
        logger         = vichrome.log.logger,
        NormalSearcher = vichrome.search.NormalSearcher,
        object         = vichrome.object,
        commandManager = vichrome.command.commandManager,

        // private variables
        initEnabled    = false,
        domReady       = false,
        disAutoFocus   = false,
        searcher       = null,
        pmRegister     = null,
        curMode        = null,
        settings       = null;

    function changeMode(newMode) {
        if( curMode ) {
            curMode.exit();
        }
        curMode = newMode;
        curMode.enter();
    }

    this.init = function() {
        var thisObj = this;
        this.enterNormalMode();

        pmRegister     = new vichrome.register.PageMarkRegister();
    };

    this.isReady =function() {
        return initEnabled && domReady;
    };

    this.setPageMark = function(key) {
        var mark = {};
        mark.top = window.pageYOffset;
        mark.left = window.pageXOffset;

        pmRegister.set( mark, key );
    };

    this.goPageMark = function(key) {
        var offset = pmRegister.get( key );
        if( offset ) {
            vichrome.view.scrollTo( offset.left, offset.top );
        }
    };

    this.setSearcher = function(searcher_) {
        searcher = searcher_;
    };

    this.cancelSearchHighlight = function() {
        if( searcher ) {
            searcher.cancelHighlight();
        }
    };

    this.enterNormalMode = function() {
        logger.d("enterNormalMode");
        changeMode( object( NormalMode ) );
    };

    this.enterInsertMode = function() {
        logger.d("enterInsertMode");
        changeMode( object( InsertMode ) );
    };

    this.enterCommandMode = function() {
        logger.d("enterCommandMode");
        this.cancelSearchHighlight();
        changeMode( object( CommandMode ) );
    };

    this.enterSearchMode = function(backward, searcher_) {
        var searcher = searcher_ || object( vichrome.search.NormalSearcher );

        logger.d("enterSearchMode");

        changeMode( object( SearchMode ).init( searcher, backward ) );
        this.setPageMark();
    };

    this.enterFMode = function(opt) {
        logger.d("enterFMode");
        changeMode( object(FMode).setOption(opt) );
    };

    this.isInNormalMode = function() {
        return (curMode.getName() === "NormalMode");
    };

    this.isInInsertMode = function() {
        return (curMode.getName() === "InsertMode");
    };

    this.isInSearchMode = function() {
        return (curMode.getName() === "SearchMode");
    };

    this.isInCommandMode = function() {
        return (curMode.getName() === "CommandMode");
    };

    this.isInFMode = function() {
        return (curMode.getName() === "FMode");
    };

    this.goNextSearchResult = function(reverse) {
        if( !searcher ) { return; }

        this.setPageMark();
        return searcher.goNext( reverse );
    };

    function getNMapFirst() {
        var nmap       = vichrome.extend( this.getSetting("keyMappingNormal") ),
            pageMap    = this.getSetting("pageMap"),
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i, myMap;

        if( !window.location.href || window.location.href.length === 0 ) {
            return nmap;
        }

        myMap = nmap;
        for ( i in pageMap ) if( hasOwnPrp.call( pageMap, i ) ) {
            if( this.isUrlMatched( window.location.href, i ) ) {
                vichrome.extend( pageMap[i].nmap, myMap );
            }
        }

        this.getNMap = function() {
            return myMap;
        };

        return myMap;
    }
    this.getNMap = getNMapFirst;

    function getIMapFirst() {
        var imap       = vichrome.extend( this.getSetting("keyMappingInsert") ),
            pageMap    = this.getSetting("pageMap"),
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i, myMap;

        if( !window.location.href || window.location.href.length === 0 ) {
            return imap;
        }
        myMap = imap;
        for ( i in pageMap ) if( hasOwnPrp.call( pageMap, i ) ) {
            if( this.isUrlMatched( window.location.href, i ) ) {
                myMap = vichrome.extend( pageMap[i].imap, myMap );
            }
        }

        this.getIMap = function() {
            return myMap;
        };

        return myMap;
    }
    this.getIMap = getIMapFirst;

    function getAliasFirst() {
        var aliases = vichrome.extend( this.getSetting("aliases") ),
            pageMap = this.getSetting("pageMap"),
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i, myAlias;

        if( !window.location.href || window.location.href.length === 0 ) {
            return aliases;
        }
        myAlias = aliases;
        for ( i in pageMap ) if( hasOwnPrp.call( pageMap, i ) ) {
            if( this.isUrlMatched( window.location.href, i ) ) {
                myAlias = vichrome.extend( pageMap[i].alias, myAlias );
            }
        }

        this.getAlias = function() {
            return myAlias;
        };

        return myAlias;
    }
    this.getAlias = getAliasFirst;

    this.getSetting = function(name) {
        return settings[name];
    };

    this.escape = function(){
        commandManager.reset();
        vichrome.view.hideStatusLine();
        if( !this.isInNormalMode() ) {
            this.enterNormalMode();
        }

    };

    this.onBlur = function() {
        curMode.blur();
    };

    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        disAutoFocus = false;
        return curMode.prePostKeyEvent(key, ctrl, alt, meta);
    };

    this.isValidKeySeq = function(keySeq) {
        if( this.getKeyMapping()[keySeq] ) {
            return true;
        } else {
            return false;
        }
    };

    this.isValidKeySeqAvailable = function(keySeq) {
        // since escaping meta character for regexp is so complex that
        // using regexp to compare should cause bugs, using slice & comparison
        // with '==' may be a better & simple way.
        var keyMapping = this.getKeyMapping(),
            length     = keySeq.length,
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            cmpStr, i, pos;

        for ( i in keyMapping ) if( hasOwnPrp.call( keyMapping, i ) ) {
            cmpStr = i.slice( 0, length );
            pos = cmpStr.indexOf("<", 0);
            if( pos >= 0 ) {
                pos = i.indexOf( ">", pos );
                if( pos >= length ) {
                    cmpStr = i.slice( 0, pos+1 );
                }
            }
            if( keySeq === cmpStr ) {
                return true;
            }
        }

        return false;
    };

    this.isUrlMatched = function(url, matchPattern) {
        var str, regexp;

        str = matchPattern.replace(/\*/g, ".*" )
                          .replace(/\/$/g, "")
                          .replace(/\//g, "\\/");
        str = "^" + str + "$";
        url = url.replace(/\/$/g, "");

        regexp = new RegExp(str, "m");
        if( regexp.test( url ) ) {
            logger.d("URL pattern matched:" + url + ":" + matchPattern);
            return true;
        }

        return false;
    };

    this.isEnabled = function() {
        var urls = this.getSetting( "ignoredUrls" ),
            len = urls.length,
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i;

        for( i=0; i<len; i++ ) {
            if( this.isUrlMatched(window.location.href, urls[i]) ) {
                logger.d("matched ignored list");
                return false;
            }
        }

        return true;
    };

    this.handleKey = function(msg) {
        return commandManager.handleKey( msg, this.getKeyMapping() );
    };

    this.triggerCommand = function(method, args) {
        if( curMode[method] ) {
            curMode[method]( args );
        } else {
            logger.e("INVALID command!:", method);
        }
    };

    this.onSettings = function(msg) {
        if(msg.name === "all") {
            settings = msg.value;
        } else {
            settings[msg.name] = msg.value;
        }

        if( !this.isEnabled() ) {
            settings.keyMappingNormal = {};
            settings.keyMappingInsert = {};
        }

        if( msg.name === "keyMappingNormal" ) {
            this.getNMap = getNMapFirst;
        } else if( msg.name === "keyMappingInsert" ) {
            this.getIMap = getIMapFirst;
        } else if( msg.name === "aliases" ) {
            this.getAlias = getAliasFirst;
        }
    };

    this.onFocus = function(target) {
        if(this.isInCommandMode() || this.isInSearchMode()) {
            logger.d("onFocus:current mode is command or search.do nothing");
            return;
        }

        if( disAutoFocus ) {
            setTimeout( function(){
                disAutoFocus = false;
            }, 500);
            vichrome.model.enterNormalMode();
            vichrome.view.blurActiveElement();
        } else {
            if( util.isEditable( target ) ) {
                this.enterInsertMode();
            } else {
                this.enterNormalMode();
            }
        }
    };

    this.getKeyMapping = function() {
        return curMode.getKeyMapping();
    };

    this.onInitEnabled = function( msg ) {
        logger.d("onInitEnabled");
        this.onSettings( msg );

        disAutoFocus = this.getSetting("disableAutoFocus");
        initEnabled = true;
        if( domReady ) {
            this.onDomReady();
        }
    };

    this.onDomReady = function() {
        logger.d("onDomReady");
        domReady = true;

        if( !initEnabled ) {
            logger.w("onDomReady is called before onInitEnabled");
            return;
        }

        vichrome.view.init();

        if( util.isEditable( document.activeElement ) && !disAutoFocus ) {
            this.enterInsertMode();
        } else {
            vichrome.model.enterNormalMode();
        }
    };
};

$(document).ready( function() {
    // if vichrome.model is not created here
    // this page may not have DOM so Vichrome
    // would not run properly.
    if( vichrome.model ) {
        vichrome.model.onDomReady();
    }
});


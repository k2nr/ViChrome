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

        // private variables
        searcher       = null,
        pmRegister     = null,
        commandManager = null,
        curMode        = null,
        settings       = null;

    function changeMode(newMode) {
        logger.d("mode changed", newMode);
        if( curMode ) {
            curMode.exit();
        }
        curMode = newMode;
        curMode.enter();
    }

    this.init = function() {
        var thisObj = this;

        vichrome.view.init( this.getSetting("commandBoxAlign"),
                            this.getSetting("commandBoxWidth") );

        if( util.isEditable( document.activeElement ) &&
            !this.getSetting("disableAutoFocus") ) {
            this.enterInsertMode();
        } else {
            vichrome.view.blurActiveElement();
            this.enterNormalMode();
        }

        pmRegister     = new vichrome.register.PageMarkRegister();
        commandManager = new vichrome.command.CommandManager(this);
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
            searcher.finalize();
            searcher = null;
        }
    };

    this.enterNormalMode = function() {
        changeMode( new NormalMode() );
    };

    this.enterInsertMode = function() {
        changeMode( new InsertMode() );
    };

    this.enterCommandMode = function() {
        this.cancelSearchHighlight();
        changeMode( new CommandMode() );
    };

    this.enterSearchMode = function(backward, searcher_) {
        var opt   = { wrap          : vichrome.model.getSetting("wrapSearch"),
                      ignoreCase    : vichrome.model.getSetting("ignoreCase"),
                      incSearch     : vichrome.model.getSetting("incSearch"),
                      minIncSearch  : vichrome.model.getSetting("minIncSearch"),
                      backward      : backward },
            searcher = searcher_;

        if( !searcher ) {
            searcher = new vichrome.search.NormalSearcher();
        }
        searcher.init( opt );

        changeMode( new SearchMode(searcher) );
        this.setPageMark();
    };

    this.enterFMode = function(opt) {
        changeMode( new FMode(opt) );
    };

    this.isInNormalMode = function() {
        return (curMode instanceof vichrome.mode.NormalMode);
    };

    this.isInInsertMode = function() {
        return (curMode instanceof vichrome.mode.InsertMode);
    };

    this.isInSearchMode = function() {
        return (curMode instanceof vichrome.mode.SearchMode);
    };

    this.isInCommandMode = function() {
        return (curMode instanceof vichrome.mode.CommandMode);
    };

    this.isInFMode = function() {
        return (curMode instanceof vichrome.mode.FMode);
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
        if( !this.isInNormalMode() ) {
            this.enterNormalMode();
        }

    };

    this.onBlur = function() {
        curMode.blur();
    };

    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
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
            logger.d("match pattern:" + url + ":" + matchPattern);
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
                return false;
            }
        }

        return true;
    };

    this.handleKey = function(msg) {
        return commandManager.handleKey(msg);
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
        } else if( msg.name === "keyMappingNormal" ) {
            this.getNMap = getNMapFirst;
        } else if( msg.name === "keyMappingInsert" ) {
            this.getIMap = getIMapFirst;
        }
    };

    this.onFocus = function(target) {
        if(this.isInCommandMode() || this.isInSearchMode()) {
            return;
        }

        if( util.isEditable( target ) ) {
            this.enterInsertMode();
        } else {
            this.enterNormalMode();
        }
    };

    this.getKeyMapping = function() {
        return curMode.getKeyMapping();
    };

    this.onInitEnabled = function( msg ) {
        this.onSettings( msg );
    };
};


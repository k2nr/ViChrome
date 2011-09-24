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
        vichrome.view.scrollTo( offset.left, offset.top );
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

    this.enterSearchMode = function(backward) {
        var opt   = { wrap          : vichrome.model.getSetting("wrapSearch"),
                      ignoreCase    : vichrome.model.getSetting("ignoreCase"),
                      incSearch     : vichrome.model.getSetting("incSearch"),
                      minIncSearch  : vichrome.model.getSetting("minIncSearch"),
                      backward   : backward };

        changeMode( new SearchMode(opt) );
        this.setPageMark();
    };

    this.enterFMode = function() {
        changeMode( new FMode() );
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

    this.getSetting = function(name) {
        return settings[name];
    };

    this.blur = function() {
        curMode.blur();
        commandManager.reset();
        if( !this.isInNormalMode() ) {
            this.enterNormalMode();
        }
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
};


vichrome.Model = function() {
        // dependencies
    var NormalMode     = vichrome.mode.NormalMode,
        InsertMode     = vichrome.mode.InsertMode,
        SearchMode     = vichrome.mode.SearchMode,
        CommandMode    = vichrome.mode.CommandMode,
        FMode          = vichrome.mode.FMode,
        // private variables
        searcher       = null,
        pmRegister     = null,
        commandManager = null;

    this.curMode    = null;
    this.settings   = {};
    this.init = function() {
        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        } else {
            this.enterNormalMode();
        }
        pmRegister     = new vichrome.register.PageMarkRegister();
        commandManager = new vichrome.command.CommandManager();
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

    this.changeMode = function(newMode) {
        vichrome.log.logger.d("mode changed", newMode);
        if( this.curMode ) {
            this.curMode.exit();
        }
        this.curMode = newMode;
        this.curMode.enter();
    };

    this.isEditable = function(target) {
        var ignoreList = ["TEXTAREA"],
            editableList = ["TEXT",
                            "PASSWORD",
                            "NUMBER",
                            "SEARCH",
                            "TEL",
                            "URL",
                            "EMAIL",
                            "TIME",
                            "DATETIME",
                            "DATETIME-LOCAL",
                            "DEATE",
                            "WEEK",
                            "COLOR"];

        if ( target.isContentEditable ) {
            return true;
        }

        if( target.nodeName && target.nodeName.toUpperCase() === "INPUT" ) {
            if( editableList.indexOf( target.type.toUpperCase() ) >= 0 ) {
                return true;
            }
        }

        if( ignoreList.indexOf(target.nodeName) >= 0 ){
            return true;
        }

        return false;
    };

    this.enterNormalMode = function() {
        this.changeMode( new NormalMode() );
    };

    this.enterInsertMode = function() {
        this.changeMode( new InsertMode() );
    };

    this.enterCommandMode = function() {
        this.changeMode( new CommandMode() );
    };

    this.enterSearchMode = function(backward) {
        //TODO:wrap should be read from localStorage
        searcher = new vichrome.search.NormalSearcher( true, backward );

        this.changeMode( new SearchMode() );
        this.setPageMark();
    };

    this.enterFMode = function() {
        this.changeMode( new FMode() );
    };

    this.cancelSearch = function() {
        this.cancelSearchHighlight();
        this.goPageMark();
        this.enterNormalMode();
    };

    this.cancelSearchHighlight = function() {
        vichrome.view.setStatusLineText("");
        if( searcher ) {
            searcher.removeHighlight();
        }
    };

    this.setSearchInput = function() {
        this.enterNormalMode();
    };

    this.updateSearchInput = function() {
        var str = vichrome.view.getCommandBoxValue();

        // the first char is always "/" so the char to search starts from 1
        searcher.updateInput( str );
    };

    this.isInNormalMode = function() {
        return (this.curMode instanceof vichrome.mode.NormalMode);
    };

    this.isInInsertMode = function() {
        return (this.curMode instanceof vichrome.mode.InsertMode);
    };

    this.isInSearchMode = function() {
        return (this.curMode instanceof vichrome.mode.SearchMode);
    };

    this.isInCommandMode = function() {
        return (this.curMode instanceof vichrome.mode.CommandMode);
    };

    this.isInFMode = function() {
        return (this.curMode instanceof vichrome.mode.FMode);
    };

    this.goNextSearchResult = function(reverse) {
        this.setPageMark();
        return searcher.goNext( reverse );
    };

    this.getSetting = function(name) {
        return this.settings[name];
    };

    this.blur = function() {
        this.curMode.blur();
    };

    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        return this.curMode.prePostKeyEvent(key, ctrl, alt, meta);
    };

    this.isValidKeySeq = function(keySeq) {
        if( this.getSetting("keyMappings")[keySeq] ) {
            return true;
        } else {
            return false;
        }
    };

    this.isValidKeySeqAvailable = function(keySeq) {
        // since escaping meta character for regexp is so complex that
        // using regexp to compare should cause bugs, using slice & comparison
        // with '==' may be a better & simple way.
        var keyMapping = this.getSetting("keyMappings"),
        length = keySeq.length,
        hasOwnPrp = Object.prototype.hasOwnProperty,
        cmpStr, i;

        for ( i in keyMapping ) {
            if( hasOwnPrp.call(keyMapping, i )) {
                cmpStr = i.slice( 0, length );
                if( keySeq === cmpStr ) {
                    return true;
                }
            }
        }

        return false;
    };

    this.handleKey = function(msg) {
        return commandManager.handleKey(msg);
    };
};


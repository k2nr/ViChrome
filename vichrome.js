function Vichrome()  {
    this.search = null;
    this.mode   = null;
    this.settings = {};
    this.pmRegister = null;

    this.init = function() {
        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        } else {
            this.enterNormalMode();
        }
        this.pmRegister = new PageMarkRegister();
    };

    this.setPageMark = function(key) {
        var mark = {};
        mark.top = window.pageYOffset;
        mark.left = window.pageXOffset;

        this.pmRegister.set( mark, key );
    };

    this.goPageMark = function(key) {
        var offset = this.pmRegister.get( key );
        view.scrollTo( offset.left, offset.top );
    }

    this.changeMode = function(newMode) {
        Logger.d("mode changed", newMode);
        if( this.mode ) {
            this.mode.exit();
        }
        this.mode = newMode;
        this.mode.enter();
    };

    this.isEditable = function(target) {
        var ignoreList = ["TEXTAREA"],
            editableList =["TEXT",
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

        if( target.nodeName.toUpperCase() === "INPUT" ) {
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
        this.search = new Search( true, backward );

        this.changeMode( new SearchMode() );
        this.setPageMark();
    };

    this.enterFMode = function(backward) {
        this.changeMode( new FMode() );
    };

    this.cancelSearch = function() {
        this.cancelSearchHighlight();
        this.goPageMark();
        this.enterNormalMode();
    };

    this.cancelSearchHighlight = function() {
        view.setStatusLineText("");
        this.search.removeHighlight();
    };

    this.setSearchInput = function() {
        this.enterNormalMode();
    };

    this.updateSearchInput = function() {
        var str = view.getCommandBoxValue();

        // the first char is always "/" so the char to search starts from 1
        this.search.updateInput( str );
    };

    this.isInNormalMode = function() {
        return (this.mode instanceof NormalMode);
    };

    this.isInInsertMode = function() {
        return (this.mode instanceof InsertMode);
    };

    this.isInSearchMode = function() {
        return (this.mode instanceof SearchMode);
    };

    this.isInCommandMode = function() {
        return (this.mode instanceof CommandMode);
    };

    this.isInFMode = function() {
        return (this.mode instanceof FMode);
    };

    this.goNextSearchResult = function(reverse) {
        this.setPageMark();
        return this.search.goNext( reverse );
    };

    this.getSetting = function(name) {
        return this.settings[name];
    };

    this.blur = function() {
        this.mode.blur();
    };

    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        return this.mode.prePostKeyEvent(key, ctrl, alt, meta);
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
}

vichrome = new Vichrome();
vichrome.eventHandler = new EventHandler();
vichrome.commandManager = new CommandManager();

window.addEventListener("DOMContentLoaded", function() {
    // TODO: onEnable should be triggered from background page.
    vichrome.eventHandler.onEnabled();
});


function Vichrome()  {
    this.search = null;
    this.mode   = null;
    this.settings = [];

    this.init = function() {
        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        } else {
            this.enterNormalMode();
        }
    };

    this.changeMode = function(newMode) {
        var that = this;
        Logger.d("mode changed", newMode);
        that.mode = newMode;
        that.mode.enter();
    };

    this.isEditable = function(target) {
        var ignoreList = ["TEXTAREA"];

        if ( target.isContentEditable ) {
            return true;
        }

        if( target.nodeName === "INPUT" && target.type === "text" ) {
            return true;
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
        this.changeMode( new SearchMode() );

        //TODO:wrap should be read from localStorage
        this.search = new Search( true, backward );
    };

    this.enterFMode = function(backward) {
        this.changeMode( new FMode() );
    };

    this.cancelSearch = function() {
        this.cancelSearchHighlight();
        this.enterNormalMode();
    };

    this.cancelSearchHighlight = function() {
        View.setStatusLineText("");
        this.search.removeHighlight();
    };

    this.setSearchInput = function() {
        this.enterNormalMode();
    };

    this.updateSearchInput = function() {
        var str = View.getCommandBoxValue();

        // the first char is always "/" so the char to search starts from 1
        this.search.updateInput( str.slice( 1, str.length ) );
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
}

vichrome = new Vichrome();

window.addEventListener("DOMContentLoaded", function() {
    // TODO: onEnable should be triggered from background page.
    eventHandler.onEnabled();
});


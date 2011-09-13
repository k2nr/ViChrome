function Vichrome()  {
    var search = null,
        mode   = null;

    this.settings = [];

    this.init = function() {
        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        } else {
            this.enterNormalMode();
        }
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
        mode = new NormalMode();
        mode.enter();
    };

    this.enterInsertMode = function() {
        mode = new InsertMode();
        mode.enter();
    };

    this.enterCommandMode = function() {
        mode = new CommandMode();
        mode.enter();
    };

    this.enterSearchMode = function(backward) {
        mode = new SearchMode();
        mode.enter();

        //TODO:wrap should be read from localStorage
        search = new Search( true, backward );
    };

    this.enterFMode = function(backward) {
        mode = new FMode();
        mode.enter();
    };

    this.cancelSearch = function() {
        this.cancelSearchHighlight();
        this.enterNormalMode();
    };

    this.cancelSearchHighlight = function() {
        View.setStatusLineText("");
        search.removeHighlight();
    };

    this.setSearchInput = function() {
        this.enterNormalMode();
    };

    this.updateSearchInput = function() {
        var str = View.getCommandBoxValue();

        // the first char is always "/" so the char to search starts from 1
        search.updateInput( str.slice( 1, str.length ) );
    };


    this.isInInsertMode = function() {
        return (mode instanceof InsertMode);
    };

    this.isInSearchMode = function() {
        return (mode instanceof SearchMode);
    };

    this.isInCommandMode = function() {
        return (mode instanceof CommandMode);
    };

    this.isInFMode = function() {
        return (mode instanceof FMode);
    };

    this.goNextSearchResult = function(reverse) {
        return search.goNext( reverse );
    };

    this.getSetting = function(name) {
        return this.settings[name];
    };

    this.blur = function() {
        mode.blur();
    };

    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        return mode.prePostKeyEvent(key, ctrl, alt, meta);
    };
}

vichrome = new Vichrome();

window.addEventListener("DOMContentLoaded", function() {
    // TODO: onEnable should be triggered from background page.
    eventHandler.onEnabled();
});


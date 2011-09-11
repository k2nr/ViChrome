function Vichrome()  {
    var modeInsert = false;
    var modeSearch = false;
    var modeCommand = false;
    var modeF = false;
    var currentSearchCnt = 0;
    var backwardSearch = false;
    var search = null;
    this.settings = [];

    this.init = function() {
        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        }
    };

    this.isEditable = function (target) {
        if (target.isContentEditable) {
            return true;
        }

        if(target.nodeName=="INPUT" && target.type == "text") {
            return true;
        }

        var ignoreList = ["TEXTAREA"];
        if(ignoreList.indexOf(target.nodeName) >= 0){
            return true;
        }

        return false;
    };

    this.enterInsertMode = function () {
        modeInsert = true;
    };

    this.enterCommandMode = function () {
        modeCommand = true;
    };

    this.enterSearchMode = function (backward) {
        if( this.isInSearchMode() ) {
            reutrn;
        }

        if(!search)
            search = new Search();

        modeSearch = true;
        backwardSearch = backward;
        if( backward )
            View.showCommandBox("?");
        else
            View.showCommandBox("/");

        View.focusCommandBox();
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
        // the first character is always "/" so the char to search starts from 1
        var searchStr = str.slice( 1, str.length );
        if(searchStr.length > 0) {
            search.searchAndHighlight( searchStr );
            var total = search.getSearchResultCnt();
            if( total == 0 ) {
                View.setStatusLineText("no matches");
                return;
            }

            currentSearchCnt = search.getFirstInnerSearchResultIndex( backwardSearch );
            if( currentSearchCnt < 0 ){
                if( backwardSearch )
                    currentSearchCnt = total - 1;
                else
                    currentSearchCnt = 0;
            }
            search.moveToSearchResult( currentSearchCnt );
        } else {
            View.setStatusLineText("");
            search.removeHighlight();
        }
    };

    this.enterNormalMode = function () {
        modeInsert  = false;
        modeCommand = false;
        modeSearch  = false;

        View.hideCommandBox();
    };

    this.isInInsertMode = function () {
        return modeInsert;
    };

    this.isInSearchMode = function () {
        return modeSearch;
    };

    this.isInCommandMode = function () {
        return modeCommand;
    };

    this.isInFMode = function () {
        return modeF;
    };

    this.goNextSearchResult = function (reverse) {
        //TODO:wrap should be read from localStorage
        var wrap = true;
        var total = search.getSearchResultCnt();
        var forward = backwardSearch == reverse;
        if( forward )
            currentSearchCnt++;
        else
            currentSearchCnt--;

        if( forward && currentSearchCnt >= total) {
            if( wrap ) {
                currentSearchCnt = 0;
            } else {
                return false;
            }
        } else if( !forward && currentSearchCnt < 0 ) {
            if( wrap ) {
                currentSearchCnt = total - 1;
            } else {
                return false;
            }
        }

        search.moveToSearchResult( currentSearchCnt );
        return true;
    };

    this.getSetting = function(name) {
        return this.settings[name];
    };
}

vichrome = new Vichrome();

window.addEventListener("DOMContentLoaded", function() {
    // TODO: onEnable should be triggered from background page.
    eventHandler.onEnabled();
});


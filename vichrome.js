var Vichrome = {
    modeInsert : false,
    modeSearch : false,
    modeCommand : false,
    modeF : false,
    settings : [],
    currentSearchCnt : 0,

    init : function() {
        setupPorts();
        addRequestListener();
        addWindowListeners();

        // should evaluate focused element on initialization.
        if( this.isEditable( document.activeElement ) ) {
            this.enterInsertMode();
        }
    },

    isEditable : function (target) {
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
    },

    enterInsertMode : function () {
        this.modeInsert = true;
    },

    enterCommandMode : function () {
        this.modeCommand = true;
    },

    enterSearchMode : function () {
        this.modeSearch = true;
    },

    enterNormalMode : function () {
        this.modeInsert  = false;
        this.modeCommand = false;
        this.modeSearch  = false;

        View.hideCommandBox();
    },

    isInInsertMode : function () {
        return this.modeInsert;
    },

    isInSearchMode : function () {
        return this.modeSearch;
    },

    isInCommandMode : function () {
        return this.modeCommand;
    },

    isInFMode : function () {
        return this.modeF;
    },

    goNextSearchResult : function (options) {
        var wrap     = options.wrap;
        var backward = options.backward;
        if( wrap == undefined ) {
            wrap = false;
        }
        if( backward == undefined ) {
            backward = false;
        }

        var total = View.getSearchResultCnt();
        if( backward )
            this.currentSearchCnt--;
        else
            this.currentSearchCnt++;

        if( !backward && this.currentSearchCnt >= total) {
            if( wrap ) {
                this.currentSearchCnt = 0;
            } else {
                return false;
            }
        } else if( backward && this.currentSearchCnt < 0 ) {
            if( wrap ) {
                this.currentSearchCnt = total - 1;
            } else {
                return false;
            }
        }

        View.moveToSearchResult( this.currentSearchCnt );
        return true;
    },
}

window.addEventListener("DOMContentLoaded", function() {
    // TODO: onEnable should be triggered from background page.
    onEnabled();
});

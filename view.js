var View = {
    sortedResults : null,

    init : function() {
        View.$commandBox   = $('<div id="vichromebox" />');
        View.$commandField = $('<input type="text" id="vichromeinput" value="" />');
        View.$statusLine = $('<div id="vichromestatusline"></div>')
                            .addClass('statuslineinactive');

        View.$commandBox
            .append(View.$commandField)
            .append(View.$statusLine);

        $(document.body).append(View.$commandBox);
    },

    showCommandBox : function(input) {
        this.$commandField.attr("value", input);
        this.$commandField.show();
        this.$statusLine.removeClass('statuslineinactive');
    },

    hideCommandBox : function() {
        this.$commandField.hide();
        this.$statusLine.addClass('statuslineinactive');
    },

    focusCommandBox : function() {
        this.$commandField.get(0).focus();
    },

    isCommandBoxActive : function() {
        return this.$commandField.css('display') != 'none';
    },

    getCommandBoxValue : function() {
        return this.$commandField.val();
    },

    setStatusLineText : function(text) {
        this.$statusLine.html(text);
    },

    highlight : function(word) {
        $(document.body).highlight(word);
    },

    removeHighlight : function() {
        $(document.body).removeHighlight();
    },

    searchAndHighlight : function(word) {
        this.removeHighlight();
        this.highlight(word);

        this.buildSortedResults();
    },

    buildSortedResults : function() {
        this.sortedResults = [];
        sortedResults = this.sortedResults;
        $('span.highlight:visible').each(function(i) {
            sortedResults[i] = new Object();
            var filter = ':eq('+i+')';
            sortedResults[i].offset   = $(this).offset();
            sortedResults[i].value = $(this);
        });

        this.sortedResults.sort(function(a, b){
            if( a.offset.top == b.offset.top ) {
                return a.offset.left -b.offset.left;
            } else {
                return a.offset.top - b.offset.top;
            }
        });
    },

    getSearchResultCnt : function() {
        return this.sortedResults.length;
    },

    getSearchResultSpan : function(cnt) {
        return this.sortedResults[cnt].value;
    },

    moveToSearchResult : function(pos) {
        var total = this.getSearchResultCnt();
        if( total > pos ) {
            var span = this.getSearchResultSpan( pos );
            if( span ) {
                $('span').removeClass('highlightFocus');
                span.addClass('highlightFocus');
                this.adjustScreenToSearchResult( span.offset() );
                View.$statusLine.html( pos+1 + " / " + total );
            }
        } else {
            Logger.e("out of bounds of searchResults length", pos);
        }
    },

    adjustScreenToSearchResult : function(pos) {
        var newX = window.pageXOffset;
        var newY = window.pageYOffset;
        // +100 is just for padding, which if pos is on the edge of the screen
        // it'a little bit difficult to see the result word.
        // TODO:try to dicide more meaningful value for the padding
        if( pos.left + 100 > window.pageXOffset + window.innerWidth ||
            pos.left < window.pageXOffset ) {
            newX = pos.left - window.innerWidth / 2;
        }
        if( pos.top + 100 > window.pageYOffset + window.innerHeight ||
            pos.top < window.pageYOffset ) {
            newY = pos.top - window.innerHeight / 2;
        }
        if( newX > document.body.scrollLeft - window.innerWidth ) {
            newX = document.body.scrollLeft - window.innerWidth;
        }
        if( newY > document.body.scrollHeight - window.innerHeight ) {
            newX = document.body.scrollHeight - window.innerHeight;
        }

        window.scrollTo( newX, newY );
    },
}


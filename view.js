var View = {
    sortedResults : null,

    init : function() {
        View.$commandBox   = $('<div id="vichromebox" />');
        View.$commandField = $('<input type="text" id="vichromeinput" value="" />');
        View.$statusLine = $('<div id="vichromestatusline" />')
                            .addClass('statuslineinactive');

        View.$commandBox
            .append(View.$commandField)
            .append(View.$statusLine);

        $(document.body).append(View.$commandBox);
    },

    showCommandBox : function(input) {
        this.$commandField.attr("value", input);
        this.$statusLine.removeClass('statuslineinactive');
        this.$commandBox.show();
        this.$commandField.show();
        this.$statusLine.show();
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
                return a.offset.left - b.offset.left;
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
        // TODO:try to dicide more meaningful value for the padding
        if( !this.isWithinScreen( pos.left, pos.top, 10 ) ) {
            var newX = pos.left - window.innerWidth / 2;
            var newY = pos.top - window.innerHeight / 2;

            if( newX > document.body.scrollLeft - window.innerWidth ) {
                newX = document.body.scrollLeft - window.innerWidth;
            }
            if( newY > document.body.scrollHeight - window.innerHeight ) {
                newX = document.body.scrollHeight - window.innerHeight;
            }

            window.scrollTo( newX, newY );
        }
    },

    isWithinScreen : function(x, y, padding) {
        // padding is for visiblity, which if pos is on the edge of the screen
        // it's a little bit difficult to see the result word.
        if( x + padding > window.pageXOffset + window.innerWidth ||
            x - padding < window.pageXOffset ) {
            return false;
        }

        if( y + padding > window.pageYOffset + window.innerHeight ||
            y - padding < window.pageYOffset ) {
            return false;
        }

        return true;
    },

    getFirstInnerSearchResultIndex : function(backward) {
        var total = this.getSearchResultCnt();
        for (var i=0; i < total; i++) {
            if(backward) {
                var offset = this.getSearchResultSpan( total - 1 - i ).offset();
                if( offset.top + 10 < window.pageYOffset + window.innerHeight ) {
                    return total - 1 - i;
                }
            } else {
                var offset = this.getSearchResultSpan(i).offset();
                if( offset.top - 10 > window.pageYOffset ) {
                    return i;
                }
            }
        }

        return -1;
    },

    focusInput : function( idx ) {
        $('form input:text').get(0).focus();
    },
}


var View = {
    searchResultCnt : 0,
    curretResultPos : 0,
    showCommandBox : function(input) {
        this.$commandField.attr("value", input);
        this.$commandBox.fadeIn(100, null);
    },

    hideCommandBox : function() {
        this.$commandBox.fadeOut(100, null);
    },

    focusCommandBox : function() {
        this.$commandField.get(0).focus();
    },

    isCommandBoxVisible : function() {
        return this.$commandBox.css('display') != 'none';
    },

    getCommandBoxValue : function() {
        return this.$commandField.val();
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

        this.searchResultCnt = $('span.highlight:visible').length;
    },

    getSearchResultCnt : function() {
        return this.searchResultCnt;
    },

    getSearchResultSpan : function(cnt) {
        var selector = 'span.highlight:visible:eq('+cnt+')';
        var span = $(selector);
        return span;
    },

    moveToSearchResult : function(pos) {
        if( this.searchResultCnt > pos ) {
            var span = this.getSearchResultSpan( pos );
            if( span ) {
                $('span').removeClass('highlightFocus');
                span.addClass('highlightFocus');
                this.adjustScreenToSearchResult( span.offset() );
                this.curretResultPos = pos;
            }
        } else {
            Logger.e("out of bounds of searchResultCnt", pos);
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

$(document).ready(function() {
        View.$commandBox = $("<div id=\"vichromebox\" style='display:none'></div>");
        View.$commandField = $('<input type=\"text\" id=\"vichromeinput\" value=\"\" />');

        View.$commandBox.append(View.$commandField)

        $(document.body).append(View.$commandBox);
});

function Search() {
    var sortedResults = null;

    function buildSortedResults() {
        sortedResults = [];
        $('span.highlight:visible').each(function(i) {
            sortedResults[i] = {};
            sortedResults[i].offset = $(this).offset();
            sortedResults[i].value  = $(this);
        });

        sortedResults.sort(function(a, b){
            if( a.offset.top === b.offset.top ) {
                return a.offset.left - b.offset.left;
            } else {
                return a.offset.top - b.offset.top;
            }
        });
    }

    function getSearchResultSpan(cnt) {
        return sortedResults[cnt].value;
    }

    function adjustScreenToSearchResult(pos) {
        // TODO:try to dicide more meaningful value for the padding
        if( !isWithinScreen( pos.left, pos.top, 10 ) ) {
            var newX = pos.left - window.innerWidth / 2,
                newY = pos.top - window.innerHeight / 2;

            if( newX > document.body.scrollLeft - window.innerWidth ) {
                newX = document.body.scrollLeft - window.innerWidth;
            }
            if( newY > document.body.scrollHeight - window.innerHeight ) {
                newX = document.body.scrollHeight - window.innerHeight;
            }

            window.scrollTo( newX, newY );
        }
    }

    function isWithinScreen(x, y, padding) {
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
    }

    this.highlight = function(word) {
        $(document.body).highlight(word);
    };

    this.removeHighlight = function() {
        $(document.body).removeHighlight();
    };

    this.searchAndHighlight = function(word) {
        this.removeHighlight();
        this.highlight(word);

        buildSortedResults();
    };

    this.getSearchResultCnt = function() {
        return sortedResults.length;
    };

    this.moveToSearchResult = function(pos) {
        var total = this.getSearchResultCnt(),
            span  = null;

        if( total > pos ) {
            span = getSearchResultSpan( pos );
            if( span ) {
                $('span').removeClass('highlightFocus');
                span.addClass('highlightFocus');
                adjustScreenToSearchResult( span.offset() );
                View.$statusLine.html( (pos+1) + " / " + total );
            }
        } else {
            Logger.e("out of bounds of searchResults length", pos);
        }
    };


    this.getFirstInnerSearchResultIndex = function(backward) {
        var total = this.getSearchResultCnt(),
            i, offset;
        for (i=0; i < total; i++) {
            if(backward) {
                offset = getSearchResultSpan( total - 1 - i ).offset();
                if( offset.top + 10 < window.pageYOffset + window.innerHeight ) {
                    return total - 1 - i;
                }
            } else {
                offset = getSearchResultSpan(i).offset();
                if( offset.top - 10 > window.pageYOffset ) {
                    return i;
                }
            }
        }

        return - 1;
    };
}

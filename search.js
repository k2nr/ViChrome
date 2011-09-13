function Search(wrap, backward) {
    var _sortedResults = null,
        _wrap          = wrap,
        _backward      = backward,
        _curIndex      = 0;

    if( backward ) {
        View.showCommandBox("?");
    } else {
        View.showCommandBox("/");
    }
    View.focusCommandBox();

    function buildSortedResults() {
        _sortedResults = [];
        $('span.highlight:visible').each(function(i) {
            _sortedResults[i] = {};
            _sortedResults[i].offset = $(this).offset();
            _sortedResults[i].value  = $(this);
        });

        _sortedResults.sort(function(a, b){
            if( a.offset.top === b.offset.top ) {
                return a.offset.left - b.offset.left;
            } else {
                return a.offset.top - b.offset.top;
            }
        });
    }

    function getSearchResultSpan(cnt) {
        return _sortedResults[cnt].value;
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

    function moveTo(pos) {
        var span  = null;

        if( getResultCnt() > pos ) {
            span = getSearchResultSpan( pos );
            if( span ) {
                $('span').removeClass('highlightFocus');
                span.addClass('highlightFocus');
                adjustScreenToSearchResult( span.offset() );
                View.$statusLine.html( (pos+1) + " / " + getResultCnt() );
            }
        } else {
            Logger.e("out of bounds of searchResults length", pos);
        }
    }

    function getResultCnt() {
        return _sortedResults.length;
    }

    function getFirstInnerSearchResultIndex() {
        var total = getResultCnt(),
            i, offset;
        for (i=0; i < total; i++) {
            if( _backward ) {
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

        return -1;
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


    this.updateInput = function(word) {
        if(word.length > 0) {
            this.searchAndHighlight( word );
            if( getResultCnt() === 0 ) {
                View.setStatusLineText("no matches");
                return;
            }

            _curIndex = getFirstInnerSearchResultIndex();
            if( _curIndex < 0 ){
                if( _backward ) {
                    _curIndex = getResultCnt() - 1;
                } else {
                    _curIndex = 0;
                }
            }
            moveTo( _curIndex );
        } else {
            View.setStatusLineText("");
            this.removeHighlight();
        }
    };

    this.goNext = function (reverse) {
        var forward = (_backward === reverse);

        if( forward ) {
            _curIndex++;
        } else {
            _curIndex--;
        }

        if( forward && _curIndex >= getResultCnt() ) {
            if( _wrap ) {
                _curIndex = 0;
            } else {
                return false;
            }
        } else if( !forward && _curIndex < 0 ) {
            if( _wrap ) {
                _curIndex = getResultCnt() - 1;
            } else {
                return false;
            }
        }

        moveTo( _curIndex );
        return true;
    };
}

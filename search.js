vichrome.search = {};

vichrome.search.NormalSearcher = function() {
    var _sortedResults = null,
        _opt           = null,
        _curIndex      = -1,
        _word          = "",
        _removed       = false;
        logger         = vichrome.log.logger;
        view           = vichrome.view;

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
                vichrome.view.setStatusLineText( (pos+1) + " / " + getResultCnt() );
            }
        } else {
            vichrome.log.logger.e("out of bounds of searchResults length", pos);
        }
    }

    function getResultCnt() {
        return _sortedResults.length;
    }

    function getFirstInnerSearchResultIndex() {
        var total = getResultCnt(),
            i, offset;
        for (i=0; i < total; i++) {
            if( _opt.backward ) {
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

    function updateInput(thisObj, word) {
        _word = word;

        // because search for string the length of which is 1 may be slow,
        // search starts with string whose length is over 2.
        if( word.length >= _opt.minIncSearch ) {
            thisObj.searchAndHighlight( word );
            if( getResultCnt() === 0 ) {
                vichrome.view.setStatusLineText("no matches");
                return;
            }

            _curIndex = getFirstInnerSearchResultIndex();
            if( _curIndex < 0 ){
                if( _opt.backward ) {
                    _curIndex = getResultCnt() - 1;
                } else {
                    _curIndex = 0;
                }
            }

            moveTo( _curIndex );
        } else {
            vichrome.view.setStatusLineText("");
            thisObj.removeHighlight();
        }
    }

    this.init = function(opt) {
        _opt = opt;

        if( _opt.backward ) {
            view.showCommandBox("?", "");
        } else {
            view.showCommandBox("/", "");
        }
        view.focusCommandBox();

        (function(obj) {
            if( _opt.incSearch ) {
                view.addInputUpdateListener( function(word) {
                    updateInput( obj, word );
                });
            }
        }(this));
    };



    this.highlight = function(word) {
        $(document.body).highlight( word, {ignoreCase : _opt.ignoreCase} );
    };

    this.removeHighlight = function() {
        $(document.body).removeHighlight();
    };

    this.searchAndHighlight = function(word) {
        this.removeHighlight();
        this.highlight(word);

        buildSortedResults();
    };

    this.fix = function(word) {
        if( !_opt.incSearch || word.length < _opt.minIncSearch  ) {
            _word = word;
            this.searchAndHighlight( _word );
        }
        view.removeInputUpdateListener();
    };

    this.goNext = function (reverse) {
        var forward = (_opt.backward === reverse);

        if( _removed ) {
            this.searchAndHighlight( _word );
            _removed = false;
        }

        if( forward ) {
            _curIndex++;
        } else {
            _curIndex--;
        }

        if( forward && _curIndex >= getResultCnt() ) {
            if( _opt.wrap ) {
                _curIndex = 0;
            } else {
                _curIndex = getResultCnt() - 1;
                return false;
            }
        } else if( !forward && _curIndex < 0 ) {
            if( _opt.wrap ) {
                _curIndex = getResultCnt() - 1;
            } else {
                _curIndex = 0;
                return false;
            }
        }

        moveTo( _curIndex );
        return true;
    };

    this.cancelHighlight = function() {
        logger.d("cancelHighlight");
        view.setStatusLineText("");
        this.removeHighlight();
        _removed = true;
    };

    this.finalize = function() {
        logger.d("finalize");
        _sortedResults = undefined;
        _opt = undefined;
        view.removeInputUpdateListener();
        view.setStatusLineText("");
        this.removeHighlight();
    };
};

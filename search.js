vichrome.search = {};

(function() {
    var _sortedResults = null,
        _opt           = null,
        _curIndex      = -1,
        _word          = "",
        _removed       = false,
        logger         = vichrome.log.logger,
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

    function getResultCnt() {
        return _sortedResults.length;
    }

    function getFirstInnerSearchResultIndex() {
        var total = getResultCnt(),
            i, offset;
        for (i=0; i < total; i++) {
            if( _opt.backward ) {
                offset = this.getSearchResultSpan( total - 1 - i ).offset();
                if( offset.top + 10 < window.pageYOffset + window.innerHeight ) {
                    return total - 1 - i;
                }
            } else {
                offset = this.getSearchResultSpan(i).offset();
                if( offset.top - 10 > window.pageYOffset ) {
                    return i;
                }
            }
        }

        return -1;
    }

    function updateInput(word) {
        _word = word;

        // because search for string the length of which is 1 may be slow,
        // search starts with string whose length is over 2.
        if( word.length >= _opt.minIncSearch ) {
            this.searchAndHighlight( word );
            if( getResultCnt() === 0 ) {
                vichrome.view.setStatusLineText("no matches");
                return;
            }

            _curIndex = getFirstInnerSearchResultIndex.call(this);
            if( _curIndex < 0 ){
                if( _opt.backward ) {
                    _curIndex = getResultCnt() - 1;
                } else {
                    _curIndex = 0;
                }
            }

            this.moveTo( _curIndex );
        } else {
            vichrome.view.setStatusLineText("");
            this.removeHighlight();
        }
    }

    vichrome.search.NormalSearcher = {
        init : function(opt, commandBox) {
            _opt = opt;

            (function(obj) {
                if( _opt.incSearch ) {
                    commandBox.addInputUpdateListener( function(word) {
                        updateInput.call( obj, word );
                    });
                }
            }(this));
        },

        getOption : function(){
            return _opt;
        },

        highlight : function(word) {
            $(document.body).highlight( word, {ignoreCase : _opt.ignoreCase} );
        },

        getCurIndex : function() {
            return _curIndex;
        },

        removeHighlight : function() {
            $(document.body).removeHighlight();
        },

        searchAndHighlight : function(word) {
            this.removeHighlight();
            this.highlight(word);

            buildSortedResults();
        },

        getSearchResultSpan : function(cnt) {
            return _sortedResults[cnt] && _sortedResults[cnt].value;
        },

        fix : function(word) {
            if( !_opt.incSearch || word.length < _opt.minIncSearch  ) {
                _word = word;
                this.searchAndHighlight( _word );
            }
            this.fixed = true;
        },

        moveTo : function(pos) {
            var span  = null;

            if( getResultCnt() > pos ) {
                span = this.getSearchResultSpan( pos );
                if( span ) {
                    $('span').removeClass('highlightFocus');
                    span.addClass('highlightFocus');
                    span.scrollTo();
                    vichrome.view.setStatusLineText( (pos+1) + " / " + getResultCnt() );
                }
            } else {
                logger.e("out of searchResults length", pos);
            }
        },


        goNext : function (reverse) {
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

            this.moveTo( _curIndex );
            return true;
        },

        cancelHighlight : function() {
            logger.d("cancelHighlight");
            this.removeHighlight();
            _removed = true;
        },

        finalize : function() {
            logger.d("finalize");
            _sortedResults = undefined;
            _opt = undefined;
            vichrome.view.hideStatusLine();
            this.removeHighlight();
        }
    };
}());

vichrome.search.LinkTextSearcher = vichrome.object( vichrome.search.NormalSearcher );
(function(o) {
    var sper = vichrome.search.NormalSearcher;

    o.highlight = function(word) {
        $("a").highlight( word, {ignoreCase : this.getOption().ignoreCase} );
    };

    o.moveTo = function(pos) {
        var span;
        sper.moveTo.call(this, pos);
        if( this.fixed ) {
            span = this.getSearchResultSpan( pos );
            span.parent("a").get(0).focus();
        }
    };

    o.fix = function(word) {
        var span;
        sper.fix.call(this, word);
        span = this.getSearchResultSpan( this.getCurIndex() );
        if( span ) {
            span.parent("a").get(0).focus();
        }
    };
}(vichrome.search.LinkTextSearcher));

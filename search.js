(function() {
  var g;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  g = this;
  g.NormalSearcher = (function() {
    function NormalSearcher() {}
    NormalSearcher.prototype.buildSortedResults = function() {
      var results;
      this.sortedResults = [];
      results = this.sortedResults;
      $('span.vichrome-highlight:visible').each(function(i) {
        results[i] = {};
        results[i].offset = $(this).offset();
        return results[i].value = $(this);
      });
      return this.sortedResults.sort(function(a, b) {
        if (a.offset.top === b.offset.top) {
          return a.offset.left - b.offset.left;
        } else {
          return a.offset.top - b.offset.top;
        }
      });
    };
    NormalSearcher.prototype.getResultCnt = function() {
      return this.sortedResults.length;
    };
    NormalSearcher.prototype.getFirstInnerSearchResultIndex = function() {
      var i, idx, span, _ref;
      for (i = 0, _ref = this.getResultCnt() - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        idx = this.opt.backward ? total - 1 - i : i;
        span = this.getResult(idx);
        if ((span != null) && span.isWithinScreen()) {
          return idx;
        }
      }
      return -1;
    };
    NormalSearcher.prototype.updateInput = function(word) {
      this.word = word;
      if (this.word.length >= this.opt.minIncSearch) {
        this.searchAndHighlight(this.word);
        if (this.getResultCnt() === 0) {
          g.view.setStatusLineText("no matches");
          return;
        }
        this.curIndex = this.getFirstInnerSearchResultIndex();
        if (this.curIndex < 0) {
          if (this.opt.backward) {
            this.curIndex = this.getResultCnt() - 1;
          } else {
            this.curIndex = 0;
          }
        }
        this.moveTo(this.curIndex);
      } else {
        g.view.setStatusLineText("");
        this.removeHighlight();
      }
    };
    NormalSearcher.prototype.init = function(opt) {
      this.opt = opt;
      return this;
    };
    NormalSearcher.prototype.getOption = function() {
      var ret;
      ret = g.object(this.opt);
      if (this.opt.useMigemo && this.word.length < this.opt.minMigemoLength) {
        ret.useMigemo = false;
      }
      return ret;
    };
    NormalSearcher.prototype.highlight = function(word) {
      var opt;
      opt = this.getOption();
      return $(document.body).highlight(word, {
        ignoreCase: opt.ignoreCase,
        useMigemo: opt.useMigemo
      });
    };
    NormalSearcher.prototype.getCurIndex = function() {
      return this.curIndex;
    };
    NormalSearcher.prototype.removeHighlight = function() {
      return $(document.body).removeHighlight();
    };
    NormalSearcher.prototype.searchAndHighlight = function(word) {
      this.removeHighlight();
      this.highlight(word);
      return this.buildSortedResults();
    };
    NormalSearcher.prototype.getResult = function(cnt) {
      var _ref;
      return (_ref = this.sortedResults[cnt]) != null ? _ref.value : void 0;
    };
    NormalSearcher.prototype.fix = function(word) {
      var span, _ref;
      if (!this.opt.incSearch || word.length < this.opt.minIncSearch || this.word !== word) {
        if (this.opt.useMigemo && word.length < this.opt.minMigemoLength) {
          this.opt.useMigemo = false;
        }
        this.word = word;
        this.searchAndHighlight(word);
        if (this.getResultCnt() === 0) {
          g.view.setStatusLineText("no matches");
          return;
        }
        this.curIndex = this.getFirstInnerSearchResultIndex();
        if (this.curIndex < 0) {
          if (this.opt.backward) {
            this.curIndex = this.getResultCnt() - 1;
          } else {
            this.curIndex = 0;
          }
        }
        this.moveTo(this.curIndex);
      } else {
        this.word = word;
      }
      chrome.extension.sendRequest({
        command: "PushSearchHistory",
        value: this.word
      });
      span = this.getResult(this.getCurIndex());
      if (span != null) {
        if ((_ref = span.closest("a").get(0)) != null) {
          _ref.focus();
        }
      }
      return this.fixed = true;
    };
    NormalSearcher.prototype.moveTo = function(pos) {
      var span, _ref;
      if (this.getResultCnt() > pos) {
        span = this.getResult(pos);
        if (span != null) {
          $('span').removeClass('vichrome-highlightFocus');
          span.addClass('vichrome-highlightFocus');
          span.scrollTo();
          g.view.setStatusLineText((pos + 1) + " / " + this.getResultCnt());
          if (this.fixed) {
            g.view.blurActiveElement();
            return (_ref = span.closest("a").get(0)) != null ? _ref.focus() : void 0;
          }
        }
      } else {
        return g.logger.e("out of searchResults length", pos);
      }
    };
    NormalSearcher.prototype.goNext = function(reverse) {
      var forward;
      forward = this.opt.backward === reverse;
      if (this.removed) {
        this.searchAndHighlight(this.word);
        this.removed = false;
      }
      if (forward) {
        this.curIndex++;
      } else {
        this.curIndex--;
      }
      if (forward && this.curIndex >= this.getResultCnt()) {
        if (this.opt.wrap) {
          this.curIndex = 0;
        } else {
          this.curIndex = this.getResultCnt() - 1;
          return false;
        }
      } else if (!forward && this.curIndex < 0) {
        if (this.opt.wrap) {
          this.curIndex = this.getResultCnt() - 1;
        } else {
          this.curIndex = 0;
          return false;
        }
      }
      this.moveTo(this.curIndex);
      return true;
    };
    NormalSearcher.prototype.cancelHighlight = function() {
      g.logger.d("cancelHighlight");
      this.removeHighlight();
      return this.removed = true;
    };
    NormalSearcher.prototype.finalize = function() {
      g.logger.d("finalize");
      this.sortedResults = void 0;
      this.opt = void 0;
      g.view.hideStatusLine();
      return this.removeHighlight();
    };
    return NormalSearcher;
  })();
  g.LinkTextSearcher = (function() {
    __extends(LinkTextSearcher, g.NormalSearcher);
    function LinkTextSearcher() {
      LinkTextSearcher.__super__.constructor.apply(this, arguments);
    }
    LinkTextSearcher.prototype.highlight = function(word) {
      var opt;
      opt = this.getOption();
      return $("a").highlight(word, {
        ignoreCase: opt.ignoreCase,
        useMigemo: opt.useMigemo
      });
    };
    return LinkTextSearcher;
  })();
}).call(this);

vichrome.widgets = {};

vichrome.widgets.Surface = function() {
    var $statusLine, initialized = false;

    this.init = function() {
        var align = vichrome.model.getSetting("commandBoxAlign"),
            width = vichrome.model.getSetting("commandBoxWidth"),
            alignClass = "statusline"+align;

        $statusLine = $( '<div id="vichromestatusline" />' )
                      .addClass( 'statuslineinactive' )
                      .addClass( alignClass )
                      .width( width );

        this.hideStatusLine();
        this.attach( $statusLine );
        initialized = true;
        return this;
    };

    this.attach = function( $w ) {
        $(document.body).append( $w );
        return this;
    };

    this.activeStatusLine = function() {
        $statusLine.removeClass( 'statuslineinactive' );
        $statusLine.show();
        if( this.slTimeout ) {
            clearTimeout(this.slTimeout);
            this.slTimeout = undefined;
        }
        return this;
    };

    this.inactiveStatusLine = function() {
        $statusLine.addClass( 'statuslineinactive' );
        return this;
    };

    this.hideStatusLine = function() {
        if( this.slTimeout ) {
            clearTimeout(this.slTimeout);
            this.slTimeout = undefined;
        }
        $statusLine.html("").hide();
        return this;
    };

    this.setStatusLineText = function(text, timeout) {
        $statusLine.html( text );
        this.activeStatusLine();

        if( timeout ) {
            this.slTimeout = setTimeout( function() {
                $statusLine.html("").hide();
            }, timeout);
        }

        return this;
    };

    this.detach = function( $w ) {
        return $w.detach();
    };

    this.focusInput = function( idx ) {
        if( !initialized ) {
            return;
        }
        $('form input:text:visible').get(0).focus();
        return this;
    };

    this.scrollBy = function( x, y ) {
        if( !initialized ) {
            return;
        }
        window.scrollBy( x, y );
        return this;
    };

    this.scrollTo = function( x, y ) {
        if( !initialized ) {
            return;
        }
        window.scrollTo( x, y );
        return this;
    };

    this.backHist = function() {
        if( !initialized ) {
            return;
        }
        window.history.back();
        return this;
    };

    this.forwardHist = function() {
        if( !initialized ) {
            return;
        }
        window.history.forward();
        return this;
    };

    this.reload = function() {
        if( !initialized ) {
            return;
        }
        window.location.reload();
        return this;
    };

    this.blurActiveElement = function() {
        if( !initialized ) {
            return;
        }
        document.activeElement.blur();
        return this;
    };
};

vichrome.widgets.CommandBox = {
    init : function(view, align, w) {
        var alignClass = "vichromebox" + align;

        this.$box   = $( '<div id="vichromebox" />' )
                        .addClass( alignClass )
                        .width( w );
        this.$input = $( '<input type="text" id="vichromeinput" spellcheck="false" value="" />' );
        this.$modeChar  = $( '<div id="vichromemodechar" />' );
        this.$inputField = $( '<table />' )
                       .append( $('<tr />')
                        .append( $('<td id="vichromemodechar" />')
                         .append( this.$modeChar )
                        )
                        .append( $('<td id="vichromeinput" />')
                         .append( this.$input )
                        )
                       );

        this.$inputField = $( '<div id="vichromefield" />' ).append( this.$inputField );

        this.$box.append( this.$inputField );

        this.view = view;

        return this;
    },

    addInputUpdateListener : function(fn) {
        this.inputUpdateListener = fn;
        return this;
    },

    removeInputUpdateListener : function() {
        this.inputUpdateListener = null;
        return this;
    },

    attachTo : function(view) {
        view.attach( this.$box );

        return this;
    },

    detachFrom : function(view) {
        view.detach( this.$box );

        this.inputUpdateListener = null;
        return this;
    },

    show : function(modeChar, input) {
        var thisObj = this;
        this.$input.attr( "value", input );
        this.$modeChar.html( modeChar );

        this.$box.show();
        this.$inputField.show();

        this.$box.keyup( function(e) {
            if( thisObj.isVisible() && thisObj.inputUpdateListener ) {
                thisObj.inputUpdateListener( thisObj.value() );
            }
        });

        this.view.activeStatusLine();

        return this;
    },

    hide : function() {
        if(this.isVisible()) {
            this.$inputField.hide();
            this.$input.blur();
        }

        this.$box.unbind();

        return this;
    },

    focus : function() {
        this.$input.get(0).focus();

        return this;
    },

    isVisible : function() {
        return this.$inputField.css( 'display' ) !== 'none';
    },

    value : function() {
        return this.$input.val();
    }
};

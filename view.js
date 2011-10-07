vichrome.views = {};

vichrome.views.Surface = function() {
    var $commandBox, $commandField, $commandInput, $modeChar, $statusLine,
        inputUpdateListener,
        initialized = false;

    this.addInputUpdateListener = function(fn) {
        inputUpdateListener = fn;
    };

    this.removeInputUpdateListener = function() {
        inputUpdateListener = null;
    };

    this.notifyInputUpdated = function() {
        if( this.isCommandBoxActive() && inputUpdateListener ) {
            inputUpdateListener( this.getCommandBoxValue() );
        }
    };

    this.init = function(align, w) {
        var alignClass = "vichromebox" + align;
        $commandBox   = $( '<div id="vichromebox" />' )
                        .addClass( alignClass )
                        .width( w );
        $commandInput = $( '<input type="text" id="vichromeinput" spellcheck="false" value="" />' );
        $modeChar  = $( '<div id="vichromemodechar" />' );
        $commandField = $( '<table />' )
                            .append( $('<tr />')
                                .append( $('<td id="vichromemodechar" />')
                                    .append( $modeChar )
                                )
                                .append( $('<td id="vichromeinput" />')
                                    .append( $commandInput )
                                )
                            );

        $commandField = $( '<div id="vichromefield" />' ).append( $commandField );
        $statusLine = $( '<div id="vichromestatusline" />' )
                            .addClass( 'statuslineinactive' );

        $commandBox
            .append( $commandField )
            .append( $statusLine );


        $(document.body).append( $commandBox );

        initialized = true;
    };

    this.showCommandBox = function(modeChar, input) {
        if( !initialized ) {
            return;
        }
        $commandInput.attr( "value", input );
        $modeChar.html( modeChar );
        $statusLine.removeClass( 'statuslineinactive' );

        $commandBox.show();
        $commandField.show();
        $statusLine.show();
    };

    this.hideCommandBox = function() {
        if( !initialized ) {
            return;
        }

        if(this.isCommandBoxActive()) {
            $commandField.hide();
            $commandInput.blur();
        }

        if( $statusLine.html() === '' ) {
            $statusLine.hide();
        }
        $statusLine.addClass( 'statuslineinactive' );
    };

    this.focusCommandBox = function() {
        if( !initialized ) {
            return;
        }

        $commandInput.get(0).focus();
    };

    this.isCommandBoxActive = function() {
        if( !initialized ) {
            return false;
        }
        return $commandField.css( 'display' ) !== 'none';
    };

    this.getCommandBoxValue = function() {
        if( !initialized ) {
            return "";
        }
        return $commandInput.val();
    };

    this.setStatusLineText = function(text, timeout) {
        if( !initialized ) {
            return;
        }
        $statusLine.html( text );
        if( !this.isCommandBoxActive() && !text ) {
            $statusLine.hide();
        } else {
            $statusLine.show();

            if( timeout ) {
                setTimeout( function() {
                    $statusLine.html("").hide();
                }, timeout);
            }
        }
    };

    this.focusInput = function( idx ) {
        if( !initialized ) {
            return;
        }
        $('form input:text:visible').get(0).focus();
    };

    this.scrollBy = function( x, y ) {
        if( !initialized ) {
            return;
        }
        window.scrollBy( x, y );
    };

    this.scrollTo = function( x, y ) {
        if( !initialized ) {
            return;
        }
        window.scrollTo( x, y );
    };

    this.backHist = function() {
        if( !initialized ) {
            return;
        }
        window.history.back();
    };

    this.forwardHist = function() {
        if( !initialized ) {
            return;
        }
        window.history.forward();
    };

    this.reload = function() {
        if( !initialized ) {
            return;
        }
        window.location.reload();
    };

    this.blurActiveElement = function() {
        if( !initialized ) {
            return;
        }
        document.activeElement.blur();
    };
};


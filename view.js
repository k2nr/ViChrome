vichrome.views = {};

vichrome.views.Surface = function() {
    var $commandBox, $commandField, $commandInput, $modeChar, $statusLine,
        inputUpdateListener;

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

    this.init = function() {
        $commandBox   = $('<div id="vichromebox" />');
        $commandInput = $('<input type="text" id="vichromeinput" value="" />');
        $modeChar  = $('<div id="vichromemodechar" />');
        $commandField = $('<table />')
                            .append( $('<tr />')
                                .append( $('<td id="vichromemodechar" />')
                                    .append( $modeChar )
                                )
                                .append( $('<td id="vichromeinput" />')
                                    .append( $commandInput )
                                )
                            );

        $commandField = $('<div id="vichromefield" />').append( $commandField );
        $statusLine = $('<div id="vichromestatusline" />')
                            .addClass('statuslineinactive');

        $commandBox
            .append( $commandField )
            .append( $statusLine );


        $(document.body).append( $commandBox );
    };

    this.showCommandBox = function(modeChar, input) {
        $commandInput.attr("value", input);
        $modeChar.html( modeChar );
        $statusLine.removeClass('statuslineinactive');

        $commandBox.show();
        $commandField.show();
        $statusLine.show();
    };

    this.hideCommandBox = function() {
        $commandField.hide();

        if( $statusLine.html() === '' ) {
            $statusLine.hide();
        }
        $statusLine.addClass('statuslineinactive');
    };

    this.focusCommandBox = function() {
        $commandInput.get(0).focus();
    };

    this.isCommandBoxActive = function() {
        return $commandField.css('display') !== 'none';
    };

    this.getCommandBoxValue = function() {
        return $commandInput.val();
    };

    this.setStatusLineText = function(text, timeout) {
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
        $('form input:text:visible').get(0).focus();
    };

    this.scrollBy = function( x, y ) {
        window.scrollBy( x, y );
    };

    this.scrollTo = function( x, y ) {
        window.scrollTo( x, y );
    };

    this.backHist = function() {
        window.history.back();
    };

    this.forwardHist = function() {
        window.history.forward();
    };

    this.reload = function() {
        window.location.reload();
    };

    this.blurActiveElement = function() {
        document.activeElement.blur();
    };
};


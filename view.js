function View() {
    var $commandBox, $commandField, $commandInput, $modeChar, $statusLine;

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

    this.setStatusLineText = function(text) {
        $statusLine.html(text);
        if( !this.isCommandBoxActive() && (text === '' || !text) ) {
            $statusLine.hide();
        } else {
            $statusLine.show();
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
}
view = new View();


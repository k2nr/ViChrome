var View = {
    init : function() {
        View.$commandBox   = $('<div id="vichromebox" />');
        View.$commandField = $('<input type="text" id="vichromeinput" value="" />');
        View.$statusLine = $('<div id="vichromestatusline" />')
                            .addClass('statuslineinactive');

        View.$commandBox
            .append(View.$commandField)
            .append(View.$statusLine);

        $(document.body).append(View.$commandBox);
    },

    showCommandBox : function(input) {
        this.$commandField.attr("value", input);
        this.$statusLine.removeClass('statuslineinactive');
        this.$commandBox.show();
        this.$commandField.show();
        this.$statusLine.show();
    },

    hideCommandBox : function() {
        this.$commandField.hide();
        this.$statusLine.addClass('statuslineinactive');
    },

    focusCommandBox : function() {
        this.$commandField.get(0).focus();
    },

    isCommandBoxActive : function() {
        return this.$commandField.css('display') != 'none';
    },

    getCommandBoxValue : function() {
        return this.$commandField.val();
    },

    setStatusLineText : function(text) {
        this.$statusLine.html(text);
    },

    focusInput : function( idx ) {
        $('form input:text').get(0).focus();
    },
}


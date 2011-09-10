var View = {
    showCommandBox : function(input) {
        this.$commandField.attr("value", input);
        this.$commandBox.fadeIn(100, null);
    },

    hideCommandBox : function() {
        this.$commandBox.fadeOut(100, null);
    },

    focusCommandBox : function() {
        this.$commandField.get(0).focus();
    },

    isCommandBoxVisible : function() {
        return this.$commandBox.css('display') != 'none';
    },

    getCommandBoxValue : function() {
        return this.$commandField.val();
    }
}

$(document).ready(function() {
        View.$commandBox = $("<div id=\"vichromebox\" style='display:none'></div>");
        View.$commandField = $('<input type=\"text\" id=\"vichromeinput\" value=\"\" />');

        View.$commandBox.append(View.$commandField)

        $(document.body).append(View.$commandBox);
});


function NormalMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        // TODO:some keys cannot be recognized with keyCode e.g. C-@
        return true;
    };

    this.blur = function() {
        vichrome.cancelSearchHighlight();
    };

    this.enter = function() {
        View.hideCommandBox();
    };
}

function InsertMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( key === keyCodes.ESC ) {
            return true;
        } else if(keyCodes.F1 <= key && key <= keyCodes.F12){
            return true;
        } else if( ctrl ) {
            return true;
        } else {
            // character key do not need to be handled in insert mode
            return false;
        }
    };

    this.blur = function() {

    };

    this.enter = function() {

    };
}

function SearchMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {
        if( View.getCommandBoxValue().length === 1 &&
            key === keyCodes.BS) {
            setTimeout( function() {
                vichrome.cancelSearch();
            }, 0);
        }

        switch(key) {
            case keyCodes.Tab   :
            case keyCodes.BS    :
            case keyCodes.DEL   :
            case keyCodes.Left  :
            case keyCodes.Up    :
            case keyCodes.Right :
            case keyCodes.Down  :
            case keyCodes.ESC   :
            case keyCodes.CR    :
                event.stopPropagation();
                break;
            default:
                break;
        }

        if( key === keyCodes.ESC ) {
            setTimeout( function() {
                vichrome.cancelSearch();
            }, 0);
            return true;
        } else if(keyCodes.F1 <= key && key <= keyCodes.F12){
            return true;
        } else if( ctrl ) {
            return true;
        } else if( key === keyCodes.CR ) {
            setTimeout( function(){
                vichrome.enterNormalMode();
            }, 0);
            return false;
        } else {
            return false;
        }
    };

    this.blur = function() {
        vichrome.cancelSearch();
    };

    this.enter = function() {
        View.focusCommandBox();
    };
}

function CommandMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {

    };

    this.blur = function() {

    };

    this.enter = function() {

    };
}

function FMode() {
    this.prePostKeyEvent = function(key, ctrl, alt, meta) {

    };

    this.blur = function() {

    };

    this.enter = function() {

    };
}

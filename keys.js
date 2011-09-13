var keyCodes = {
    ESC       : 27,
    Tab       : 9,
    Shift     : 16,
    BS        : 8,
    Alt       : 18,
    Ctrl      : 17,
    Meta      : 91,
    DEL       : 46,
    CR        : 13,
    SP        : 32,
    Left      : 37,
    Up        : 38,
    Right     : 39,
    Down      : 40,
    F1        : 112,
    F2        : 113,
    F3        : 114,
    F4        : 115,
    F5        : 116,
    F6        : 117,
    F7        : 118,
    F8        : 119,
    F9        : 120,
    F10       : 121,
    F11       : 122,
    F12       : 123
};

var KeyManager = {
    isESC : function (keyCode, ctrl) {
        if( keyCode === keyCodes.ESC ) {
            return true;
        } else if( ctrl && keyCode === '[' ) {
            return true;
        } else {
            return false;
        }
    },

    convertKeyCodeToStr : function (msg) {
        key = "";
        if(65 <= msg.keyCode && msg.keyCode <= 90){
            if(msg.shift) {
                key = String.fromCharCode(msg.keyCode);
            } else {
                key = String.fromCharCode(msg.keyCode + 32);
            }
            if(msg.ctrl) {
                key = "<C-" + key + ">";
            }

            return key;
        } else if(31 <= msg.keyCode && msg.keyCode <= 126){
            return String.fromCharCode(msg.keyCode);
        }

        switch(msg.keyCode) {
            case keyCodes.Tab   : return "<TAB>";
            case keyCodes.BS    : return "<BS>";
            case keyCodes.DEL   : return "<DEL>";
            case keyCodes.CR    : return "<CR>";
            case keyCodes.SP    : return "<SP>";
            case keyCodes.Left  : return "<Left>";
            case keyCodes.Up    : return "<Up>";
            case keyCodes.Right : return "<Right>";
            case keyCodes.Down  : return "<Down>";
            case keyCodes.F1    : return "<F1>";
            case keyCodes.F2    : return "<F2>";
            case keyCodes.F3    : return "<F3>";
            case keyCodes.F4    : return "<F4>";
            case keyCodes.F5    : return "<F5>";
            case keyCodes.F6    : return "<F6>";
            case keyCodes.F7    : return "<F7>";
            case keyCodes.F8    : return "<F8>";
            case keyCodes.F9    : return "<F9>";
            case keyCodes.F10   : return "<F10>";
            case keyCodes.F11   : return "<F11>";
            case keyCodes.F12   : return "<F12>";
        }

        if(KeyManager.isESC(msg.keyCode, msg.ctrl)) {
            return "<ESC>";
        }
    }
};


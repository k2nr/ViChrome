vichrome.key = {};

vichrome.key.keyCodes = {
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
    Left      : 128,
    Up        : 129,
    Right     : 130,
    Down      : 131,
    F1        : 132,
    F2        : 133,
    F3        : 134,
    F4        : 135,
    F5        : 136,
    F6        : 137,
    F7        : 138,
    F8        : 139,
    F9        : 140,
    F10       : 141,
    F11       : 142,
    F12       : 143,
    ASCII     : -1
};

vichrome.key.KeyManager = (function(){
    var keyCodes = vichrome.key.keyCodes;

    return {
        isESC : function (keyCode, ctrl) {
            if( keyCode === keyCodes.ESC ) {
                return true;
            } else if( ctrl && keyCode === '[' ) {
                return true;
            } else {
                return false;
            }
        },

        getKeyCodeStr : function (msg) {
            var result = "";

            switch( msg.code ) {
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
                case keyCodes.ESC   : return "<ESC>";
            }

            result = String.fromCharCode(msg.code);
            if( !result ) { return; }

            if( msg.ctrl ) {
                result = "<C-" + result + ">";
            }

            return result;
        },

        getLocalKeyCode : function(code) {
            switch( code ) {
                case keyCodes.Tab   :
                case keyCodes.BS    :
                case keyCodes.DEL   :
                case keyCodes.ESC   :
                    return code;
                case  37 : return keyCodes.Left;
                case  38 : return keyCodes.Up;
                case  39 : return keyCodes.Right;
                case  40 : return keyCodes.Down;
                case 112 : return keyCodes.F1;
                case 113 : return keyCodes.F2;
                case 114 : return keyCodes.F3;
                case 115 : return keyCodes.F4;
                case 116 : return keyCodes.F5;
                case 117 : return keyCodes.F6;
                case 118 : return keyCodes.F7;
                case 119 : return keyCodes.F8;
                case 120 : return keyCodes.F9;
                case 121 : return keyCodes.F10;
                case 122 : return keyCodes.F11;
                case 123 : return keyCodes.F12;
                default  : return keyCodes.ASCII;
            }
        }
    };
}());


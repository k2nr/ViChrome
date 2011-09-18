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
    Space     : 32,
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
    F12       : 143
};

vichrome.key.keyIdentifier = {
    "U+0031"    : "1",
    "U+0032"    : "2",
    "U+0033"    : "3",
    "U+0034"    : "4",
    "U+0035"    : "5",
    "U+0036"    : "6",
    "U+0037"    : "7",
    "U+0038"    : "8",
    "U+0039"    : "9",
    "U+0030"    : "0",
    "U+0021"    : "!",
    "U+0022"    : '"',
    "U+0023"    : "#",
    "U+0024"    : "$",
    "U+0025"    : "%",
    "U+0026"    : "&",
    "U+0027"    : "'",
    "U+0028"    : "(",
    "U+0029"    : ")",
    "U+002D"    : "-",
    "U+003D"    : "=",
    "U+005E"    : "^",
    "U+007E"    : "~",
    "U+00A5"    : "\\",
    "U+007C"    : "|",
    "U+0041"    : "a",
    "U+0042"    : "b",
    "U+0043"    : "c",
    "U+0044"    : "d",
    "U+0045"    : "e",
    "U+0046"    : "f",
    "U+0047"    : "g",
    "U+0048"    : "h",
    "U+0049"    : "i",
    "U+004A"    : "j",
    "U+004B"    : "k",
    "U+004C"    : "l",
    "U+004D"    : "m",
    "U+004E"    : "n",
    "U+004F"    : "o",
    "U+0050"    : "p",
    "U+0051"    : "q",
    "U+0052"    : "r",
    "U+0053"    : "s",
    "U+0054"    : "t",
    "U+0055"    : "u",
    "U+0056"    : "v",
    "U+0057"    : "w",
    "U+0058"    : "x",
    "U+0059"    : "y",
    "U+005A"    : "z",
    "U+0040"    : "@",
    "U+0060"    : "`",
    "U+005B"    : "[",
    "U+007B"    : "{",
    "U+003B"    : ";",
    "U+002B"    : "+",
    "U+003A"    : ":",
    "U+002A"    : "*",
    "U+005D"    : "]",
    "U+007D"    : "}",
    "U+002C"    : ",",
    "U+003C"    : "<",
    "U+002E"    : ".",
    "U+003E"    : ">",
    "U+002F"    : "/",
    "U+003F"    : "?",
    "U+005F"    : "_",
    "U+0020"    : "Space",
    "Left"      : "Left",
    "Down"      : "Down",
    "Up"        : "Up",
    "Right"     : "Right",
    "Enter"     : "Enter",
    "U+0008"    : "BS",
    "U+007F"    : "Del",
    "U+0009"    : "Tab",
    "F1"        : "F1",
    "F2"        : "F2",
    "F3"        : "F3",
    "F4"        : "F4",
    "F5"        : "F5",
    "F6"        : "F6",
    "F7"        : "F7",
    "F8"        : "F8",
    "F9"        : "F9",
    "F10"       : "F10",
    "F11"       : "F11",
    "F12"       : "F12",
    "U+001B"    : "ESC",
    "Home"      : "Home",
    "End"       : "End",
    "Control"   : "Ctrl",
    "Shift"     : "Shift",
    "Alt"       : "Alt",
    "Meta"      : "Meta",
    "PageDown"  : "PageDown",
    "PageUp"    : "PageUp",
    "CapsLock"  : "CapsLock"
};

vichrome.key.KeyManager = (function(){
    var keyCodes      = vichrome.key.keyCodes,
        keyIdentifier = vichrome.key.keyIdentifier;


    return {
        isAlphabet : function( str ) {
            if( str.length !== 1 ) { return false; }

            var c = str.charCodeAt( 0 );
            return ( 65 <= c && c <=  90 ) || ( 97 <= c && c <= 122 );
        },

        isNumber : function( str ) {
            if( str.length !== 1 ) { return false; }

            var c = str.charCodeAt( 0 );
            return ( 48 <= c && c <=  57 );
        },

        isESC : function (keyCode, ctrl) {
            if( keyCode === keyCodes.ESC ) {
                return true;
            } else if( ctrl && keyCode === '[' ) {
                return true;
            } else {
                return false;
            }
        },

        isOnlyModifier : function(code, ctrl, shift, alt, meta) {
            switch( this.getLocalKeyCode(code, ctrl, shift, alt, meta) ) {
                case keyCodes.Ctrl:
                case keyCodes.Shift:
                case keyCodes.Meta:
                case keyCodes.Alt:
                    return true;
                default:
                    return false;
            }
        },

        getKeyCodeStr : function (msg) {
            var result = msg.code;

            if( msg.ctrl ) {
                result = "C-" + result;
            }

            if( msg.ctrl || keyCodes[msg.code] ) {
                result = "<" + result + ">";
            }

            return result;
        },

        getLocalKeyCode : function(code, ctrl, shift, alt, meta) {
            var result = keyIdentifier[code];
            if( this.isAlphabet( result ) ) {
                if( shift ) { result = result.toUpperCase(); }
                else        { result = result.toLowerCase(); }
            }
            return result;
        }
    };
}());


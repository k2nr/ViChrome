var SettingManager = {
    defaultSettings : {
        "scrollPixelCount"        : 40,
        "searchEngine"            : "http://www.google.com/",
        "commandWaitTimeOut"      : 2000,
        "keyMappings"      : {
           "j"       : "ScrollDown",
           "k"       : "ScrollUp",
           "h"       : "ScrollLeft",
           "l"       : "ScrollRight",
           "<C-f>"   : "PageDown",
           "<C-b>"   : "PageUp",
           "<C-d>"   : "PageHalfDown",
           "<C-u>"   : "PageHalfUp",
           "gg"      : "GoTop",
           "G"       : "GoBottom",
           "t"       : "OpenNewTab",
           "x"       : "CloseCurTab",
           "n"       : "NextSearch",
           "N"       : "PrevSearch",
           ">"       : "MoveNextTab",
           "<"       : "MovePrevTab",
           "r"       : "ReloadTab",
           "H"       : "BackHist",
           "L"       : "ForwardHist",
           ":"       : "GoCommandMode",
           "/"       : "GoSearchModeForward",
           "?"       : "GoSearchModeBackward",
           "f"       : "GoFMode",
           "i"       : "FocusOnFirstInput",
           "<ESC>"   : "Escape"
        }
    },

    settingNames : [
        "scrollPixelCount",
        "searchEngine",
        "commandWaitTimeOut",
        "keyMappings"
    ],

    availableKeySeq : [
        "j",
        "k",
        "h",
        "l",
        "<C-f>",
        "<C-b>",
        "<C-d>",
        "<C-u>",
        "gg",
        "G",
        "k",
        "t",
        "x",
        "n",
        "N",
        ">",
        "<",
        "r",
        "H",
        "L",
        ":",
        "/",
        "?",
        "f",
        "i",
        "<ESC>"
    ],

    associateKeyMap : {},

    getAll : function() {
        settings = {};
        for (var i=0; i < this.settingNames.length; i++) {
            if ( localStorage[this.settingNames[i]] ) {
                settings[this.settingNames[i]] = localStorage[this.settingNames[i]];
            } else {
                settings[this.settingNames[i]] = this.defaultSettings[this.settingNames[i]];
            }
        }

        return settings;
    },

    get   : function(name) {
        if ( localStorage[name] ) {
            return localStorage[name];
        } else {
            return this.defaultSettings[name];
        }
    },

    set   : function(name, value) {
        localStorage[name] = value;

        if(this.setCb) {
            this.setCb(name, value);
        }
    },

    setCb : null,

    isValidKeySeq : function(keySeq) {
        if( this.availableKeySeq.indexOf( keySeq ) >= 0 ) {
            return true;
        } else {
            return false;
        }
    },

    isValidKeySeqAvailable : function(keySeq) {
        // since escaping meta character for regexp is so complex that
        // using regexp to compare should cause bugs, using slice & comparison
        // with '==' may be a better & simple way.
        for (var i=0; i < this.availableKeySeq.length; i++) {
            cmpStr = this.availableKeySeq[i].slice( 0, keySeq.length );
            if( keySeq === cmpStr ) {
                return true;
            }
        }

        return false;
    }
};

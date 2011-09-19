var SettingManager = {
    defaultSettings : {
        "scrollPixelCount"        : 40,
        "searchEngine"            : "http://www.google.com/",
        "commandWaitTimeOut"      : 2000,
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm",
        "wrapSearch"              : true,
        "incSearch"               : true,
        "ignoreCase"              : true,
        "ignoredUrls"             : [
            "http*://mail.google.com/*",
            "http*://www.google.com/reader/*"
        ],
        "keyMappingNormal"        : {
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
            "F"       : "GoFModeWithNewTab",
            "i"       : "FocusOnFirstInput",
            "u"       : "RestoreTab",
            "''"      : "BackToPageMark",
            "<ESC>"   : "Escape",
            "<C-[>"   : "Escape"
        },
        "keyMappingInsert" : {
           "<ESC>"   : "Escape",
           "<C-[>"   : "Escape"
        }
    },

    associateKeyMap : {},

    getAll : function() {
        var settings = {}, i,
            hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in this.defaultSettings ) if( hasOwnPrp.call( this.defaultSettings, i ) ) {
            if ( localStorage[i] ) {
                settings[i] = JSON.parse( localStorage.getItem(i) );
            } else {
                settings[i] = this.defaultSettings[i];
            }
        }

        return settings;
    },

    get   : function(name) {
        if ( localStorage[name] ) {
            return JSON.parse( localStorage.getItem(name) );
        } else {
            return this.defaultSettings[name];
        }
    },

    set   : function(name, value) {
        localStorage.setItem(name, JSON.stringify(value));

        if(this.setCb) {
            this.setCb(name, value);
        }
    },

    setCb : null
};

var SettingManager = {
    defaultSettings : {
        "scrollPixelCount"        : 40,
        "searchEngine"            : "http://www.google.com/",
        "commandWaitTimeOut"      : 2000,
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm",
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
           "F"       : "GoFModeWithNewTab",
           "i"       : "FocusOnFirstInput",
           "''"      : "BackToPageMark",
           "<ESC>"   : "Escape"
        },
        "keyMappingInsert" : {

        }
    },

    settingNames : [
        "scrollPixelCount",
        "searchEngine",
        "commandWaitTimeOut",
        "fModeAvailableKeys",
        "keyMappings"
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

    setCb : null
};


var SettingManager = {
    defaultSettings : {
        "scrollPixelCount"        : 40,
        "defaultNewTab"           : "home",
        "searchEngine"            : "http://www.google.com/",
        "commandWaitTimeOut"      : 2000,
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm",
        "disableAutoFocus"        : false,
        "wrapSearch"              : true,
        "incSearch"               : true,
        "ignoreCase"              : true,
        "minIncSearch"            : 2,
        "ignoredUrls"             : [
            "http*://mail.google.com/*",
            "http*://www.google.com/reader/*",
            "http*://docs.google.com/*",
            "http*://www.google.com/calendar/*"
        ],
        "commandBoxAlign"         : "Right-Bottom",
        "commandBoxWidth"         : 350,
        "keyMappingAndAliases"    : "",
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
            "<C-l>"   : "MoveToNextTab",
            "<C-h>"   : "MoveToPrevTab",
            "r"       : "ReloadTab",
            "H"       : "BackHist",
            "L"       : "ForwardHist",
            ":"       : "GoCommandMode",
            "/"       : "GoSearchModeForward",
            "?"       : "GoSearchModeBackward",
            "f"       : "GoFMode",
            "F"       : "GoFMode --newtab",
            "i"       : "FocusOnFirstInput",
            "u"       : "RestoreTab",
            "''"      : "BackToPageMark",
            "<ESC>"   : "Escape",
            "<C-[>"   : "Escape"
        },
        "keyMappingInsert" : {
            "<ESC>"   : "Escape",
            "<C-[>"   : "Escape"
        },
        "aliases"    : {
            "o"      : "Open",
            "ot"     : "OpenNewTab",
            "help"   : "OpenNewTab http://github.com/k2nr/ViChrome/wiki/Vichrome-User-Manual",
            "map"    : "NMap"
        }
    },

    userKeyMapNormal : {},
    userKeyMapInsert : {},
    aliases          : {},

    parseKeyMappingAndAliases : function() {
        if( !localStorage.keyMappingAndAliases ) { return; }

        var lines = JSON.parse( localStorage.getItem("keyMappingAndAliases") )
                      .replace(/^[\t ]*/m, "")
                      .replace(/[\t ]*$/m, "")
                      .replace(/<[A-Za-z0-9]+>/g, function(v){
                        return v.toUpperCase(); })
                      .split('\n'),
            len = lines.length,
            i, args;

        for( i=0; i < len; i++ ) {
            if( lines[i].length === 0 ){ continue; }
            if( lines[i].charAt(0) === '#' ){ continue; }
            args = lines[i].split(/[\t ]+/);

            switch( args[0] ) {
            case "map":
            case "nmap":
                if( args[2].charAt(0) === ':' ) {
                    this.userKeyMapNormal[ args[1] ] = args.slice(2).join(' ').slice(1);
                } else {
                    if( args[2].toUpperCase("<NOP>") ) {
                        delete this.userKeyMapNormal[ args[1] ];
                    } else {
                        this.userKeyMapNormal[ args[1] ] = this.userKeyMapNormal[ args[2] ];
                    }
                }
                break;
            case "imap":
                if( args[2].charAt(0) === ':' ) {
                    this.userKeyMapInsert[ args[1] ] = args.slice(2).join(' ').slice(1);
                } else {
                    if( args[2].toUpperCase("<NOP>") ) {
                        delete this.userKeyMapInsert[ args[1] ];
                    } else {
                        this.userKeyMapInsert[ args[1] ] = this.userKeyMapInsert[ args[2] ];
                    }
                }
                break;
            case "alias":
                this.aliases[ args[1] ] = args.slice(2).join(' ');
                break;
            default:
                break;
            }
        }
    },

    initUserKeyMapAndAliases  : function() {
        var defaultNormal     = this.defaultSettings.keyMappingNormal,
            defaultInsert     = this.defaultSettings.keyMappingInsert,
            defaultAliases    = this.defaultSettings.aliases,
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i;

        for ( i in defaultNormal ) if( hasOwnPrp.call( defaultNormal, i ) ) {
            this.userKeyMapNormal[i] = defaultNormal[i];
        }

        for ( i in defaultInsert ) if( hasOwnPrp.call( defaultInsert, i ) ) {
            this.userKeyMapInsert[i] = defaultNormal[i];
        }

        for ( i in defaultAliases ) if( hasOwnPrp.call( defaultAliases, i ) ) {
            this.aliases[i] = defaultAliases[i];
        }

        this.parseKeyMappingAndAliases();
    },

    getAll : function() {
        var settings = {}, i,
            hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in this.defaultSettings ) if( hasOwnPrp.call( this.defaultSettings, i ) ) {
            if( i === "keyMappingNormal" ) {
                settings[i] = this.userKeyMapNormal;
            } else if( i === "keyMappingInsert" ) {
                settings[i] = this.userKeyMapInsert;
            } else if( i === "aliases"){
                settings[i] = this.aliases;
            } else {
                settings[i] = this.get(i);
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
        if( name === "keyMappingAndAliases" ) {
            this.initUserKeyMapAndAliases();
        }

        if(this.setCb) {
            this.setCb(name, value);
        }
    },

    setNormalKeyMapping : function( key, assignee ) {
        if( assignee.charAt(0) === ":" ) {
            this.userKeyMapNormal[key] = assignee.slice(1);
            return this.userKeyMapNormal;
        } else {
            this.userKeyMapNormal[key] = this.userKeyMapNormal[assignee];
        }

        return this.userKeyMapNormal;
    },

    setInsertKeyMapping : function( key, assignee ) {
        if( assignee.charAt(0) === ":" ) {
            this.userKeyMapInsert[key] = assignee.slice(1);
            return this.userKeyMapInsert;
        } else {
            this.associateKeyMap[key] = assignee;
        }

        return this.userKeyMapInsert;
    },

    init  : function() {
        this.initUserKeyMapAndAliases();
    },

    setCb : null
};

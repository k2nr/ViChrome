
var mapping = {
    nmap  : {},
    imap  : {},
    alias : {}
};

var SettingManager = {
    defaultSettings : {
        "scrollPixelCount"        : 40,
        "defaultNewTab"           : "home",
        "searchEngine"            : "http://www.google.com/",
        "commandWaitTimeOut"      : 2000,
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm",
        "disableAutoFocus"        : false,
        "smoothScroll"            : false,
        "wrapSearch"              : true,
        "incSearch"               : true,
        "ignoreCase"              : true,
        "minIncSearch"            : 2,
        "ignoredUrls"             : [
            "http*://mail.google.com/*",
            "http*://www.google.co*/reader/*",
            "http*://docs.google.com/*",
            "http*://www.google.com/calendar/*"
        ],
        "commandBoxAlign"         : "Left-Bottom",
        "commandBoxWidth"         : 350,
        "keyMappingAndAliases"    :
"### Sample Settings\n\
\n\
# aliases\n\
# in this example you can open extensions page by the command ':ext'\n\
# and Chrome's option page by the command ':option'\n\
alias ext OpenNewTab chrome://extensions/\n\
alias option OpenNewTab chrome://settings/browser\n\
\n\
# mappings for opening your favorite web page\n\
nmap <Space>tw :OpenNewTab http://www.twitter.com\n\
nmap <Space>gr :OpenNewTab http://www.google.com/reader\n\
nmap <Space>m :OpenNewTab https://mail.google.com/mail/#inbox\n\
\n\
# F for continuous f-Mode\n\
# this is recomended setting but commented out by default.\n\
# if you want to use this setting, please delete '#'\n\
\n\
#nmap F :GoFMode --newtab --continuous\n\
\n\
# pagecmd offers you page specific key mapping.\n\
# in this example you can use <C-l>, <C-h> for moving between tabs\n\
# on all web pages regardless of your ignored list setting\n\
# because pagecmd has higher priority than ignored URLs.\n\
pagecmd http*://* nmap <C-l> :MoveToNextTab\n\
pagecmd http*://* nmap <C-h> :MoveToPrevTab\n\
",
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
            "a"       : "GoLinkTextSearchMode",
            "f"       : "GoFMode",
            "F"       : "GoFMode --newtab",
            "i"       : "FocusOnFirstInput",
            "u"       : "RestoreTab",
            "gp"      : "OpenNewWindow --pop",
            "''"      : "BackToPageMark",
            "<ESC>"   : "Escape",
            "<C-[>"   : "Escape"
        },
        "keyMappingInsert" : {
            "<C-l>"   : "MoveToNextTab",
            "<C-h>"   : "MoveToPrevTab",
            "<ESC>"   : "Escape",
            "<C-[>"   : "Escape"
        },
        "aliases"    : {
            "o"      : "Open",
            "ot"     : "OpenNewTab",
            "help"   : "OpenNewTab http://github.com/k2nr/ViChrome/wiki/Vichrome-User-Manual",
            "map"    : "NMap"
        },

        "pageMap"    : {}
    },

    userMap     : null,
    pageMap     : null,

    mapApplied : function( args ) {
        if( args[1].charAt(0) === ':' ) {
            this[ args[0] ] = args.slice(1).join(' ').slice(1);
        } else {
            if( args[1].toUpperCase() === "<NOP>" ) {
                this[ args[0] ] = "<NOP>";
            } else {
                this[ args[0] ] = this[ args[1] ];
            }
        }

        return this;
    },

    _map : function( map, args ) {
        return this.mapApplied.call( map.nmap, args );
    },

    _nmap : function( map, args ) {
        return this.mapApplied.call( map.nmap, args );
    },

    _imap : function( map, args ) {
        return this.mapApplied.call( map.imap, args );
    },

    _alias : function( map, args ) {
        map.alias[ args[0] ] = args.slice(1).join(' ');
        return map.alias;
    },

    _pagecmd : function( map, args ) {
        if( !this.pageMap[args[0]] ) {
            this.pageMap[args[0]] = vichrome.extendDeep(mapping);
        }

        if( this["_"+args[1]] ) {
            this["_"+args[1]]( this.pageMap[args[0]], args.slice(2) );
        }
    },

    parseKeyMappingAndAliases : function() {
        var lines = this.get("keyMappingAndAliases")
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
            if( this["_"+args[0]] ) {
                this["_"+args[0]]( this.userMap, args.slice(1) );
            }
        }
    },

    initUserMap  : function() {
        var defNormal     = this.defaultSettings.keyMappingNormal,
            defInsert     = this.defaultSettings.keyMappingInsert,
            defAliases    = this.defaultSettings.aliases,
            defPageMap    = this.defaultSettings.pageMap,
            hasOwnPrp  = Object.prototype.hasOwnProperty,
            i, j;

        this.userMap = vichrome.extendDeep( mapping );

        for ( i in defNormal ) if( hasOwnPrp.call( defNormal, i ) ) {
            this.userMap.nmap[i] = defNormal[i];
        }

        for ( i in defInsert ) if( hasOwnPrp.call( defInsert, i ) ) {
            this.userMap.imap[i] = defInsert[i];
        }

        for ( i in defAliases ) if( hasOwnPrp.call( defAliases, i ) ) {
            this.userMap.alias[i] = defAliases[i];
        }

        this.pageMap = {};
        for ( i in defPageMap ) if( hasOwnPrp.call( defPageMap, i ) ) {
            this.pageMap[i] = vichrome.extendDeep( mapping );
            for ( j in defPageMap[i].nmap ) if( hasOwnPrp.call( defPageMap[i].nmap, j ) ) {
                this.pageMap[i].nmap[j] = defPageMap[i].nmap[j];
            }

            for ( j in defPageMap[i].imap ) if( hasOwnPrp.call( defPageMap[i].imap, j ) ) {
                this.pageMap[i].imap[j] = defPageMap[i].imap[j];
            }

            for ( j in defPageMap[i].alias ) if( hasOwnPrp.call( defPageMap[i].alias, j ) ) {
                this.pageMap[i].alias[j] = defPageMap[i].alias[j];
            }
        }
    },

    getAll : function() {
        var settings = {}, i, map,
            hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in this.defaultSettings ) if( hasOwnPrp.call( this.defaultSettings, i ) ) {
            if( i === "keyMappingNormal" ) {
                settings[i] = this.userMap.nmap;
            } else if( i === "keyMappingInsert" ) {
                settings[i] = this.userMap.imap;
            } else if( i === "aliases"){
                settings[i] = this.userMap.alias;
            } else if( i === "pageMap"){
                settings[i] = this.pageMap;
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
            this.initUserMap();
            this.parseKeyMappingAndAliases();
        }

        if(this.setCb) {
            this.setCb(name, value);
        }
    },

    //set normal key mapping but just for temporary usage
    setNMap : function( args ) {
        return this._map( this.userMap, args );
    },

    //set insert key mapping but just for temporary usage
    setIMap : function( args ) {
        return this._imap( this.userMap, args );
    },

    //set command alias but just for temporary usage
    setAlias : function( args ) {
        return this._alias( this.userMap, args );
    },

    init  : function() {
        this.initUserMap();
        this.parseKeyMappingAndAliases();
    },

    setCb : null
};

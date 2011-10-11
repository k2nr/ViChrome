g = this

mapping =
    nmap  : {}
    imap  : {}
    alias : {}

g.SettingManager =
    defaultSettings :
        "scrollPixelCount"        : 40
        "defaultNewTab"           : "home"
        "searchEngine"            : "http://www.google.com/"
        "commandWaitTimeOut"      : 2000
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm"
        "disableAutoFocus"        : false
        "smoothScroll"            : false
        "wrapSearch"              : true
        "incSearch"               : true
        "ignoreCase"              : true
        "minIncSearch"            : 2
        "ignoredUrls"             : [
            "http*://mail.google.com/*"
            "http*://www.google.co*/reader/*"
            "http*://docs.google.com/*"
            "http*://www.google.com/calendar/*"
        ]
        "commandBoxAlign"         : "Left-Bottom"
        "commandBoxWidth"         : 350
        "keyMappingAndAliases"    : "### Sample Settings\n
\n
# aliases\n
# in this example you can open extensions page by the command ':ext'\n
# and Chrome's option page by the command ':option'\n
alias ext OpenNewTab chrome://extensions/\n
alias option OpenNewTab chrome://settings/browser\n
\n
# mappings for opening your favorite web page\n
nmap <Space>tw :OpenNewTab http://www.twitter.com\n
nmap <Space>gr :OpenNewTab http://www.google.com/reader\n
nmap <Space>m :OpenNewTab https://mail.google.com/mail/#inbox\n
\n
# F for continuous f-Mode\n
# this is recomended setting but commented out by default.\n
# if you want to use this setting, please delete '#'\n
\n
#nmap F :GoFMode --newtab --continuous\n
\n
# pagecmd offers you page specific key mapping.\n
# in this example you can use <C-l>, <C-h> for moving between tabs\n
# on all web pages regardless of your ignored list setting\n
# because pagecmd has higher priority than ignored URLs.\n
pagecmd http*://* nmap <C-l> :MoveToNextTab\n
pagecmd http*://* nmap <C-h> :MoveToPrevTab\n"
        "keyMappingNormal"  :
            "j"       : "ScrollDown"
            "k"       : "ScrollUp"
            "h"       : "ScrollLeft"
            "l"       : "ScrollRight"
            "<C-f>"   : "PageDown"
            "<C-b>"   : "PageUp"
            "<C-d>"   : "PageHalfDown"
            "<C-u>"   : "PageHalfUp"
            "gg"      : "GoTop"
            "G"       : "GoBottom"
            "t"       : "OpenNewTab"
            "x"       : "CloseCurTab"
            "n"       : "NextSearch"
            "N"       : "PrevSearch"
            "<C-l>"   : "MoveToNextTab"
            "<C-h>"   : "MoveToPrevTab"
            "r"       : "ReloadTab"
            "H"       : "BackHist"
            "L"       : "ForwardHist"
            ":"       : "GoCommandMode"
            "/"       : "GoSearchModeForward"
            "?"       : "GoSearchModeBackward"
            "a"       : "GoLinkTextSearchMode"
            "f"       : "GoFMode"
            "F"       : "GoFMode --newtab"
            "i"       : "FocusOnFirstInput"
            "u"       : "RestoreTab"
            "gp"      : "OpenNewWindow --pop"
            "''"      : "BackToPageMark"
            "<ESC>"   : "Escape"
            "<C-[>"   : "Escape"

        "keyMappingInsert" :
            "<C-l>"   : "MoveToNextTab"
            "<C-h>"   : "MoveToPrevTab"
            "<ESC>"   : "Escape"
            "<C-[>"   : "Escape"

        "aliases"    :
            "o"      : "Open"
            "ot"     : "OpenNewTab"
            "help"   : "OpenNewTab http://github.com/k2nr/ViChrome/wiki/Vichrome-User-Manual"
            "map"    : "NMap"

        "pageMap"    : {}

    userMap     : null
    pageMap     : null
    setCb : null

    mapApplied : (args) ->
        if args[1].charAt(0) == ':'
            this[ args[0] ] = args.slice(1).join(' ').slice(1)
        else
            if args[1].toUpperCase() == "<NOP>"
                this[ args[0] ] = "<NOP>"
            else
                this[ args[0] ] = this[ args[1] ]

        return this

    _map   : ( map, args ) -> @mapApplied.call( map.nmap, args )
    _nmap  : ( map, args ) -> @mapApplied.call( map.nmap, args )
    _imap  : ( map, args ) -> @mapApplied.call( map.imap, args )
    _alias : ( map, args ) ->
        map.alias[ args[0] ] = args.slice(1).join(' ')
        map.alias

    _pagecmd : ( map, args ) ->
        unless @pageMap[args[0]]? then @pageMap[args[0]] = g.extendDeep( mapping )

        this["_"+args[1]]?( @pageMap[args[0]], args.slice(2) )

    parseKeyMappingAndAliases : ->
        lines = @get("keyMappingAndAliases")
                .replace( /^[\t ]*/m, "" )
                .replace( /[\t ]*$/m, "" )
                .replace( /<[A-Za-z0-9]+>/g, (v) -> v.toUpperCase() )
                .split('\n')

        for line in lines
            if line.length == 0 then continue
            if line.charAt(0) == '#' then continue

            args = line.split(/[\t ]+/)
            this["_"+args[0]]?( @userMap, args.slice(1) )

        return this

    initUserMap  : ->
        defNormal     = @defaultSettings.keyMappingNormal
        defInsert     = @defaultSettings.keyMappingInsert
        defAliases    = @defaultSettings.aliases
        defPageMap    = @defaultSettings.pageMap

        @userMap = g.extendDeep( mapping )

        @userMap.nmap[key]  = command for key,command of defNormal
        @userMap.imap[key]  = command for key,command of defInsert
        @userMap.alias[key] = command for key,command of defAliases

        @pageMap = {}
        for url,map of defPageMap
            @pageMap[url] = g.extendDeep( mapping )
            @pageMap[url].nmap[key]  = com for key,com of map.nmap
            @pageMap[url].imap[key]  = com for key,com of map.imap
            @pageMap[url].alias[key] = com for key,com of map.alias

        return this

    getAll : ->
        settings = {}

        for name,value of @defaultSettings
            if name == "keyMappingNormal"
                settings[name] = @userMap.nmap
            else if name == "keyMappingInsert"
                settings[name] = @userMap.imap
            else if name == "aliases"
                settings[name] = @userMap.alias
            else if name == "pageMap"
                settings[name] = @pageMap
            else
                settings[name] = @get(name)

        return settings

    get   : (name) ->
        if localStorage[name]?
            return JSON.parse( localStorage.getItem(name) )
        else
            return @defaultSettings[name]

    set   : (name, value) ->
        localStorage.setItem( name, JSON.stringify(value) )
        if name == "keyMappingAndAliases"
            @initUserMap()
            @parseKeyMappingAndAliases()

        @setCb?(name, value)

    #set normal key mapping but just for temporary usage
    setNMap : (args) -> @_map( @userMap, args )

    #set insert key mapping but just for temporary usage
    setIMap : (args) -> @_imap( @userMap, args )

    #set command alias but just for temporary usage
    setAlias : (args) -> @_alias( @userMap, args )

    init  : ->
        @initUserMap()
        @parseKeyMappingAndAliases()


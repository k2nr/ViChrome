this.vichrome ?= {}
g = this.vichrome

mapping =
    nmap  : {}
    imap  : {}
    cmap  : {}
    emap  : {}
    alias : {}

g.SettingManager =
    defaultSettings :
        "scrollPixelCount"        : 40
        "defaultNewTab"           : "home"
        "commandWaitTimeOut"      : 2000
        "fModeAvailableKeys"      : "fdsaghjklwertyuiovbcnm"
        "fModeIgnoreCase"         : false
        "disableAutoFocus"        : false
        "smoothScroll"            : false
        "enableCompletion"        : true
        "searchEngine"            : "www.google.com"
        "wrapSearch"              : true
        "incSearch"               : true
        "ignoreCase"              : true
        "useMigemo"               : false
        "minMigemoLength"         : 3
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
alias ext TabOpenNew chrome://extensions/\n
alias option TabOpenNew chrome://settings/browser\n
alias downloads TabOpenNew chrome://downloads\n
alias history TabOpenNew chrome://history\n
\n
# mappings for opening your favorite web page\n
nmap <Space>tw :TabOpenNew http://www.twitter.com\n
nmap <Space>gr :TabOpenNew http://www.google.com/reader\n
nmap <Space>m  :TabOpenNew https://mail.google.com/mail/#inbox\n
\n

# F for continuous f-Mode\n
# this is recomended setting but commented out by default.\n
# if you want to use this setting, use the following\n
#nmap F :GoFMode --newtab --continuous\n
\n
# if you want to change the key used to escape EmergencyMode mode,\n
# use emap like the following\n
#emap <ESC> :Escape\n
\n
## pagecmd offers you page specific key mapping.\n
# in this example you can use <C-l>, <C-h> for moving between tabs\n
# on all web pages regardless of your ignored list setting\n
# because pagecmd has higher priority than ignored URLs.\n
pagecmd * nmap <C-l> :TabFocusNext\n
pagecmd * nmap <C-h> :TabFocusPrev\n
\n
# almost all Vichrome functions don't work properly for pdf contents\n
# so it's useful to enable default key bindings for pdf file.\n
pagecmd *.pdf nmap <C-f> <NOP>\n
\n
# if you want to use twitter web's key binding, write settings like below\n
#pagecmd http*://twitter.com/* nmap f <NOP>\n
#pagecmd http*://twitter.com/* nmap r <NOP>"

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
            "t"       : "TabOpenNew"
            "x"       : "TabCloseCurrent"
            "X"       : "TabCloseCurrent --focusprev"
            "n"       : "NextSearch"
            "N"       : "PrevSearch"
            "gt"      : "TabFocusNext"
            "gT"      : "TabFocusPrev"
            "<C-l>"   : "TabFocusNext"
            "<C-h>"   : "TabFocusPrev"
            "r"       : "TabReload"
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
            "gp"      : "WinOpenNew --pop"
            "gs"      : "TabOpenNew --next view-source:%url"
            "yy"      : "copyurl"
            "p"       : "Open %clipboard"
            "P"       : "TabOpenNew %clipboard"
            "o"       : "Open -i"
            "O"       : "TabOpenNew -i"
            "s"       : "Open -i g"
            "S"       : "TabOpenNew -i g"
            "b"       : "Open -b"
            "B"       : "TabOpenNew -b"
            "''"      : "BackToPageMark"
            "^"       : "TabSwitchLast"
            "<C-ESC>" : "GoEmergencyMode"
            "<ESC>"   : "Escape"
            "<C-[>"   : "Escape"

        "keyMappingInsert" :
            "<ESC>"   : "Escape"
            "<C-[>"   : "Escape"

        "keyMappingCommand" :
            "<TAB>"   : "FocusNextCandidate"
            "<S-TAB>" : "FocusPrevCandidate"
            "<DOWN>"  : "FocusNextCandidate"
            "<UP>"    : "FocusPrevCandidate"
            "<ESC>"   : "Escape"
            "<C-[>"   : "Escape"

        "keyMappingEmergency" :
            "<ESC>" : "Escape"

        "aliases"    :
            "o"      : "Open"
            "ot"     : "TabOpenNew"
            "opt"    : "OpenOptionPage"
            "help"   : "TabOpenNew http://github.com/k2nr/ViChrome/wiki/Vichrome-User-Manual"
            "map"    : "NMap"
            "tabe"   : "TabOpenNew"
            "tabnew" : "TabOpenNew"
            "tabn"   : "TabFocusNext"
            "tabp"   : "TabFocusPrev"
            "tabN"   : "TabFocusPrev"
            "tabr"   : "TabFocusFirst"
            "tabl"   : "TabFocusLast"
            "tabc"   : "TabCloseCurrent"
            "tabo"   : "TabCloseAll --only"
            "tabs"   : "TabList"
            "q"      : "TabCloseAll"
            "copyurl"        : "Copy %url"
            "copytitle"      : "Copy %title"
            "viewsource"     : "TabOpenNew --next view-source:%url"
            # for obsolete commands
            "OpenNewTab"     : "TabOpenNew"
            "MoveToNextTab"  : "TabFocusNext"
            "MoveToPrevTab"  : "TabFocusPrev"
            "MoveToFirstTab" : "TabFocusFirst"
            "MoveToLastTab"  : "TabFocusLast"
            "CloseCurTab"    : "TabCloseCurrent"
            "CloseAllTabs"   : "TabCloseAll"
            "ShowTabList"    : "TabList"
            "ReloadTab"      : "TabReload"
            "OpenNewWindow"  : "WinOpenNew"

        "pageMap"    : {}

    userMap     : null
    pageMap     : null
    setCb       : null

    mapApplied : (args) ->
        if args.length < 2
            g.logger.w "less arguments", args
            return this

        if args[1].charAt(0) == ':'
            this[ args[0] ] = args.slice(1).join(' ').slice(1)
        else
            switch args[1].toUpperCase()
                when "<NOP>"     then this[args[0]] = "<NOP>"
                when "<DISCARD>" then this[args[0]] = "<DISCARD>"
                else this[ args[0] ] = this[ args[1] ]
        this

    _map   : ( map, args ) -> @mapApplied.call( map.nmap, args )
    _nmap  : ( map, args ) -> @mapApplied.call( map.nmap, args )
    _imap  : ( map, args ) -> @mapApplied.call( map.imap, args )
    _cmap  : ( map, args ) -> @mapApplied.call( map.cmap, args )
    _emap  : ( map, args ) -> @mapApplied.call( map.emap, args )
    _alias : ( map, args ) ->
        if args.length < 2
            g.logger.w "less arguments", args
            return map.alias

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
            if line.length    ==  0  then continue
            if line.charAt(0) == '#' then continue

            args = line.split(/[\t ]+/)
            this["_"+args[0]]?( @userMap, args.slice(1) )
        this

    initUserMap  : ->
        defNormal     = @defaultSettings.keyMappingNormal
        defInsert     = @defaultSettings.keyMappingInsert
        defCommand    = @defaultSettings.keyMappingCommand
        defEmergency  = @defaultSettings.keyMappingEmergency
        defAliases    = @defaultSettings.aliases
        defPageMap    = @defaultSettings.pageMap

        @userMap = g.extendDeep( mapping )

        @userMap.nmap[key]  = command for key,command of defNormal
        @userMap.imap[key]  = command for key,command of defInsert
        @userMap.cmap[key]  = command for key,command of defCommand
        @userMap.emap[key]  = command for key,command of defEmergency
        @userMap.alias[key] = command for key,command of defAliases

        @pageMap = {}
        for url,map of defPageMap
            @pageMap[url] = g.extendDeep( mapping )
            @pageMap[url].nmap[key]  = com for key,com of map.nmap
            @pageMap[url].imap[key]  = com for key,com of map.imap
            @pageMap[url].cmap[key]  = com for key,com of map.cmap
            @pageMap[url].emap[key]  = com for key,com of map.emap
            @pageMap[url].alias[key] = com for key,com of map.alias

        return this

    getAll : ->
        settings = {}

        for name,value of @defaultSettings then switch name
            when "keyMappingNormal"    then settings[name] = @userMap.nmap
            when "keyMappingInsert"    then settings[name] = @userMap.imap
            when "keyMappingCommand"   then settings[name] = @userMap.cmap
            when "keyMappingEmergency" then settings[name] = @userMap.emap
            when "aliases"             then settings[name] = @userMap.alias
            when "pageMap"             then settings[name] = @pageMap
            else settings[name] = @get(name)

        return settings

    get : (name) ->
        if localStorage[name]?
            return JSON.parse( localStorage.getItem(name) )
        else
            return @defaultSettings[name]

    set : (name, value) ->
        localStorage.setItem( name, JSON.stringify(value) )
        if name == "keyMappingAndAliases"
            @initUserMap()
            @parseKeyMappingAndAliases()

        @setCb?(name, value)

    #set key mapping/aliases but just for temporary usage
    setNMap  : (args) -> @_map(   @userMap, args )
    setIMap  : (args) -> @_imap(  @userMap, args )
    setCMap  : (args) -> @_cmap(  @userMap, args )
    setEMap  : (args) -> @_emap(  @userMap, args )
    setAlias : (args) -> @_alias( @userMap, args )

    init  : ->
        @initUserMap()
        @parseKeyMappingAndAliases()


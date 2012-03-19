this.vichrome ?= {}
g = this.vichrome

settings = null

setSetting = (name, val, response) ->
    chrome.extension.sendRequest({
        command : "Settings"
        type    : "set"
        name    : name
        value   : val
    })

escChars = (str) ->
    str.replace("<", "&lt;")
       .replace(">", "&gt;")
       .replace(" ", "&nbsp;")

updateKeyMappingList = ->
    curMap = $('#keyMappingList')
    curMap.append($('<div />').html('<h3>Normal Mode Mapping (nmap)</h3>'))
    for key,com of settings.keyMappingNormal
        curMap.append( $('<div />').html( escChars key + " : " + escChars com ) )

    curMap.append($('<div />').html('<h3>Insert Mode Mapping (imap)</h3>'))
    for key,com of settings.keyMappingInsert
        curMap.append( $('<div />').html( escChars key + " : " + escChars com ) )

    curMap.append($('<div />').html('<h3>Search/Command Mode Mapping (cmap)</h3>'))
    for key,com of settings.keyMappingCommand
        curMap.append( $('<div />').html( escChars key + " : " + escChars com ) )

    curMap.append($('<div />').html('<h3>Emergency Mode Mapping (emap)</h3>'))
    for key,com of settings.keyMappingEmergency
        curMap.append( $('<div />').html( escChars key + " : " + escChars com ) )

    curMap.append($('<div />').html('<h3>Command Aliases (alias)</h3>'))
    for key,com of settings.aliases
        curMap.append( $('<div />').html( escChars key + " : " + escChars com ) )

    curMap.append($('<div />').html('<h2>PageCmd Mapping</h2>'))
    for url,map of settings.pageMap
        curMap.append( $('<div />').html("<h3>#{url}</h3>") )

        curMap.append($('<div />').html('<h3>Normal Mode Mapping</h3>'))
        for key,com of map.nmap
            curMap.append( $('<div />').html(escChars key + " : " + escChars com) )

        curMap.append($('<div />').html('<h3>Insert Mode Mapping</h3>'))
        for key,com of map.imap
            curMap.append( $('<div />').html(escChars key + " : " + escChars com) )

        curMap.append($('<div />').html('<h3>Search/Command Mode Mapping</h3>'))
        for key,com of map.cmap
            curMap.append( $('<div />').html(escChars key + " : " + escChars com) )

        curMap.append($('<div />').html('<h3>Emergency Mode Mapping</h3>'))
        for key,com of map.emap
            curMap.append( $('<div />').html(escChars key + " : " + escChars com) )

        curMap.append($('<div />').html('<h3>Command Aliases</h3>'))
        for key,com of map.alias
            curMap.append( $('<div />').html(escChars key + " : " + escChars com) )

initInputText = (name) ->
    $('#'+name).val( settings[name] ).keyup( ->
        setSetting name, $(this).val()
    )

initInputNumber = (name) ->
    $('#'+name).val( settings[name] ).keyup( ->
        setSetting name, parseInt( $(this).val() )
    ).click( ->
        setSetting name, parseInt( $(this).val() )
    ).mousewheel( ->
        setSetting name, parseInt( $(this).val() )
    )

initCheckBox = (name) ->
    $('#'+name).attr( 'checked', settings[name] ).change( ->
        setSetting name, $(this).is(':checked')
    )

initDropDown = (name) ->
    $('#'+name).val( settings[name] ).change( ->
        setSetting name, $(this).val()
    )

onSettings = (msg) ->
    if msg.name == "all" then settings = msg.value

    initInputNumber "scrollPixelCount"
    initInputNumber "commandWaitTimeOut"
    initInputNumber "minIncSearch"
    initInputNumber "commandBoxWidth"
    initInputNumber "minMigemoLength"
    initInputNumber "hintFontSize"
    initInputText   "fModeAvailableKeys"
    initInputText   "hintBackgroundColor"
    initInputText   "hintColor"
    initCheckBox    "disableAutoFocus"
    initCheckBox    "smoothScroll"
    initCheckBox    "enableCompletion"
    initCheckBox    "wrapSearch"
    initCheckBox    "incSearch"
    initCheckBox    "ignoreCase"
    initCheckBox    "useMigemo"
    initCheckBox    "fModeIgnoreCase"
    initCheckBox    "notifyUpdateSucceeded"
    initCheckBox    "useFModeAnimation"
    initDropDown    "commandBoxAlign"
    initDropDown    "searchEngine"

    $('[name="newTabPage"][value="'+settings.defaultNewTab+'"]')
    .attr( 'checked', true )
    $('[name="newTabPage"]').change( ->
        if $(this).is(':checked')
            setSetting "defaultNewTab", $(this).val()
    )

    $('#ignoredUrls').val settings.ignoredUrls.join('\n')
    $('#ignoredUrlsButton').click( ->
        setSetting "ignoredUrls", $('#ignoredUrls').val().split('\n')
    )

    $('#keyMapping').val settings.keyMappingAndAliases
    $('#keyMappingButton').click( ->
        setSetting "keyMappingAndAliases", $('#keyMapping').val()
    )

    updateKeyMappingList()

$(document).ready( ->
    chrome.extension.sendRequest( {
        command : "Settings"
        type    : "get"
        name    : "all"
    }, onSettings )
)

$(document).ready(->
    $('#page-container > div').hide()
    page = /#.*$/.exec(window.location.href)
    if page?
        page = page[0]
    else
        page = '#general'

    $("ul.navbar li:has(a[href=\"#{page}\"])").addClass('navbar-item-selected').show()
    $(page).show()
    console.log(page)

    $('ul.navbar li:not(.navbar-item-separator)').click( ->
        $('ul.navbar li').removeClass('navbar-item-selected')
        $(this).addClass('navbar-item-selected')
        $('#page-container > div').hide()

        tab = $(this).find('a').attr('href')
        $(tab).fadeIn(200)
        return false
    )
)


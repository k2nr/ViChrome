var settings = null;

function setSetting(name, val, response) {
    chrome.extension.sendRequest({ command : "Settings",
                                   type    : "set",
                                   name    : name,
                                   value   : val });
}

function escSpecialChars( str ) {
    return str.replace("<", "&lt;").replace(">", "&gt;").replace(" ", "&nbsp;");
}

function updateKeyMappingList() {
    var $keyMapList = $('#keyMappingList'), i, j;
    $keyMapList.append($('<div />').html('<h3>Normal Mode Mapping</h3>'));
    for( i in settings.keyMappingNormal ) {
        $keyMapList.append( $('<div />').html( escSpecialChars(i) + " : " +
                          escSpecialChars( settings.keyMappingNormal[i] ) ) );
    }

    $keyMapList.append($('<div />').html('<h3>Insert Mode Mapping</h3>'));
    for( i in settings.keyMappingInsert ) {
        $keyMapList.append( $('<div />').html( escSpecialChars(i) + " : " +
                          escSpecialChars( settings.keyMappingInsert[i] ) ) );
    }

    $keyMapList.append($('<div />').html('<h3>Command Aliases</h3>'));
    for( i in settings.aliases ) {
        $keyMapList.append( $('<div />').html( escSpecialChars(i) + " : " +
                          escSpecialChars( settings.aliases[i] ) ) );
    }

    $keyMapList.append($('<div />').html('<h2>PageCmd Mapping</h2>'));
    for( i in settings.pageMap ) {
        $keyMapList.append($('<div />').html('<h3>'+i+'</h3>'));
        $keyMapList.append($('<div />').html('<h3>Normal Mode Mapping</h3>'));
        for( j in settings.pageMap[i].nmap ) {
            $keyMapList.append( $('<div />').html( escSpecialChars(j) + " : " +
                escSpecialChars( settings.pageMap[i].nmap[j] ) ) );
        }

        $keyMapList.append($('<div />').html('<h3>Insert Mode Mapping</h3>'));
        for( j in settings.pageMap[i].imap ) {
            $keyMapList.append( $('<div />').html( escSpecialChars(j) + " : " +
                escSpecialChars( settings.pageMap[i].imap[j] ) ) );
        }

        $keyMapList.append($('<div />').html('<h3>Command Aliases</h3>'));
        for( j in settings.pageMap[i].alias ) {
            $keyMapList.append( $('<div />').html( escSpecialChars(j) + " : " +
                escSpecialChars( settings.pageMap[i].alias[j] ) ) );
        }
    }

}

function onSettings(msg) {
    if(msg.name === "all") {
        settings = msg.value;
    }

    $('#scrollPixelCount')
    .val( settings.scrollPixelCount )
    .keyup( function() {
        setSetting("scrollPixelCount", $(this).val());
    });

    $('#commandWaitTimeOut')
    .val( settings.commandWaitTimeOut )
    .keyup( function() {
        setSetting("commandWaitTimeOut", $(this).val());
    });

    $('#disableAutoFocus')
    .attr( 'checked', settings.disableAutoFocus )
    .change( function() {
        setSetting("disableAutoFocus", $(this).is(':checked'));
    });

    $('#smoothScroll')
    .attr( 'checked', settings.smoothScroll )
    .change( function() {
        setSetting("smoothScroll", $(this).is(':checked'));
    });

    $('[name="newTabPage"][value="'+settings.defaultNewTab+'"]')
    .attr( 'checked', true );
    $('[name="newTabPage"]')
    .change( function() {
        if( $(this).is(':checked') ) {
            setSetting( "defaultNewTab", $(this).val() );
        }
    });

    $('#wrapSearch')
    .attr( 'checked', settings.wrapSearch )
    .change( function() {
        setSetting("wrapSearch", $(this).is(':checked'));
    });

    $('#incSearch')
    .attr( 'checked', settings.incSearch )
    .change( function() {
        setSetting("incSearch", $(this).is(':checked'));
    });

    $('#ignoreCase')
    .attr( 'checked', settings.ignoreCase )
    .change( function() {
        setSetting("ignoreCase", $(this).is(':checked'));
    });

    $('#minIncSearch')
    .val( settings.minIncSearch )
    .keyup( function() {
        setSetting("minIncSearch", $(this).val());
    });

    $('#fModeAvailableKeys')
    .val( settings.fModeAvailableKeys )
    .change( function() {
        setSetting("fModeAvailableKeys", $(this).val());
    });

    $('#ignoredUrls')
    .val( settings.ignoredUrls.join('\n') );
    $('#ignoredUrlsButton').click( function() {
        setSetting("ignoredUrls", $('#ignoredUrls').val().split('\n'));
    });

    $('#commandBoxAlign')
    .val( settings.commandBoxAlign )
    .change( function() {
        setSetting( "commandBoxAlign", $(this).val() );
    });

    $('#commandBoxWidth')
    .val( settings.commandBoxWidth )
    .keyup( function() {
        setSetting("commandBoxWidth", $(this).val());
    });

    $('#keyMapping')
    .val( settings.keyMappingAndAliases );
    $('#keyMappingButton').click( function() {
        setSetting( "keyMappingAndAliases", $('#keyMapping').val() );
    });

    updateKeyMappingList();
}

$(document).ready(function() {
    chrome.extension.sendRequest( { command : "Settings",
                                    type    : "get",
                                    name    : "all" },
                                    onSettings );
});

$(document).ready(function() {
    $('ul.navbar li:first').addClass('navbar-item-selected').show();
    $('#page-container > div').hide();
    $('#general').show();

    $('ul.navbar li:not(.navbar-item-separator)').click(function() {
        $('ul.navbar li').removeClass('navbar-item-selected');
        $(this).addClass('navbar-item-selected');
        $('#page-container > div').hide();

        var tab = $(this).find('a').attr('href');
        $(tab).fadeIn(200);
        return false;
    });
});


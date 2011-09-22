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
    var $keyMapList = $('#keyMappingList'), i;
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

    $keyMapList.append($('<div />').html('<h3>Aliases</h3>'));
    for( i in settings.aliases ) {
        $keyMapList.append( $('<div />').html( escSpecialChars(i) + " : " +
                          escSpecialChars( settings.aliases[i] ) ) );
    }
}

function onSettings(msg) {
    if(msg.name === "all") {
        settings = msg.value;
    }

    $('#scrollPixelCount')
    .val( settings.scrollPixelCount )
    .change( function() {
        setSetting("scrollPixelCount", $(this).val());
    });

    $('#commandWaitTimeOut')
    .val( settings.commandWaitTimeOut )
    .change( function() {
        setSetting("commandWaitTimeOut", $(this).val());
    });

    $('#disableAutoFocus')
    .attr( 'checked', settings.disableAutoFocus )
    .change( function() {
        setSetting("disableAutoFocus", $(this).is(':checked'));
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
    $('#basics').show();

    $('ul.navbar li:not(.navbar-item-separator)').click(function() {
        $('ul.navbar li').removeClass('navbar-item-selected');
        $(this).addClass('navbar-item-selected');
        $('#page-container > div').hide();

        var tab = $(this).find('a').attr('href');
        $(tab).fadeIn(200);
        return false;
    });
});


var settings = null;

function setSetting(name, val) {
    chrome.extension.sendRequest({ command : "Settings",
                                   type    : "set",
                                   name    : name,
                                   value   : val});
}

function onSettings(msg) {
    if(msg.name === "all") {
        settings = msg.value;
    }

    $('[name="scrollPixelCount"]')
    .val( settings.scrollPixelCount )
    .change( function() {
        setSetting("scrollPixelCount", $(this).val());
    });

    $('[name="commandWaitTimeOut"]')
    .val( settings.commandWaitTimeOut )
    .change( function() {
        setSetting("commandWaitTimeOut", $(this).val());
    });

    $('[name="disableAutoFocus"]')
    .attr( 'checked', settings.disableAutoFocus )
    .change( function() {
        setSetting("disableAutoFocus", $(this).is(':checked'));
    });

    $('[name="wrapSearch"]')
    .attr( 'checked', settings.wrapSearch )
    .change( function() {
        setSetting("wrapSearch", $(this).is(':checked'));
    });

    $('[name="incSearch"]')
    .attr( 'checked', settings.incSearch )
    .change( function() {
        setSetting("incSearch", $(this).is(':checked'));
    });

    $('[name="ignoreCase"]')
    .attr( 'checked', settings.ignoreCase )
    .change( function() {
        setSetting("ignoreCase", $(this).is(':checked'));
    });

    $('[name="fModeAvailableKeys"]')
    .val( settings.fModeAvailableKeys )
    .change( function() {
        setSetting("fModeAvailableKeys", $(this).val());
    });

    $('[name="ignoredUrls"]')
    .val( settings.ignoredUrls.join('\n') );
    $('[name="ignoredUrlsButton"]').click( function() {
        setSetting("ignoredUrls", $('[name="ignoredUrls"]').val().split('\n'));
    });
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


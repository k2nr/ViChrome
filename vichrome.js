vichrome = {};

setTimeout( function() {
    vichrome.view    = new vichrome.widgets.Surface();
    vichrome.handler = new vichrome.event.EventHandler(vichrome.model,
                                                       vichrome.view);

    chrome.extension.sendRequest( { command : "Settings",
                                    type    : "get",
                                    name    : "all" },
                                    vichrome.handler.onInitEnabled );
}, 0);


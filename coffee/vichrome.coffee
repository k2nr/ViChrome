g = this

setTimeout( ->
    g.view    = new g.Surface
    g.handler = new g.EventHandler(g.model)
    chrome.extension.sendRequest {
        command : "Settings"
        type : "get"
        name : "all"
    }, (msg)->g.handler.onInitEnabled(msg)
, 0 )

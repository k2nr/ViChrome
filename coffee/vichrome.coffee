g = this

setTimeout( ->
    g.view    = new g.Surface
    g.handler = new g.EventHandler(g.model)
    chrome.extension.sendRequest {
        command : "Init"
    }, (msg)->g.handler.onInitEnabled(msg)
, 0 )

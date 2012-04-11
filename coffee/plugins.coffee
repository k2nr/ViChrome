this.vichrome ?= {}
g = this.vichrome

g.plugins = {}

if window.location.href.search( new RegExp(chrome.extension.getURL('')) ) >= 0
    isBackground = true
else
    isBackground = false

g.plugins.addCommand = (a) ->
    unless a.context?
        if isBackground
            a.context = g.bg
        else
            a.context = g.Mode

    if isBackground && a.context != g.bg
        throw "context must be vichrome.bg"

    if a.func?
        if isBackground
            a.context["req" + a.name] = a.func
        else
            a.context.prototype["req" + a.name] = a.func

    unless isBackground
        g.CommandExecuter.prototype.commandTable[a.name] = a.triggerType ? "triggerInsideContent"

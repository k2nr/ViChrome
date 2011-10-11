g = this

g.object = (obj) ->
    F = ->
    F.prototype = obj
    new F

g.extend = (mixin, obj={}) ->
    obj[name] = member for name, member of mixin
    obj

g.extendDeep = (parent, child={}) ->
    toStr = Object.prototype.toString
    astr  = "[object Array]"

    for name,member of parent
        if typeof member == "object"
            child[name] = if toStr.call(member) == astr then [] else {}
            g.extendDeep( member, child[name] )
        else
            child[name] = member
    child

include = (klass, mixin) ->
  extend klass.prototype, mixin

#########################
# logger
#########################
g.logLevels =
        DEBUG   : 1
        WARNING : 2
        ERROR   : 3
        FATAL   : 4
        NONE    : 5

g.LOG_LEVEL = g.logLevels.ERROR

levels = g.logLevels

g.logger =
    printLog : (a, o) ->
        if o
            console.log "vichrome: #{a} :%o", o
        else
            console.log "vichrome:#{a}"

    d : (a, o) -> if g.LOG_LEVEL <= g.logLevels.DEBUG   then @printLog(a, o)
    w : (a, o) -> if g.LOG_LEVEL <= g.logLevels.WARNING then @printLog(a, o)
    e : (a, o) -> if g.LOG_LEVEL <= g.logLevels.ERROR   then @printLog(a, o)
    f : (a, o) -> if g.LOG_LEVEL <= g.logLevels.FATAL   then @printLog(a, o)

g.util = {}
g.util.isEditable = (target) ->
    ignoreList = ["TEXTAREA"]
    editableList = [
        "TEXT"
        "PASSWORD"
        "NUMBER"
        "SEARCH"
        "TEL"
        "URL"
        "EMAIL"
        "TIME"
        "DATETIME"
        "DATETIME-LOCAL"
        "DEATE"
        "WEEK"
        "COLOR"
    ]

    if target.isContentEditable then return true
    if target.nodeName in ignoreList then return true

    if target.nodeName?.toUpperCase() == "INPUT" and \
       target.type.toUpperCase() in editableList
        return true

    return false

g.util.getPlatform = ->
    if navigator.userAgent.indexOf("Mac") >= 0
        platform = "Mac"
    else if navigator.userAgent.indexOf("Linux") >= 0
        platform = "Linux"
    else if navigator.userAgent.indexOf("Win") >= 0
        platform = "Windows"
    else
        platform = ""

    g.util.getPlatform = -> platform
    platform

g.util.dispatchKeyEvent = (target, identifier, primary, shift, alt) ->
    e = document.createEvent("KeyboardEvent")
    modifier = ""

    modifier += "Meta "  if primary
    modifier += "Shift " if shift
    modifier += "Alt"    if alt

    e.initKeyboardEvent("keydown", true, true, window, identifier, 0x00, modifier, true )

    target.dispatchEvent e

g.util.dispatchMouseClickEvent = (target, primary, shift, alt) ->
    e = document.createEvent("MouseEvents")
    secondary = false

    unless target?.dispatchEvent?
        g.logger.e "target is invalid"
        return false

    switch g.util.getPlatform()
        when "Mac"
            meta = primary
            ctrl = secondary
        when "Linux", "Windows"
            meta = secondary
            ctrl = primary
        else
            meta = secondary
            ctrl = primary

    e.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, ctrl, alt, shift, meta, 0, null)

    target.dispatchEvent e

    return true

g.util.getLang = ->
    lang = (navigator.userLanguage||navigator.browserLanguage||navigator.language).substr(0,2)

    g.util.getLang = -> lang
    lang


g.util.benchmark = (cb, text) ->
    getCurrentTime = -> (new Date).getTime()

    start = getCurrentTime()
    cb()

    text or= ""
    g.logger.d(text+"::benchmark result:#{ (getCurrentTime() - start) }ms" )

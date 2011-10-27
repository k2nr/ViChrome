this.vichrome ?= {}
g = this.vichrome


class g.PageMarkRegister
    constructor    : -> @values = {}
    defaultKeyName : "unnamed"

    set : (pos, key) ->
        unless key? then key = @defaultKeyName

        @values[key] = pos
        return this

    get : (key) ->
        unless key? then key = @defaultKeyName
        @values[key]

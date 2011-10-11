g = this

class g.PageMarkRegister
    constructor : ->
        @values = {}

    defaultKeyName : "unnamed"

    set : (pos, key) ->
        if not key then key = @defaultKeyName

        @values[key] = pos
        return this

    get : (key) ->
        if not key then key = @defaultKeyName
        @values[key]

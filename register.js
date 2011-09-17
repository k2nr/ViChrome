vichrome.register = {};

vichrome.register.PageMarkRegister = function() {
    this.values = {};
};

(function(o) {
    o.defaultKeyName = "unnamed";

    o.set = function(pos, key) {
        if( !key ) {
            key = this.defaultKeyName;
        }

        this.values[key] = pos;
    };

    o.get = function(key) {
        if( !key ) {
            key = this.defaultKeyName;
        }

        return this.values[key];
    };
}(vichrome.register.PageMarkRegister.prototype));

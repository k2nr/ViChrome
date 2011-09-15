function PageMarkRegister() {
    this.values = {};
}
PageMarkRegister.prototype.defaultKeyName = "unnamed";

PageMarkRegister.prototype.set = function(pos, key) {
    if( !key ) {
        key = this.defaultKeyName;
    }

    this.values[key] = pos;
};

PageMarkRegister.prototype.get = function(key) {
    if( !key ) {
        key = this.defaultKeyName;
    }

    return this.values[key];
};

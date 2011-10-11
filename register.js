(function() {
  var g;
  g = this;
  g.PageMarkRegister = (function() {
    function PageMarkRegister() {
      this.values = {};
    }
    PageMarkRegister.prototype.defaultKeyName = "unnamed";
    PageMarkRegister.prototype.set = function(pos, key) {
      if (!key) {
        key = this.defaultKeyName;
      }
      this.values[key] = pos;
      return this;
    };
    PageMarkRegister.prototype.get = function(key) {
      if (!key) {
        key = this.defaultKeyName;
      }
      return this.values[key];
    };
    return PageMarkRegister;
  })();
}).call(this);

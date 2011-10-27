(function() {
  var g, _ref;
  if ((_ref = this.vichrome) == null) {
    this.vichrome = {};
  }
  g = this.vichrome;
  g.PageMarkRegister = (function() {
    function PageMarkRegister() {
      this.values = {};
    }
    PageMarkRegister.prototype.defaultKeyName = "unnamed";
    PageMarkRegister.prototype.set = function(pos, key) {
      if (key == null) {
        key = this.defaultKeyName;
      }
      this.values[key] = pos;
      return this;
    };
    PageMarkRegister.prototype.get = function(key) {
      if (key == null) {
        key = this.defaultKeyName;
      }
      return this.values[key];
    };
    return PageMarkRegister;
  })();
}).call(this);

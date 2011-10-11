(function() {
  var g, keyCodes, keyIdentifier, shiftWinKeyIdentifier_ja, shiftWinKeyIdentifier_us, util, winKeyIdentifier_ja, winKeyIdentifier_us;
  g = this;
  g.key = {};
  g.key.keyCodes = {
    ESC: 27,
    TAB: 9,
    SHIFT: 16,
    BS: 8,
    ALT: 18,
    CTRL: 17,
    META: 91,
    DEL: 46,
    CR: 13,
    SPACE: 32,
    LEFT: 128,
    UP: 129,
    RIGHT: 130,
    DOWN: 131,
    F1: 132,
    F2: 133,
    F3: 134,
    F4: 135,
    F5: 136,
    F6: 137,
    F7: 138,
    F8: 139,
    F9: 140,
    F10: 141,
    F11: 142,
    F12: 143
  };
  g.key.keyIdentifier = {
    "U+0031": "1",
    "U+0032": "2",
    "U+0033": "3",
    "U+0034": "4",
    "U+0035": "5",
    "U+0036": "6",
    "U+0037": "7",
    "U+0038": "8",
    "U+0039": "9",
    "U+0030": "0",
    "U+0021": "!",
    "U+0022": '"',
    "U+0023": "#",
    "U+0024": "$",
    "U+0025": "%",
    "U+0026": "&",
    "U+0027": "'",
    "U+0028": "(",
    "U+0029": ")",
    "U+002D": "-",
    "U+003D": "=",
    "U+005E": "^",
    "U+007E": "~",
    "U+00A5": "\\",
    "U+005C": "\\",
    "U+007C": "|",
    "U+0041": "a",
    "U+0042": "b",
    "U+0043": "c",
    "U+0044": "d",
    "U+0045": "e",
    "U+0046": "f",
    "U+0047": "g",
    "U+0048": "h",
    "U+0049": "i",
    "U+004A": "j",
    "U+004B": "k",
    "U+004C": "l",
    "U+004D": "m",
    "U+004E": "n",
    "U+004F": "o",
    "U+0050": "p",
    "U+0051": "q",
    "U+0052": "r",
    "U+0053": "s",
    "U+0054": "t",
    "U+0055": "u",
    "U+0056": "v",
    "U+0057": "w",
    "U+0058": "x",
    "U+0059": "y",
    "U+005A": "z",
    "U+0040": "@",
    "U+0060": "`",
    "U+005B": "[",
    "U+007B": "{",
    "U+003B": ";",
    "U+002B": "+",
    "U+003A": ":",
    "U+002A": "*",
    "U+005D": "]",
    "U+007D": "}",
    "U+002C": ",",
    "U+003C": "<",
    "U+002E": ".",
    "U+003E": ">",
    "U+002F": "/",
    "U+003F": "?",
    "U+005F": "_",
    "U+0020": "SPACE",
    "Left": "LEFT",
    "Down": "DOWN",
    "Up": "UP",
    "Right": "RIGHT",
    "Enter": "CR",
    "U+0008": "BS",
    "U+007F": "DEL",
    "U+0009": "TAB",
    "F1": "F1",
    "F2": "F2",
    "F3": "F3",
    "F4": "F4",
    "F5": "F5",
    "F6": "F6",
    "F7": "F7",
    "F8": "F8",
    "F9": "F9",
    "F10": "F10",
    "F11": "F11",
    "F12": "F12",
    "U+001B": "ESC",
    "Home": "HOME",
    "End": "END",
    "Control": "CTRL",
    "Shift": "SHIFT",
    "Alt": "ALT",
    "Meta": "META",
    "PageDown": "PAGEDOWN",
    "PageUp": "PAGEUP",
    "CapsLock": "CAPSLOCK"
  };
  g.key.winKeyIdentifier_ja = {
    "U+00BC": ",",
    "U+00BE": ".",
    "U+00BF": "/",
    "U+00E2": "\\",
    "U+00BB": ";",
    "U+00BA": ":",
    "U+00DD": "]",
    "U+00C0": "@",
    "U+00DB": "[",
    "U+00BD": "-",
    "U+00DE": "^",
    "U+00DC": "\\"
  };
  g.key.shiftWinKeyIdentifier_ja = {
    "U+00BC": "<",
    "U+00BE": ">",
    "U+00BF": "?",
    "U+00E2": "_",
    "U+00BB": "+",
    "U+00BA": "*",
    "U+00DD": "}",
    "U+00C0": "`",
    "U+00DB": "{",
    "U+00BD": "=",
    "U+00DE": "~",
    "U+00DC": "|",
    "U+0031": "!",
    "U+0032": '"',
    "U+0033": "#",
    "U+0034": "$",
    "U+0035": "%",
    "U+0036": "&",
    "U+0037": "'",
    "U+0038": "(",
    "U+0039": ")"
  };
  g.key.winKeyIdentifier_us = {
    "U+00BC": ",",
    "U+00BE": ".",
    "U+00BF": "/",
    "U+00BB": "=",
    "U+00BA": ";",
    "U+00DD": "]",
    "U+00DB": "[",
    "U+00BD": "-",
    "U+00DC": "\\",
    "U+00DE": "'",
    "U+0060": "`"
  };
  g.key.shiftWinKeyIdentifier_us = {
    "U+00BC": "<",
    "U+00BE": ">",
    "U+00BF": "?",
    "U+00BB": "+",
    "U+00BA": ":",
    "U+00DD": "}",
    "U+00DB": "{",
    "U+00BD": "_",
    "U+0038": "*",
    "U+00DC": "|",
    "U+007E": "~",
    "U+0036": "^",
    "U+0031": "!",
    "U+00DE": '"',
    "U+0032": "@",
    "U+0033": "#",
    "U+0034": "$",
    "U+0035": "%",
    "U+0037": "&",
    "U+0039": "(",
    "U+0030": ")"
  };
  keyCodes = g.key.keyCodes;
  keyIdentifier = g.key.keyIdentifier;
  winKeyIdentifier_ja = g.key.winKeyIdentifier_ja;
  shiftWinKeyIdentifier_ja = g.key.shiftWinKeyIdentifier_ja;
  winKeyIdentifier_us = g.key.winKeyIdentifier_us;
  shiftWinKeyIdentifier_us = g.key.shiftWinKeyIdentifier_us;
  util = g.util;
  g.KeyManager = {
    isAlphabet: function(str) {
      var c;
      if (str.length !== 1) {
        return false;
      }
      c = str.charCodeAt(0);
      return ((65 <= c && c <= 90)) || ((97 <= c && c <= 122));
    },
    isNumber: function(str) {
      var c;
      if (str.length !== 1) {
        return false;
      }
      c = str.charCodeAt(0);
      return (48 <= c && c <= 57);
    },
    isOnlyModifier: function(code, ctrl, shift, alt, meta) {
      switch (keyCodes[this.getLocalKeyCode(code, ctrl, shift, alt, meta)]) {
        case keyCodes.CTRL:
        case keyCodes.SHIFT:
        case keyCodes.META:
        case keyCodes.ALT:
          return true;
        default:
          return false;
      }
    },
    getKeyCodeStr: function(msg) {
      var result;
      result = msg.code;
      if (msg.ctrl) {
        result = "C-" + result;
      }
      if (msg.alt) {
        result = "A-" + result;
      }
      if (msg.meta) {
        result = "M-" + result;
      }
      if (msg.ctrl || msg.alt || msg.meta || keyCodes[msg.code]) {
        result = "<" + result + ">";
      }
      return result;
    },
    getLocalKeyCode: function(code, ctrl, shift, alt, meta) {
      var result;
      result = keyIdentifier[code];
      if (util.getPlatform() === "Windows" || util.getPlatform() === "Linux") {
        if (g.util.getLang() === "ja") {
          if (shift) {
            if (shiftWinKeyIdentifier_ja[code] != null) {
              result = shiftWinKeyIdentifier_ja[code];
            }
          } else {
            if (winKeyIdentifier_ja[code] != null) {
              result = winKeyIdentifier_ja[code];
            }
          }
        } else {
          if (shift) {
            if (shiftWinKeyIdentifier_us[code] != null) {
              result = shiftWinKeyIdentifier_us[code];
            }
          } else {
            if (winKeyIdentifier_us[code] != null) {
              result = winKeyIdentifier_us[code];
            }
          }
        }
      }
      if ((result != null) && this.isAlphabet(result)) {
        if (shift) {
          result = result.toUpperCase();
        } else {
          result = result.toLowerCase();
        }
      }
      return result;
    }
  };
}).call(this);

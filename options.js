(function() {
  var escChars, g, initCheckBox, initDropDown, initInputNumber, initInputText, onSettings, setSetting, settings, updateKeyMappingList;
  g = this;
  settings = null;
  setSetting = function(name, val, response) {
    return chrome.extension.sendRequest({
      command: "Settings",
      type: "set",
      name: name,
      value: val
    });
  };
  escChars = function(str) {
    return str.replace("<", "&lt;").replace(">", "&gt;").replace(" ", "&nbsp;");
  };
  updateKeyMappingList = function() {
    var com, curMap, key, map, url, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
    curMap = $('#keyMappingList');
    curMap.append($('<div />').html('<h3>Normal Mode Mapping</h3>'));
    _ref = settings.keyMappingNormal;
    for (key in _ref) {
      com = _ref[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Insert Mode Mapping</h3>'));
    _ref2 = settings.keyMappingInsert;
    for (key in _ref2) {
      com = _ref2[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Command Aliases</h3>'));
    _ref3 = settings.aliases;
    for (key in _ref3) {
      com = _ref3[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h2>PageCmd Mapping</h2>'));
    _ref4 = settings.pageMap;
    _results = [];
    for (url in _ref4) {
      map = _ref4[url];
      curMap.append($('<div />').html("<h3>" + url + "</h3>"));
      curMap.append($('<div />').html('<h3>Normal Mode Mapping</h3>'));
      _ref5 = map.nmap;
      for (key in _ref5) {
        com = _ref5[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Insert Mode Mapping</h3>'));
      _ref6 = map.imap;
      for (key in _ref6) {
        com = _ref6[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Command Aliases</h3>'));
      _results.push((function() {
        var _ref7, _results2;
        _ref7 = map.alias;
        _results2 = [];
        for (key in _ref7) {
          com = _ref7[key];
          _results2.push(curMap.append($('<div />').html(escChars(key + " : " + escChars(com)))));
        }
        return _results2;
      })());
    }
    return _results;
  };
  initInputText = function(name) {
    return $('#' + name).val(settings[name]).keyup(function() {
      return setSetting(name, $(this).val());
    });
  };
  initInputNumber = function(name) {
    return $('#' + name).val(settings[name]).keyup(function() {
      return setSetting(name, parseInt($(this).val()));
    }).click(function() {
      return setSetting(name, parseInt($(this).val()));
    }).mousewheel(function() {
      return setSetting(name, parseInt($(this).val()));
    });
  };
  initCheckBox = function(name) {
    return $('#' + name).attr('checked', settings[name]).change(function() {
      return setSetting(name, $(this).is(':checked'));
    });
  };
  initDropDown = function(name) {
    return $('#' + name).val(settings[name]).change(function() {
      return setSetting(name, $(this).val());
    });
  };
  onSettings = function(msg) {
    if (msg.name === "all") {
      settings = msg.value;
    }
    initInputNumber("scrollPixelCount");
    initInputNumber("commandWaitTimeOut");
    initInputNumber("minIncSearch");
    initInputNumber("commandBoxWidth");
    initInputText("fModeAvailableKeys");
    initCheckBox("disableAutoFocus");
    initCheckBox("smoothScroll");
    initCheckBox("wrapSearch");
    initCheckBox("incSearch");
    initCheckBox("ignoreCase");
    initDropDown("commandBoxAlign");
    $('[name="newTabPage"][value="' + settings.defaultNewTab + '"]').attr('checked', true);
    $('[name="newTabPage"]').change(function() {
      if ($(this).is(':checked')) {
        return setSetting("defaultNewTab", $(this).val());
      }
    });
    $('#ignoredUrls').val(settings.ignoredUrls.join('\n'));
    $('#ignoredUrlsButton').click(function() {
      return setSetting("ignoredUrls", $('#ignoredUrls').val().split('\n'));
    });
    $('#keyMapping').val(settings.keyMappingAndAliases);
    $('#keyMappingButton').click(function() {
      return setSetting("keyMappingAndAliases", $('#keyMapping').val());
    });
    return updateKeyMappingList();
  };
  $(document).ready(function() {
    return chrome.extension.sendRequest({
      command: "Settings",
      type: "get",
      name: "all"
    }, onSettings);
  });
  $(document).ready(function() {
    $('ul.navbar li:first').addClass('navbar-item-selected').show();
    $('#page-container > div').hide();
    $('#general').show();
    return $('ul.navbar li:not(.navbar-item-separator)').click(function() {
      var tab;
      $('ul.navbar li').removeClass('navbar-item-selected');
      $(this).addClass('navbar-item-selected');
      $('#page-container > div').hide();
      tab = $(this).find('a').attr('href');
      $(tab).fadeIn(200);
      return false;
    });
  });
}).call(this);

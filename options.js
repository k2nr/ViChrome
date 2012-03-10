(function() {
  var escChars, g, initCheckBox, initDropDown, initInputNumber, initInputText, onSettings, setSetting, settings, updateKeyMappingList;

  if (this.vichrome == null) this.vichrome = {};

  g = this.vichrome;

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
    var com, curMap, key, map, url, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results;
    curMap = $('#keyMappingList');
    curMap.append($('<div />').html('<h3>Normal Mode Mapping (nmap)</h3>'));
    _ref = settings.keyMappingNormal;
    for (key in _ref) {
      com = _ref[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Insert Mode Mapping (imap)</h3>'));
    _ref2 = settings.keyMappingInsert;
    for (key in _ref2) {
      com = _ref2[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Search/Command Mode Mapping (cmap)</h3>'));
    _ref3 = settings.keyMappingCommand;
    for (key in _ref3) {
      com = _ref3[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Emergency Mode Mapping (emap)</h3>'));
    _ref4 = settings.keyMappingEmergency;
    for (key in _ref4) {
      com = _ref4[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h3>Command Aliases (alias)</h3>'));
    _ref5 = settings.aliases;
    for (key in _ref5) {
      com = _ref5[key];
      curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
    }
    curMap.append($('<div />').html('<h2>PageCmd Mapping</h2>'));
    _ref6 = settings.pageMap;
    _results = [];
    for (url in _ref6) {
      map = _ref6[url];
      curMap.append($('<div />').html("<h3>" + url + "</h3>"));
      curMap.append($('<div />').html('<h3>Normal Mode Mapping</h3>'));
      _ref7 = map.nmap;
      for (key in _ref7) {
        com = _ref7[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Insert Mode Mapping</h3>'));
      _ref8 = map.imap;
      for (key in _ref8) {
        com = _ref8[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Search/Command Mode Mapping</h3>'));
      _ref9 = map.cmap;
      for (key in _ref9) {
        com = _ref9[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Emergency Mode Mapping</h3>'));
      _ref10 = map.emap;
      for (key in _ref10) {
        com = _ref10[key];
        curMap.append($('<div />').html(escChars(key + " : " + escChars(com))));
      }
      curMap.append($('<div />').html('<h3>Command Aliases</h3>'));
      _results.push((function() {
        var _ref11, _results2;
        _ref11 = map.alias;
        _results2 = [];
        for (key in _ref11) {
          com = _ref11[key];
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
    if (msg.name === "all") settings = msg.value;
    initInputNumber("scrollPixelCount");
    initInputNumber("commandWaitTimeOut");
    initInputNumber("minIncSearch");
    initInputNumber("commandBoxWidth");
    initInputNumber("minMigemoLength");
    initInputNumber("hintFontSize");
    initInputText("fModeAvailableKeys");
    initCheckBox("disableAutoFocus");
    initCheckBox("smoothScroll");
    initCheckBox("enableCompletion");
    initCheckBox("wrapSearch");
    initCheckBox("incSearch");
    initCheckBox("ignoreCase");
    initCheckBox("useMigemo");
    initCheckBox("fModeIgnoreCase");
    initCheckBox("notifyUpdateSucceeded");
    initCheckBox("useFModeAnimation");
    initDropDown("commandBoxAlign");
    initDropDown("searchEngine");
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
    var page;
    $('#page-container > div').hide();
    page = /#.*$/.exec(window.location.href);
    if (page != null) {
      page = page[0];
    } else {
      page = '#general';
    }
    $("ul.navbar li:has(a[href=\"" + page + "\"])").addClass('navbar-item-selected').show();
    $(page).show();
    console.log(page);
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

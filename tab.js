
var TabHistory = function() {
    var logger = vichrome.log.logger,
        closeHistStack = [],
        openTabs = {};

    function findOpenTabItem( tabId ) {
        var i, hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in openTabs ) if( hasOwnPrp.call( openTabs, i ) ) {
            if( openTabs[i][tabId] ) {
                return openTabs[i][tabId];
            }
        }
    }

    function popOpenTabItem( tabId ) {
        var i, result, hasOwnPrp  = Object.prototype.hasOwnProperty;

        for ( i in openTabs ) if( hasOwnPrp.call( openTabs, i ) ) {
            if( openTabs[i][tabId] ) {
                result = openTabs[i][tabId];
                openTabs[i][tabId] = undefined;
                return result;
            }
        }
    }

    function addOpenTabItem( tab, history ) {
        openTabs[tab.windowId][tab.id] = {};
        openTabs[tab.windowId][tab.id].tab = tab;
        if( history ) {
            openTabs[tab.windowId][tab.id].history = history;
        } else {
            openTabs[tab.windowId][tab.id].history = [];
            openTabs[tab.windowId][tab.id].history.push( tab.url );
        }
    }

    function initTabHist(winId) {
        chrome.windows.getAll( {populate : true}, function(wins) {
            var i, j, tabLen, winLen=wins.length, tab, win;

            for(i=0; i < winLen; i++) {
                win = wins[i];
                tabLen = win.tabs.length;
                openTabs[win.id] = {};
                for(j=0; j < tabLen; j++) {
                    tab = win.tabs[j];
                    addOpenTabItem( tab );
                }
            }
        });
    }

    function setupListeners() {
        chrome.tabs.onRemoved.addListener( function (tabId, info) {
            logger.d("tab removed id:" + tabId);
            if( info.isWindowClosing ) {
                return;
            }

            var item = popOpenTabItem( tabId );

            if( item ) {
                closeHistStack.push( item );
                if( closeHistStack.length > 10 ) {
                    closeHistStack.shift();
                }
                return;
            }
        });

        chrome.tabs.onCreated.addListener( function (tab) {
            logger.d("tab created id:" + tab.id);
            addOpenTabItem( tab );
        });

        chrome.tabs.onAttached.addListener( function (tabId, aInfo) {
            logger.d("tab attached tab:" + tabId + " -> win:" + aInfo.newWindowId);
            chrome.tabs.get( tabId, function(tab) {
                addOpenTabItem( tab );
            });
        });

        chrome.tabs.onDetached.addListener( function (tabId, dInfo) {
            logger.d("tab detached tab:" + tabId + " <- win:" + dInfo.oldWindowId);
            popOpenTabItem( tabId );
            //delete openTabs[dInfo.oldWindowId][tabId];
        });

        chrome.tabs.onUpdated.addListener( function(tabId, info, tab) {
            var target = openTabs[tab.windowId][tabId];
            if( info.url ) {
                target.tab.url = info.url;
                target.history.push( info.url );
            }
            if( info.pinned ) {
                target.tab.pinned = info.pinned;
            }
        });

        chrome.windows.onCreated.addListener( function (win) {
            logger.d("win created id:" + win.id);
            openTabs[win.id] = {};
        });

        chrome.windows.onRemoved.addListener( function (winId) {
            delete openTabs[winId];
        });
    }

    this.init = function() {
        initTabHist();
        setupListeners();
    };

    this.restoreLastClosedTab = function() {
        var item = closeHistStack.pop(), opt;

        while( item && !openTabs[item.tab.windowId] ) {
            item = closeHistStack.pop();
        }
        if( !item ) { return; }

        chrome.windows.update( item.tab.windowId, { focused : true } );

        opt = { windowId : item.tab.windowId, url : item.tab.url };
        chrome.tabs.create( opt, function(tab) {
//            chrome.tabs.sendRequest( tab.id, {command : "UpdateHistoryState",
//                                              args    : item.history} );
        });
    };
};


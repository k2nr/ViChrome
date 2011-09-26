vichrome.log  = {};
vichrome.util = {};

vichrome.log.level = {
        DEBUG   : 1,
        WARNING : 2,
        ERROR   : 3,
        FATAL   : 4,
        NONE    : 5
};

// TODO:change to ERROR for release version!
vichrome.log.VICHROME_LOG_LEVEL = vichrome.log.level.ERROR;

vichrome.log.logger = (function(){
    var log   = vichrome.log,
        level = vichrome.log.level;

    function _log(a, o) {
        if(o) {
            console.log( "vichrome:" + a + " :%o", o );
        } else {
            console.log( "vichrome:" + a );
        }
    }

    return {
        d : function(a, o) {
            if(log.VICHROME_LOG_LEVEL <= level.DEBUG) {
                _log(a, o);
            }
        },

        w : function(a, o) {
            if(log.VICHROME_LOG_LEVEL <= level.WARNING) {
                _log(a, o);
            }
        },

        e : function(a, o) {
            if(log.VICHROME_LOG_LEVEL <= level.ERROR) {
                _log(a, o);
            }
        },

        f : function(a, o) {
            if(log.VICHROME_LOG_LEVEL <= level.FATAL) {
                _log(a, o);
            }
        }
    };
}());



vichrome.util.isEditable = function(target) {
    var ignoreList = ["TEXTAREA"],
        editableList = ["TEXT",
                        "PASSWORD",
                        "NUMBER",
                        "SEARCH",
                        "TEL",
                        "URL",
                        "EMAIL",
                        "TIME",
                        "DATETIME",
                        "DATETIME-LOCAL",
                        "DEATE",
                        "WEEK",
                        "COLOR"];

    if ( target.isContentEditable ) {
        return true;
    }

    if( target.nodeName && target.nodeName.toUpperCase() === "INPUT" ) {
        if( editableList.indexOf( target.type.toUpperCase() ) >= 0 ) {
            return true;
        }
    }

    if( ignoreList.indexOf(target.nodeName) >= 0 ){
        return true;
    }

    return false;
};

vichrome.util.getPlatform = function() {
    if (navigator.userAgent.indexOf("Mac") !== -1) {
        return "Mac";
    } else if (navigator.userAgent.indexOf("Linux") !== -1) {
        return "Linux";
    } else if (navigator.userAgent.indexOf("Win")){
        return "Windows";
    } else {
        return "";
    }
};

vichrome.util.dispatchKeyEvent = function(target, identifier, primary, shift, alt) {
    var e = document.createEvent("KeyboardEvent"),
        modifier ="";

    if( primary ) {
        modifier += "Meta ";
    }
    if( shift ) {
        modifier += "Shift ";
    }
    if( alt ) {
        modifier += "Alt";
    }

    e.initKeyboardEvent("keydown", true, true, window, identifier, 0x00, modifier, true );

    target.dispatchEvent(e);
};

vichrome.util.dispatchMouseClickEvent = function(target, primary, shift, alt){
    var e = document.createEvent("MouseEvents"),
        secondary = false,
        ctrl, meta;

    if( !target || !target.dispatchEvent ) {
        vichrome.log.logger.e("target is invalid");
        return false;
    }

    switch( vichrome.util.getPlatform() ) {
        case "Mac":
            meta = primary;
            ctrl = secondary;
            break;
        case "Linux":
        case "Windows":
            meta = secondary;
            ctrl = primary;
            break;
        default:
            meta = secondary;
            ctrl = primary;
            break;
    }

    e.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, ctrl, alt, shift, meta, 0, null);

    target.dispatchEvent(e);

    return true;
}

vichrome.util.benchmark = function(cb, text) {
    function getCurrentTime() {
        return new Date().getTime();
    }

    if( text == undefined ) text="";

    var start = getCurrentTime();
    cb();
    vichrome.log.logger.d(text+"::benchmark result:" + (getCurrentTime() - start) + "ms" );
};


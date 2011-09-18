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
vichrome.log.VICHROME_LOG_LEVEL = vichrome.log.level.DEBUG;

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


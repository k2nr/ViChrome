
var Logger = {
    DEBUG   : 1,
    WARNING : 2,
    ERROR   : 3,
    FATAL   : 4,
    NONE    : 5,

    __log : function(a, o) {
        if(o)
            console.log( "vichrome:" + a + " :%o", o );
        else
            console.log( "vichrome:" + a );
    },

    d : function(a, o) {
        if(VICHROME_LOG_LEVEL >= Logger.DEBUG)
            this.__log(a, o);
    },

    w : function(a, o) {
        if(VICHROME_LOG_LEVEL >= Logger.WARNING)
            this.__log(a, o);
    },

    e : function(a, o) {
        if(VICHROME_LOG_LEVEL >= Logger.ERROR)
            this.__log(a, o);
    },

    f : function(a, o) {
        if(VICHROME_LOG_LEVEL >= Logger.FATAL)
            this.__log(a, o);
    }

};

VICHROME_LOG_LEVEL = Logger.DEBUG;


//--------------------------------------------------------------------
// Useful assertions.
// Created 2006-07-09 by Louis Thomas

Assert={};
Require=Assert;

Assert.fail=function(sMessage) {
    throw {
        description: "AssertionFailure: "+sMessage+"\n"+Assert.getStackTrace(),
        error: new Error()
    };
};

Assert.formatValue=function(value) {
    if ("string"==typeof value) {
        return "\""+value+"\"";
    } else {
        return ""+value;
    }
};

Assert.buildMessageAndFail=function(sRel, left, sLeft, right, /*optional*/sRight) {
    if ("undefined"==typeof sRight) {
        Assert.fail("Expected "+sLeft+" "+sRel+" "+Assert.formatValue(right)+", instead "+sLeft+" == "+Assert.formatValue(left)+".");
    } else {
        Assert.fail("Expected "+sLeft+" "+sRel+" "+sRight+", instead "+sLeft+" == "+Assert.formatValue(left)+" and "+sRight+" == "+Assert.formatValue(right)+".");
    }
};

// BTW, it's impossible to create Assert.isDefined, because if the
// variable is undefined, an exception will be pre-emptively thrown
// during the attempt to make the method call

Assert.statementNeverExecuted=function() {
    Assert.fail("Expected statement never executed.");
};

Assert.valueNeverOccurs=function(value, sValue) {
    Assert.fail("Expected "+sValue+" == "+Assert.formatValue(value)+" never occurs.");
};

Assert.eq=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left==right)) {
        Assert.buildMessageAndFail("==", left, sLeft, right, sRight);
    }
};
Assert.neq=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left!=right)) {
        Assert.buildMessageAndFail("!=", left, sLeft, right, sRight);
    }
};

Assert.gt=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left>right)) {
        Assert.buildMessageAndFail(">", left, sLeft, right, sRight);
    }
};
Assert.geq=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left>=right)) {
        Assert.buildMessageAndFail(">=", left, sLeft, right, sRight);
    }
};
Assert.lt=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left<right)) {
        Assert.buildMessageAndFail("<", left, sLeft, right, sRight);
    }
};
Assert.leq=function(left, sLeft, right, /*optional*/sRight) {
    if (!(left<=right)) {
        Assert.buildMessageAndFail("<=", left, sLeft, right, sRight);
    }
};

Assert.neqNull=function(value, /*optional*/sValue) { Assert.neq(value, sValue, null); };
Assert.eqNull=function(value, /*optional*/sValue) { Assert.eq(value, sValue, null); };
Assert.gtZero=function(value, /*optional*/sValue) { Assert.gt(value, sValue, 0); };
Assert.geqZero=function(value, /*optional*/sValue) { Assert.geq(value, sValue, 0); };
Assert.ltZero=function(value, /*optional*/sValue) { Assert.lt(value, sValue, 0); };
Assert.leqZero=function(value, /*optional*/sValue) { Assert.leq(value, sValue, 0); };

Assert.isString=function(value, /*optional*/sValue) {
    if ("string"!=typeof value) {
        Assert.buildMessageAndFail("==", typeof value, "typeof "+sValue, "string");
    }
};

Assert.notEmpty=function(value, /*optional*/sValue) {
    Assert.isString(value, sValue);
    if (0==value.length) {
        Assert.buildMessageAndFail(">", value.length, sValue+".length", 0);
    }
};

Assert.stringContains=function(sLong, sShort) {
    Assert.isString(sLong, "sLong");
    Assert.notEmpty(sShort, "sShort");
    if (-1==sLong.indexOf(sShort)) {
        Assert.fail("Expected string \""+sLong+"\" contains string \""+sShort+"\".");
    }
};

Assert.instanceOf=function(obj, sObj, type, sType) {
    if (!(obj instanceof type)) {
        if ("undefined"==typeof sType) {
            sType="name" in type?type.name:type;
        }
        var sObjType=typeof obj;
        if ("object"==sObjType) {
            if (null==obj) {
                sObjType="(null)";
            } else if ("constructor" in obj) {
                if ("name" in obj.constructor) {
                    sObjType=obj.constructor.name;
                } else {
                    sObjType=obj.constructor.toString();
                    var m=sObjType.match(/function\s*((?:\w+\s*\.\s*)*\w+)\s*\(/i);
                    if (null!=m) {
                        sObjType=m[1];
                    }
                    sObjType=sObjType.replace(/\s*/g, "");
                }
            }
        }
        WScript.Echo("d");
        Assert.fail("Expected "+sObj+" instance of "+sType+", instead "+sObj+" instance of "+sObjType+".");
    }
};
//####################################################################

Assert.getStackTrace=function() {
    var sStackTrace="";

    var key;
    var visitedFrames=[];

    var frame=Assert.getStackTrace.caller;
    while (true) {
        sStackTrace+="    at "+("name_" in frame?frame.name_:"(anonymous)")+"\n";
        for (key in visitedFrames) {
            if (visitedFrames[key]===frame) {
                sStackTrace+="    ...(recursed)...\n";
                return sStackTrace;
            }
        }
        visitedFrames.push(frame);
        frame=frame.caller;
        if (null==frame) {
            sStackTrace+="    at (anonymous)\n";
            return sStackTrace;
        }
    }
};

//--------------------------------------------------------------------
/** Set the function names for all function properties on a given
 * object. Not recursive. */
Assert.fixupMethodNames=function(obj, sClassName) {
    function fixup() {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] instanceof Function) {
                obj[key].name_=sClassName+"."+key;
            }
        }
    }
    fixup();
    if ("prototype" in obj) {
        obj=obj.prototype;
        fixup();
    }
};

Assert.fixupMethodNames(Assert, "Assert");

/*

Assert.isNumber        //computing methods
Assert.isNotNumber

Assert.isEqual        //comparing methods
Assert.isNotEqual

*/

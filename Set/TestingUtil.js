//--------------------------------------------------------------------
// Testing utilities
// Created 2006-07-09 by Louis Thomas

TestingUtil={};

//--------------------------------------------------------------------
TestingUtil.test=function(obj) {
    var key;
    var nTotal=0;
    var nSucceeded=0;
    var nFailed=0;
    for (key in obj) {
        if (null!=key.match(/test.*/) && obj[key] instanceof Function) {
            nTotal++;
            try {
                obj[key].call(obj);
                nSucceeded++;
            } catch (e) {
                WScript.Echo("---- "+("name_" in obj[key]?obj[key].name_:key)+" failed: ----");
                WScript.Echo(e.description);
                if ("stack" in e.error) {
                    WScript.Echo(e.error.stack);
                }
                nFailed++;
            }
        }
    }
    if (nTotal==nSucceeded) {
        WScript.Echo("---- All "+nTotal+" tests succeeded. ----");
        return true;
    } else {
        WScript.Echo("---- Some tests failed. Out of "+nTotal+" tests, "+nSucceeded+" succeeded and "+nFailed+" failed. ----");
        return false;
    }
};

//--------------------------------------------------------------------
/** Dumps the properties of the given object.
 * The 'constructor' property is not processed for children of
 * function objects and children of a 'constructor' property.
 * Inherrited properties will be prefixed by "@".
 * Un-enumerable properties will be prefixed by "%". (We guess which
 * un-enumerable properties exist.)
 * @param obj object to dump.
 * @param sName name to precede the dump
 * @param bRecurse [optional, default=true] true if member objects
 * should be dumped.
 * @param sPrefix [optional, default=""] string to print in front
 * of each line. */
TestingUtil.dumpObj=function (obj, /*optional*/sName, /*optional*/bRecurse, /*optional*/sPrefix) {

    // provide defaults for optional params
    if ("undefined"==typeof sName) {
        sName="(an object)";
    }
    if ("undefined"==typeof sPrefix) {
        sPrefix="";
    }
    if ("undefined"==typeof bRecurse) {
        bRecurse=true;
    }

    if ("object"!=typeof obj && "function"!=typeof obj) {
        WScript.Echo(sPrefix+sName+": (Not an object! Type:"+(typeof obj)+")");
    } else if (null==obj) {
        WScript.Echo(sPrefix+sName+": (null)");
    } else {
        WScript.Echo(sPrefix+sName+":");
        dumpObjImpl(obj, bRecurse, sPrefix, false);
    }
    return;

    //----------------------------------------------------------------
    function printKey(obj, sKey, bRecurse, sPrefix, sPrefix2, bSkipCtor, bHidden) {
        var sType=typeof obj[sKey];
        var sIntPrefix="";
        if (("hasOwnProperty" in obj) && !obj.hasOwnProperty(sKey)) {
            sIntPrefix+="@";
        }
        if (bHidden) {
            sIntPrefix+="%";
        }
        switch (sType) {

        case "undefined":
        // don't print this property
            bRecurse=false;
            break;

        case "function":
            var sFunc=obj[sKey].toString();
            var rgMatches=sFunc.match(/function\s*((?:\w+\s*\.\s*)*\w+)\s*\(/i);
            var sFuncName;
            if (null==rgMatches) {
                sFuncName=sFunc;
            } else {
                sFuncName=rgMatches[1].replace(/\s*/g, "");
            }
            WScript.Echo(sPrefix+sIntPrefix+sKey+"=["+sType+"] "+sFuncName);
            bSkipCtor=true;
            break;

        case "string":
            WScript.Echo(sPrefix+sIntPrefix+sKey+"=["+sType+"] \""+obj[sKey]+"\"");
            bRecurse=false; // literals can't have expandos
            break;

        case "number":
        case "boolean":
            WScript.Echo(sPrefix+sIntPrefix+sKey+"=["+sType+"] "+obj[sKey]);
            bRecurse=false; // literals can't have expandos
            break;

        case "object":
            if (null==obj[sKey]) {
                WScript.Echo(sPrefix+sIntPrefix+sKey+"=null");
                bRecurse=false;
            } else {

                WScript.Echo(sPrefix+sIntPrefix+sKey+"=["+sType+"]");
            }
            break;

        default:
            throw new Error(-1, "unknown type '"+sType+"'.");
        }
        if (bRecurse) {
            dumpObjImpl(obj[sKey], bRecurse, sPrefix2, bSkipCtor);
        }
    }

    //----------------------------------------------------------------
    function dumpObjImpl(obj, bRecurse, sPrefix, bSkipCtor) {

        var rgKnownProps=new Array(
        // skip the dynamic properties, because of possibility of unbounded recursion
        //"arguments", "callee", "caller",
            "constructor", "description", "E", "global",
            "ignoreCase", "index", "Infinity", "input",
            "lastIndex", "leftContext", "length", "lastMatch", "lastParen",
            "LN2", "LN10", "LOG2E", "LOG10E", "MAX_VALUE", "message",
            "MIN_VALUE", "multiline", "NaN", "name", "NEGATIVE_INFINITY",
            "number", "PI", "POSITIVE_INFINITY",
            "prototype", "source", "SQRT1_2", "SQRT_2", "undefined");

        // first, see which of the un-enumerable props we have
        var rgProps=new Array();
        var nIndex;
        for (nIndex=0; nIndex<rgKnownProps.length; nIndex++) {
            if (rgKnownProps[nIndex] in obj) {
                rgProps.push(rgKnownProps[nIndex]);
            }
        }

        // second, see which enumerable props we have
        var rgProps2=new Array();
        var sKey;
        for (sKey in obj) {
            rgProps2.push(sKey);

            // remove enumerable props from un-enumerable props
            for (nIndex=0; nIndex<rgProps.length; nIndex++) {
                if (sKey==rgProps[nIndex]) {
                    rgProps.splice(nIndex, 1);
                    break;
                }
            }
        }

        // combine the lists
        var nHiddenCount=rgProps.length;
        var bHidden;
        rgProps=rgProps.concat(rgProps2);

        // print each element
        var sPrefix1=sPrefix+"|---";
        var sPrefix2=sPrefix+"|   ";
        for (nIndex=0; nIndex<rgProps.length; nIndex++) {
            bHidden=nIndex<nHiddenCount;
            if (nIndex+1==rgProps.length) {
                sPrefix1=sPrefix+"\\---";
                sPrefix2=sPrefix+"    ";
            }
            if ("constructor"!=rgProps[nIndex]) {
                printKey(obj, rgProps[nIndex], bRecurse, sPrefix1, sPrefix2, bSkipCtor, bHidden);
            } else if (false==bSkipCtor) {
                printKey(obj, "constructor", bRecurse, sPrefix1, sPrefix2, true, bHidden);
            } else {
                //WScript.Echo("skip ctor"); // skipped inside functions and ctors
            }
        }
    }
};

Assert.fixupMethodNames(TestingUtil, "TestingUtil");


// Simple namespacing
utils = {};

//------------------------------------------------------------------------------
utils.add_defaults = function(default_values, values)
{
    for (let key in default_values)
    {
        if (default_values.hasOwnProperty(key)
            && ! (key in values))
        {
            values[key] = default_values[key];
        }
    }
    return values;
};

//------------------------------------------------------------------------------
utils.assert = function(condition, message)
{
    if (!condition)
    {
        message = "Assertion failure: " + message;
        console.log(message, condition);
        alert(message);
        throw message
    }
};

//------------------------------------------------------------------------------
utils.get_required_field = function(obj, field)
{
    if (!obj.hasOwnProperty(field))
    {
        throw "Required field \"" + field + "\" missing."
    }
    return obj[field];
};


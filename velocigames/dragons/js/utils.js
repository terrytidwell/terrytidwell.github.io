
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

//------------------------------------------------------------------------------
utils.ListenerList = class {

    //--------------------------------------------------------------------------
    constructor()
    {
        this.m_listeners = []
    }

    //--------------------------------------------------------------------------
    add(new_listener)
    {
        this.m_listeners.push(new_listener);
    }

    //--------------------------------------------------------------------------
    remove(old_listener)
    {
        this.m_listeners = this.m_listeners.filter(
            listener => listener === old_listener);
    }

    //--------------------------------------------------------------------------
    notify()
    {
        this.m_listeners.forEach(
            listener => listener(...arguments));
    }
};
var whenSysIdle=(function()
{
    var _lag, _timeout, _handler=undefined;

    var reset=    function()     {  window.clearTimeout(_timeout); (_timeout=window.setTimeout(whenIdle, _lag)); }
    var whenIdle= function()     { (_handler && _handler() && !(_handler=undefined)) || reset(); }
    var retval=   function(h, l) { (_handler=h) && ((_lag=l)>=0) && reset(); }

    document.onmousemove=reset;
    document.onkeypress= reset;

    return retval
});

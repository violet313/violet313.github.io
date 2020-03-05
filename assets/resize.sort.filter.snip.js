//////////////////////////////////////////////////////////////
//wraps everything to do with filtering on the pcComplete field
//////////////////////////////////////////////////////////////
var pcFilter=(function()
{
    var _min=0, _max=100; //current state of the filter limits in visible range
    var _timer=undefined;

    //invoked from the generic callback we provide to dataView
    //if row is padding; get the value from it's parent. that's it ;)
    var onFilter=function(i) {
        return ((!i._isPadding || (i=i._parent)) &&
            i.pcComplete >=_min && i.pcComplete <=_max) }


    //delay updating the grid UI till the user's stopped twiddling ;)
    var onChangeComplete=function() { _timer=undefined; _dataView.refresh(); }

    var onChange=function() { !_timer && (_timer=setTimeout(onChangeComplete,150)); }
    var reset=   function() {  _timer=clearTimeout(_timer); onChange(); }

    document.onmousemove=reset;
    document.onkeypress= reset;


    var initialiseUI=function()
    {
        var setMax=function(v){_max=v;uiMaxR.val(v);uiMaxN.val(v);(v<_min) && setMin(v) }
        var setMin=function(v){_min=v;uiMinR.val(v);uiMinN.val(v);(_max<v) && setMax(v) }

        var onMin= function() { setMin(parseInt($(this).val(),10)); onChange() }
        var onMax= function() { setMax(parseInt($(this).val(),10)); onChange() }

        var uiMinR=$("tr:first input[type=range]",  "#settings-ex-filter");
        var uiMinN=$("tr:first input[type=number]", "#settings-ex-filter");
        var uiMaxR=$("tr:last  input[type=range]",  "#settings-ex-filter");
        var uiMaxN=$("tr:last  input[type=number]", "#settings-ex-filter");

        uiMinR.on("change", onMin);
        uiMinN.on("change", onMin);
        uiMaxR.on("change", onMax);
        uiMaxN.on("change", onMax);
    }

    return {initialiseUI:initialiseUI, onFilter:onFilter};
})();

//////////////////////////////////////////////////////////////
//in-house comparer mod for coping with padding rows
//NB: falling-back to an id comparison makes the fn deterministic
//////////////////////////////////////////////////////////////
var comparer=(function()
{
    var _sortCol={field:"id"}, _sortAsc=true; //default sort state

    var compare=function(a,b)
    {
        var field=_sortCol.field;

        var tt=function() {
            return (a._parent.id == b._parent.id ?
                   (a._offset < b._offset)^_sortAsc :
                   (a._parent[field] != b._parent[field]  ?
                   (a._parent[field]  > b._parent[field]) :
                   (a._parent.id > b._parent.id))) }

        var tf=function() {
            return (a._parent.id == b.id ? _sortAsc :
                   (a._parent[field] != b[field]  ?
                   (a._parent[field]  > b[field]) :
                   (a._parent.id > b.id))) }

        var ft=function() {
            return (a.id == b._parent.id ? !_sortAsc :
                   (a[field] != b._parent[field]  ?
                   (a[field]  > b._parent[field]) :
                   (a.id > b._parent.id))) }

        var ff=function() {
            return (a[field] != b[field]  ?
                   (a[field]  > b[field]) :
                   (a.id > b.id)) }

        var comp={true:{true:tt, false:tf}, false:{true:ft, false:ff}};

        return [-1,1][0|comp[a._isPadding][b._isPadding]()];
    }

    var interface=
    {
        compare:      compare,
        getSortAsc:   function()    { return _sortAsc; },
        setInfos:     function(c,a) { _sortCol=c; _sortAsc=a; },
    };

    return interface;

})();

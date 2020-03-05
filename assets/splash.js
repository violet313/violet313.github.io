////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
window.V313=(function(V313, $, undefined){return V313;})(window.V313 || {}, jQuery);

V313.modSlickgridSPlash=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];
    var _removedlist={};

    var _attribs= //lets make a start on abstracting out all the DOM attribute literals
    {
        //belongs to slickgrid
        slickRow:           "slick-row",

        //ours
        grid:               "oh-my-griddy-aunt",
        tardis:             "tardis",  //for templates & hiding stuff. display is invisible *not none

        //ours, for styling away UI side-efects etc
        cell:               "dynamic-cell",
        cellDetailCtr:      "dynamic-cell-detail-ctr",
        cellDetailStatus:   "dynamic-cell-detail",
        cellDetailCalls:    "dynamic-cell-detail-calls",
        row:                "dynamic-row",
        rowYin:             "dynamic-row-yin",
        rowYang:            "dynamic-row-yang",
        rowParent:          "dynamic-row-parent",
        rowPadding:         "dynamic-row-padding",
        rowPaddingLast:     "dynamic-row-padding-last",
        rowPaddingInner:    "dynamic-row-padding-inner",
    };
    _attribs.classSelector=function(k) {return "."+this[k]};
    _attribs.idSelector=function(k)    {return "#"+this[k]};


    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var getPaddingItem=function(parent , offset)
    {
        var item={};

        for (var prop in _data[0]) item[prop]=null;
        item.id=parent.id+"."+offset;

        //additional hidden padding metadata fields
        item._isPadding=     true;
        item._parent=        parent;
        item._offset=        offset;

        return item;
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var addPadding=function(item)
    {
        if (item && (item._countPadding < item._sizePadding))
        {
            var rowParent=_dataView.getRowById(item.id);
            if (item._countPadding > 0) //remove css from current last padding row & replace with inner style
            {
                var cellNode=$(_grid.getCellNode(rowParent+item._countPadding, 0));
                cellNode.length && cellNode.parent().switchClass(_attribs.rowPaddingLast, _attribs.rowPaddingInner);
            }

            var idxParent=_dataView.getIdxById(item.id);
            for (var idx=1+item._countPadding; idx<=item._sizePadding; idx++)
                _dataView.insertItem(idxParent+idx,getPaddingItem(item,idx));
            item._countPadding=item._sizePadding;
        }
        return item;
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var trimPadding=function(item)
    {
        if (item && (item._countPadding > item._sizePadding))
        {
            for (var idx=item._countPadding; idx>item._sizePadding; idx--)
                _dataView.deleteItem(item.id+"."+idx);
            item._countPadding=item._sizePadding;

            if (item._countPadding > 0) //add css to new last padding row
            {
                var rowParent=_dataView.getRowById(item.id);
                var cellNode=$(_grid.getCellNode(rowParent+item._sizePadding, 0));
                cellNode.length && cellNode.parent().addClass(_attribs.rowPaddingLast);
            }
        }
        return item;
    }

    //////////////////////////////////////////////////////////////
    var adjustPadding=function(item) { addPadding(trimPadding(item)); } //TODO: items require a nice interface


    //////////////////////////////////////////////////////////////
    //this is project-specific. it knows how to calculate the padding requirements.
    //TODO: ...so there's some work do to here, abstracting a dev API call..
    //////////////////////////////////////////////////////////////
    var setCallsPaddingInfos=function(row, column)
    {
        var colOpts=_grid.getColumns()[column];
        var item=_dataView.getItem(row);

        if (colOpts && item && !item._isPadding)
        {
            //calculate padding requirements based on detail-content..
            var height=item._nodeDetail[colOpts.id].height();
            item._sizePadding=Math.ceil(height/_grid.getOptions().rowHeight);
            item._height=(item._sizePadding * _grid.getOptions().rowHeight);
            item._nodeDetail[colOpts.id].css({height:item._height});
        }
        else
            item=undefined;

        return item;
    }

    //////////////////////////////////////////////////////////////
    //this is project-specific. it knows how to calculate the padding requirements.
    //TODO: ...so there's some work do to here, abstracting a dev API call..
    //nothing to calculate; simply responds to height determined by calls column requirements
    //////////////////////////////////////////////////////////////
    var setStatusPaddingInfos=function(row, column)
    {
        var colOpts=_grid.getColumns()[column];
        var item=_dataView.getItem(row);

        if (colOpts && item && !item._isPadding)
        {
            item._height=item._sizePadding*_grid.getOptions().rowHeight;
            item._nodeDetail[colOpts.id].css({height:item._height});
        }
        else
            item=undefined;

        return item;
    }

    //////////////////////////////////////////////////////////////
    //in-house comparer mod for coping with padding rows
    //////////////////////////////////////////////////////////////
    var comparer=(function()
    {
        var _sortCol={field:"id"}, _sortAsc=true; //default sort state

        var compare=function(a,b)
        {
            var tt=function() {
              return (a._parent.id == b._parent.id ? ((a._offset < b._offset)^_sortAsc) :
                       (a._parent[_sortCol.field] == b._parent[_sortCol.field] ? (a._parent.id > b._parent.id) :
                         (a._parent[_sortCol.field] > b._parent[_sortCol.field])) ) }

            var tf=function() {
              return (a._parent.id == b.id ? _sortAsc :
                       (a._parent[_sortCol.field] == b[_sortCol.field] ? (a._parent.id > b.id) :
                         (a._parent[_sortCol.field] > b[_sortCol.field])) ) }

            var ft=function() {
              return (a.id == b._parent.id ? !_sortAsc :
                       (a[_sortCol.field] == b._parent[_sortCol.field] ? (a.id > b._parent.id) :
                         (a[_sortCol.field] > b._parent[_sortCol.field])) ) }

            var ff=function() {
              return (a[_sortCol.field] == b[_sortCol.field] ? (a.id > b.id) :
                       (a[_sortCol.field] > b[_sortCol.field]) ) }

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

    //////////////////////////////////////////////////////////////
    //delegate the sorting to DataView; which will sort the data using our
    //comparer callback; fire appropriate change events and update the grid
    //////////////////////////////////////////////////////////////
    var sort=function() { _dataView.sort(comparer.compare, comparer.getSortAsc()); }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
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

    //////////////////////////////////////////////////////////////
    //wraps everything to do with filtering on the population field
    //////////////////////////////////////////////////////////////
    var pcFilter=(function()
    {
        var _min=0, _max=100; //current state of the filter limits in visible range
        var _timer=undefined;

        //invoked from the generic callback we provide to dataView
        //if row is padding; get the value from it's parent. that's it ;)
        var onFilter=function(i) {return ((!i._isPadding || (i=i._parent)) && i.population >=_min && i.population <=_max);}


        //delay updating the grid UI till the user's stopped twiddling ;)
        var onChangeComplete= function() {  _timer=undefined; _dataView.refresh(); return true;/*done. consume the event*/ }
        var onChange=         function() { !_timer && (_timer=whenSysIdle())(onChangeComplete, 150); }


        var initialiseUI=function()
        {
            var setMax=function(v){_max=v;uiMaxR.val(v);uiMaxN.val(v);(v<_min) && setMin(v) }
            var setMin=function(v){_min=v;uiMinR.val(v);uiMinN.val(v);(_max<v) && setMax(v) }

            var onMin= function() { setMin(parseInt($(this).val(),10)); onChange() }
            var onMax= function() { setMax(parseInt($(this).val(),10)); onChange() }

            var uiMinR=$("tr:first input[type=range]",  "#settings-splash");
            var uiMinN=$("tr:first input[type=number]", "#settings-splash");
            var uiMaxR=$("tr:last  input[type=range]",  "#settings-splash");
            var uiMaxN=$("tr:last  input[type=number]", "#settings-splash");

            uiMinR.on("change", onMin);
            uiMinN.on("change", onMin);
            uiMaxR.on("change", onMax);
            uiMaxN.on("change", onMax);
        }

        return {initialiseUI:initialiseUI, onFilter:onFilter};
    })();

    //////////////////////////////////////////////////////////////
    //mutation objects r crazy to set up. lets keep it all enclojured
    //////////////////////////////////////////////////////////////
    var internationalObserver=(function()
    {
        var  MutationObserver=window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var _options={characterData:false, attributes:false, childList:true, subtree:true};
        var _handler;
        var _class;

        var onEachMutation=function(mutation){
            for (var i=0, node; (node=mutation.addedNodes.item(i)) && i < mutation.addedNodes.length; i++)
                node.classList.contains(_class) && _handler(node); }
        var onGotMutations=function(mutations) { _class && _handler && mutations.forEach(onEachMutation); }
        var _observer=MutationObserver && new MutationObserver(onGotMutations); //degrade gracefully to non optimised runtime

        return function(ctr,c,h) {_observer && _observer.observe(ctr,_options); _class=c; _handler=h; return _observer;}
    })();

    //////////////////////////////////////////////////////////////
    var onPostRender=function(index, element)
    {
        var arrId=this.id.split("-"); //uid: literal + record + field
        var item=_dataView.getItemById(parseInt(arrId[1],10));
        var cellNode=$(this).parent(); //could call _grid.getCellNode but really, why bother

        if (item && cellNode.length && !cellNode.hasClass(_attribs.cell))
        {
            cellNode.addClass(_attribs.cell);
            $(this).append(item._nodeDetail[arrId[2]].css({height: item._height}));
        }
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var onAddRow=function(row){$(_attribs.classSelector("cellDetailCtr"), row).each(onPostRender)}

    //////////////////////////////////////////////////////////////
    //our callback from dataView; just filtering on complete %age
    //////////////////////////////////////////////////////////////
    var onFilter=function(item) { return pcFilter.onFilter(item); }

    //////////////////////////////////////////////////////////////
    //fired when the user clicks on a column header
    //////////////////////////////////////////////////////////////
    var onRowSort=function(e,args) {comparer.setInfos(args.sortCol, args.sortAsc); sort();}

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var onColumnsResized=function(e, args)
    {
        _dataView.beginUpdate();

        var start=0;
        var end=_dataView.getLength();

        for (var row=start; row<=end; row++)
            for (key in _detailColumFormatters)
                adjustPadding(setStatusPaddingInfos(row, key));

        _dataView.endUpdate();
    }

    //////////////////////////////////////////////////////////////
    //we apply this stub to whichever cell requires expanded details
    //////////////////////////////////////////////////////////////
    var onRenderStatusDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding) throw "onRenderStatusDetailCell: wtf?";
        var html=[];
        html.push("<div>",item.statusText,"</div>"); //preserve unexpanded cell display value; with ellipses
        html.push("<div id='detail-", item.id, "-", columnDef.id, "' ");
        html.push("class='", _attribs.cellDetailCtr, "'></div>");
        return html.join("");
    }

    //////////////////////////////////////////////////////////////
    //we apply this stub to whichever cell requires expanded details
    //////////////////////////////////////////////////////////////
    var onRenderCallDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding) throw "onRenderCallDetailCell: wtf?";
        var html=[];
        html.push("<div>",item.calls[0],"</div>"); //preserve unexpanded cell display value; with ellipses
        html.push("<div id='detail-", item.id, "-", columnDef.id, "' ");
        html.push("class='", _attribs.cellDetailCtr, "'></div>");
        return html.join("");
    }

    //////////////////////////////////////////////////////////////
    //here we dynamically redefine a row that is about to be rendered.
    //we want to style away the bottom borders of our detail rows so that
    //they appear to be all one row. Note: this is all pre-processing.
    //////////////////////////////////////////////////////////////
    var _detailColumFormatters=
    {
        status: {formatter: onRenderStatusDetailCell, setPaddingInfos: setStatusPaddingInfos},
        calls:  {formatter: onRenderCallDetailCell,   setPaddingInfos: setCallsPaddingInfos},
    };

    var onRenderRow=function(row)
    {
        var item=_dataView.getItem(row);
        var cssClasses=[];
        var format={};

        //fix row stripeyness so it's determined relativistically &not by row index oddness.
        //We resort to codez because the rows are nested logically but not physically
        //&&& there are an indeterminate amount of padding rows ~> we cannot do this
        //using current css trix (; but pls knock urself out & prove me wrong ;)
        var itemPrevious=row && _dataView.getItem(row-1);
        var colourPrevious=(itemPrevious ? itemPrevious._colour : 1);


        if (!_grid) //grid is initialising..
            cssClasses.push(_attribs.row, ((item._colour=row%2) ? _attribs.rowYin : _attribs.rowYang));

        else if (item._isPadding==true)
        {
            //ensure padding has same stripe colour as parent.
            cssClasses.push(_attribs.row, (colourPrevious ? _attribs.rowYin : _attribs.rowYang));
            item._colour=(colourPrevious);

            //apply classes to identify padding rows, &also inner or last padding rows to avoid styling away the bottom border
            cssClasses.push(_attribs.rowPadding);
            cssClasses.push(item._offset==item._parent._sizePadding ? _attribs.rowPaddingLast : _attribs.rowPaddingInner);
        }
        else //not padding
        {
            //ensure parent has opposite stripe colour to previous parent.
            cssClasses.push((colourPrevious ? _attribs.rowYang : _attribs.rowYin));
            item._colour=colourPrevious^1;

            format.columns=_detailColumFormatters;
            cssClasses.push(_attribs.row, _attribs.rowParent); //&mark row as a parent (of it's padding children)
        }

        return (format.cssClasses=cssClasses.join(" ")) && format;
    };

    //////////////////////////////////////////////////////////////
    //shenzi attempt to prevent first column from being moved
    //////////////////////////////////////////////////////////////
    var onHeaderCellRendered= function(e, args)   { (args.column.id==="type") && args.node && args.node.classList.add("sticky"); }
    var onColumnsReordered=   function(e, args)   { $(".ui-sortable").sortable({cancel: ".sticky"}); }

    //////////////////////////////////////////////////////////////
    var _gridOptions={ enableColumnReorder:true, explicitInitialization:true };

    //////////////////////////////////////////////////////////////
    var _gridColumns=
    [
        {id: "type",       name: "Type",                field: "type",                 },
        {id: "calls",      name: "Calls(Max: last 5)",  field: "calls",      width:120 },
        {id: "population", name: "Population",          field: "population",           },
        {id: "status",     name: "Status",              field: "status",     width:100 },
        {id: "timestamp",  name: "Last heard",          field: "timestamp",  width:180 },
    ];

    //////////////////////////////////////////////////////////////
    for (var i=0; i<_gridColumns.length; i++) { _gridColumns[i]["sortable"]=_gridColumns[i]["defaultSortAsc"]=true }


    //////////////////////////////////////////////////////////////
    //(re)create the detail ctr node. this belongs to the dev & can be custom-styled as per
    //////////////////////////////////////////////////////////////
    var setCallsContent=function(item)
    {
        //lazy; in reality we need'nt necessarily be tearing these down all the time
        item._nodeDetail.calls && item._nodeDetail.calls.remove();

        var content=[];
        content.push("<div>");
        for (var i=0; i<item.calls.length; i++)
            content.push("<div><span>",item.calls[i],"</span></div>");
        content.push("</div>");

        //create a new detail ctr; drop in the list of calls; jquerify for convenience
        var ctrDetail=document.createElement("div");
        ctrDetail.id=item.id;
        ctrDetail.className=_attribs.cellDetailCalls;
        item._nodeDetail.calls=$(ctrDetail);
        item._nodeDetail.calls.append(content.join(""));
        $(_attribs.idSelector("tardis")).append(ctrDetail); //immediately put it in the DOM so we can get it's height

        var col=_grid.getColumnIndex("calls");
        setCallsPaddingInfos(_dataView.getRowById(item.id), col); //.. &now callibrate the detail
    }

    //////////////////////////////////////////////////////////////
    //(re)create the detail ctr node. this belongs to the dev & can be custom-styled as per
    //////////////////////////////////////////////////////////////
    var setStatusContent=function(item)
    {
        var getfirstchild=function(n) { return (n ? (n.nodeType!=1 ? getfirstchild(n.nextSibling) : n) : null); }
        var node;

        //lazy; in reality we need'nt necessarily be tearing these down all the time
        item._nodeDetail.status && (node=item._nodeDetail.status[0]) && node.parentNode && node.parentNode.removeChild(node);

        //make an inline svg from a template
        var template=getfirstchild(document.getElementById("tmpl-smartee").firstChild);
        var clone=template.cloneNode(true);
        var nodeDefs=clone.querySelector('defs');

        var svgNS=clone.namespaceURI;
        var gradient=$("radialGradient",clone)[0];
        gradient.id="grad-"+item.id;
        var status=(item.status==0 ? 100 : item.status*100/6);
        var hue=250-(2*status);
        var stops=
        [
            {offset:"0%",   "stop-color":"hsla("+hue+",  80%, 80%, 1.0)"},
            {offset:"40%",  "stop-color":"hsla("+hue+", 100%, 65%, 1.0)"},
            {offset:"110%", "stop-color":"hsla("+hue+", 100%, 50%, 1.0)"},
        ];

        for (var i=0;i<stops.length;i++)
        {
            var attrs=stops[i];
            var stop=document.createElementNS(svgNS,"stop");
            for (var attr in attrs) stop.setAttribute(attr,attrs[attr]);
            gradient.appendChild(stop);
        }
        $(".face",clone)[0].setAttribute("fill","url(#"+gradient.id+")");


        if (item.status==6)
        {
            var animate=document.createElementNS(svgNS,"animate");
            animate.setAttribute("attributeType","XML");
            animate.setAttribute("attributeName","ry");
            animate.setAttribute("values",   "40;  40;    1;   40;   40;    1;   40;  40");
            animate.setAttribute("keyTimes", " 0; 0.5; 0.51; 0.52; 0.53; 0.54; 0.55; 1.0");
            animate.setAttribute("begin", Math.round(Math.random()*10)+"s");
            animate.setAttribute("dur", "10s");
            animate.setAttribute("repeatCount", "indefinite");

            var eyes=$(".eye",clone);
            eyes[0].appendChild(animate);
            eyes[1].appendChild(animate.cloneNode(true));
        }

        var arrSmile=[], dataSmile={ M: [[120,280]], Q: [[200,230], [280,280]] };
        dataSmile.Q[0][1]+=(status);
        for (var key in dataSmile){arrSmile.push(key+dataSmile[key].map(function(n){return n.join()}).join(" "))};
        $(".smile",clone)[0].setAttribute("d", arrSmile.join(" "));


        //create a new detail ctr; drop in the svg; jquerify for convenience
        var ctrDetail=document.createElement("div");
        ctrDetail.id=item.id;
        ctrDetail.className=_attribs.cellDetailStatus;
        ctrDetail.appendChild(clone);
        item._nodeDetail.status=$(ctrDetail);
        var col=_grid.getColumnIndex("status");
        setStatusPaddingInfos(_dataView.getRowById(item.id), col); //.. &now callibrate the detail
    }

    //////////////////////////////////////////////////////////////
    //jquery onDocumentLoad
    //////////////////////////////////////////////////////////////
    $(function()
    {
        //initialise the data-model
        _dataView=new Slick.Data.DataView();
        _dataView.getItemMetadata=onRenderRow; //override the dataview callback with our own
        _dataView.setFilter(onFilter);
        _dataView.beginUpdate();
        _dataView.setItems(_data);
        _dataView.endUpdate();

        //initialise the grid
        _grid=new Slick.Grid(_attribs.idSelector("grid"), _dataView, _gridColumns, _gridOptions);

        _grid.onColumnsResized.subscribe(onColumnsResized);
        _grid.onSort.subscribe(onRowSort);

        //to make index column sticky; pure cosmetix; do ignore
        _grid.onHeaderCellRendered.subscribe(onHeaderCellRendered);
        _grid.onColumnsReordered.subscribe(onColumnsReordered);
        _grid.init();
        onColumnsReordered();

        //wire up model events to drive the grid per DataView requirements
        _dataView.onRowCountChanged.subscribe(function(){ _grid.updateRowCount();_grid.render(); });
        _dataView.onRowsChanged.subscribe(function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        sort(); //give the data an initial sort ~default is by id
        pcFilter.initialiseUI(); //kick-off our filter hooks into the UI

        //NB: or we could only do this on a sort or scroll event etc, &let it complete by having reapPadding() return true.
        internationalObserver(_grid.getCanvasNode(), _attribs.slickRow, onAddRow);

        _grid.resizeCanvas();
        $(window).resize(function() {_grid.resizeCanvas()});

        //lets go!
        V313.runTestData.start();

    });


    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var dataAdd=function(datum)
    {
        var item=
        {
            //additional hidden metadata fields
            _nodeDetail:        {status: null, calls:null}, //the DOM detail containers
            _sizePadding:       0,        //the required number of pading rows
            _countPadding:      0,        //the current number of pading rows
            _height:            0,        //the actual height in pixels of the detail field
            _isPadding:         false,
            _parent:            undefined,
            _offset:            0,        //each padding item is keyed by it's offset
            _colour:            0,        //bit of state so we can deal with row stripyness
        }

        for (var prop in datum) item[prop]=datum[prop];
        _dataView.addItem(item);
        setStatusContent(item);
        setCallsContent(item);
        addPadding(item);
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    dataUpdate=function(datum)
    {
        var item=_dataView.getItemById(datum.id);
        if (item)
        {
            for (var prop in datum) item[prop]=datum[prop];
            setStatusContent(item);
            setCallsContent(item);
            adjustPadding(item);
            _dataView.updateItem(item.id, item);
        }
        else dataAdd(datum)

        sort();

        return true;
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    dataRemove=function(id)
    {
        var item=_dataView.getItemById(id);
        if (item)
        {
            item._sizePadding=0;
            trimPadding(item);
            _dataView.deleteItem(item.id);
            sort();
        }

        return true;
    }

    var resize=function() { _grid.resizeCanvas(); }


    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var interface=
    {
        dataUpdate:             dataUpdate,
        dataInsert:             dataUpdate,
        dataRemove:             dataRemove,

        resize:                 resize,
    }
    return interface;
}
)();


//////////////////////////////////////////////////////////////
//archetypal calls of the wilds...
//////////////////////////////////////////////////////////////
V313.runTestData=(
function()
{
    var _countTics=0;
    var _time=0;
    var _data=[];
    var _timeout;

    var getOoooks=function()          { return (new Array(3+Math.round(Math.random()*3)).join("o"))+"k"; }
    var getCallDog=function()         { return "w"+(new Array(3+Math.round(Math.random()*3)).join("o"))+"f"; }
    var getCallPolitician=function()  { return "ba"+(new Array(2+Math.round(Math.random()*3)).join("-ah"))+"h"; }
    var getCallCrow=function()        { return "k"+(new Array(3+Math.round(Math.random()*3)).join("a"))+"rk"; }
    var getCallCat=function()         { return Math.round(Math.random()) ? "mia"+(new Array(3+Math.round(Math.random()*3)).join("o"))+"www" :
                                          "puuu"+(new Array(3+Math.round(Math.random()*5)).join("r"));}

    var getCallManager=function()
    {
        var calls=["any progress?", "gannt chart", "ducks in a row","agile", "scrum", "delegate", "wasn't there", "didn't do it"];
        return calls[Math.round(Math.random()*(calls.length-1))];
    }
    var getCallTrooper=function()
    {
        var calls=["move along", "nothing to see here", "these aren't the droids we're looking for", "open the blast-doors", "close the blast-doors"];
        return calls[Math.round(Math.random()*(calls.length-1))];
    }

    var getCallParrot=function()
    {
        var calls=["12.5 percent","pretty polly","hello sexy"];
        var x=archetypes.filter(function(e,i){return(e.population>Math.round(Math.random()*100));});
        return (x.length>0 ? x[Math.round(Math.random()*(x.length-1))].call() : calls[Math.round(Math.random()*(calls.length-1))]);
    }

    var getCallCoder=function()
    {
        var x=[],c=Math.round(Math.random()*7)+6;
        while (c--) x.push(Math.round(Math.random()));
        return x.join("");
    }

    var _states=["PROTO", "facing extinction", "endangered", "surviving", "stable", "burgeoning", "complete pest"];
    var getStatus=function(e)
    {
        switch(true)
        {
          case (e.population>75): return  6;
          case (e.population>40): return  5;
          case (e.population>20): return  4;
          case (e.population>10): return  3;
          case (e.population>5):  return  2;
          default:                return  (e.id>0)|0;
        }
    }

    var archetypes=
    [
        { archetype: "librarians"     , djin: 0.50 , population:0 , call:  getOoooks         },
        { archetype: "crows"          , djin: 0.50 , population:0 , call:  getCallCrow       },
        { archetype: "coders"         , djin: 0.50 , population:0 , call:  getCallCoder      },
        { archetype: "storm-troopers" , djin: 0.50 , population:0 , call:  getCallTrooper    },
        { archetype: "politicians"    , djin: 0.50 , population:0 , call:  getCallPolitician },
        { archetype: "managers"       , djin: 0.50 , population:0 , call:  getCallManager    },
        { archetype: "dogs"           , djin: 0.50 , population:0 , call:  getCallDog        },
        { archetype: "parrots"        , djin: 0.50 , population:0 , call:  getCallParrot     },
        { archetype: "cats"           , djin: 0.50 , population:0 , call:  getCallCat        },
    ];

    var spawn=function(i)
    {
        var e=archetypes[i];
        e.djin=(Math.random()*Math.pow(Math.sin((Math.PI)*i/archetypes.length),0.9));
        e.population=1+Math.round(15*Math.sin(Math.PI*i/archetypes.length)+15*e.djin);
        e.calls=[];
        e.id=i;
        return e;
    }

    var getDatum=function(e)
    {
        var sizeCalls=(e.population > 4 ? 4 : e.population-1);
       (e.calls=e.calls.slice(0,sizeCalls)).unshift(e.call());
        var datum=
        {
            id:                   e.id,
            type:                 e.archetype,
            population:           e.population,
            calls:                e.calls,
            status:               getStatus(e),
            statusText:           _states[getStatus(e)],
            timestamp:            new Date(_time+(_countTics*3600000*24)).toLocaleDateString(),
        };
        return datum;
    }

    var init=function()
    {
        var datetime=new Date();
        _time=datetime.getTime();
        for (var i=0; i<archetypes.length; i++) V313.modSlickgridSPlash.dataUpdate(getDatum(spawn(i)));
        clearInterval(_timeout); _timeout=setInterval(onTimeout, 3000);
    };

    var onTimeout=function()
    {
        _countTics++;
        for (var i=0; i<archetypes.length; i++)
        {
            var e=archetypes[i],dv,dw,dx,dy,dz;
            var djinX=Math.random(),djinY=Math.random(),djinZ=Math.random();
            var yz=Math.sin(Math.PI*Math.pow((e.population)/100,1+(e.djin)));
            var x=(e.population/100)*(1-Math.sin((Math.PI)*Math.pow((100-e.population)/100,(2+e.djin)/3)));

            (dv=!e.population&&(Math.random()<0.01))&&spawn(i); if(!e.population) continue;

            e.population-=(dw=(!(_countTics%(1+Math.floor(Math.exp(1/Math.sin(Math.PI*i/archetypes.length)))))))|0;
            e.population-=(dx=(e.djin&&dw&&djinX<x&&Math.round(e.population*Math.pow(e.population/100,2-e.djin))));
            e.population-=(dy=(e.djin&&djinY<(yz*Math.pow(e.population/100,1+(e.djin)))))|0;
            e.population+=(dz=(e.djin&&djinZ<yz))|0;

            dw &&(e.djin=(Math.random()*Math.pow(Math.sin((Math.PI)*i/archetypes.length),e.djin)));
            (dv||dw||dx||dy||dz)&&(e.population &&V313.modSlickgridSPlash.dataUpdate(getDatum(e))||V313.modSlickgridSPlash.dataRemove(e.id));
        }
    }

    var pause= function() { clearInterval(_timeout); }
    var resume=function() { _timeout=setInterval(onTimeout, 3000); V313.modSlickgridSPlash.resize(); }
    var start= function() { _timeout=setInterval(init, 1000); }


    return { start: start, pause: pause, resume:resume };

})();

//////////////////////////////////////////////////////////////
//done ;)


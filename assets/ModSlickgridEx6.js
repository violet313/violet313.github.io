////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
window.V313=(function(V313, $, undefined){return V313;})(window.V313 || {}, jQuery);

V313.modSlickgridEx6=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];
    var _removedlist={};

    var ReaperCacheSize=30; //defines the extent of *our cached items

    var _attribs= //lets make a start on abstracting out all the DOM attribute literals
    {
        //belongs to slickgrid
        slickRow:           "slick-row",

        //ours
        grid:               "grid-caching",
        tardis:             "tardis",  //for templates & hiding stuff.
        detailField:        "pcComplete",

        //ours, for styling away UI side-efects etc
        toggle:             "toggle",
        cell:               "dynamic-cell",
        cellDetailCtr:      "dynamic-cell-detail-ctr",
        cellDetail:         "dynamic-cell-detail",
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
    var logit=(function()
    {
        var _t0=new Date().getTime();
        var _uiLog; _bLogit=false;

        $(function()
        {
            $("input[type=checkbox]", "#log-control").on("change", function(){ _bLogit=$(this).is(":checked")});
        });

        var logger=function(msg)
        {
            _bLogit && $("#log").prepend(["<div>",(new Date().getTime()-_t0), ": ", msg,"</div>"].join(""));
        }
        return logger;
    })();

    //////////////////////////////////////////////////////////////
    //always reference columns by name so user can move 'em around
    //////////////////////////////////////////////////////////////
    var getIdxDetailCol=function() { return _grid.getColumnIndex(_attribs.detailField); }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var getPaddingItem=function(parent , offset)
    {
        var item={};

        for (var prop in _data[0]) item[prop]=null;
        item.id=parent.id+"."+offset;

        //additional hidden padding metadata fields
        item._collapsed=     true;
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
            if (item._countPadding > 0) //switch css on last padding row to inner style
            {
                var cellNode=$(_grid.getCellNode(rowParent+item._countPadding, 0));
                cellNode.length && cellNode.parent().switchClass
                    (_attribs.rowPaddingLast, _attribs.rowPaddingInner);
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
    //TODO: items require a nice interface
    //////////////////////////////////////////////////////////////
    var adjustPadding=function(item) { addPadding(trimPadding(item)); }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var revivePadding=function(item)
    {
        var row=_dataView.getRowById(item.id);

        _dataView.beginUpdate();

        setCellPaddingInfos(row, getIdxDetailCol());
        addPadding(item);
        _dataView.updateItem(item.id, item);

        _dataView.endUpdate();

        logit("revivePadding: revived id:"+item.id);
        return item;
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var reapPadding=function()
    {
        var range=_grid.getRenderedRange();

        _dataView.beginUpdate();

        for (var id in _removedlist)
        {
            var item=_removedlist[id];
            var row=_dataView.getRowById(item.id);

            logit("reapPadding: checking: id:"+item.id);

            if (item._collapsed)
            {
                delete _removedlist[id];
                logit("reapPadding: manually collapsed!  id:"+item.id);
            }
            //avoid imperial entanglementZ with slickgrid wheelmouse ios zombie workaround ting?!
            //&in any case stay well clear of the edge of the viewport so not to be repeatedly
            //tearing down rows when folk idly scroll up & down; ..as they do.. ;)
            else if (!row || (row < (range.top-ReaperCacheSize) || row > (range.bottom+ReaperCacheSize)))
            {
                !row && logit("reapPadding: no row index id:"+item.id);

                item._sizePadding=0;
                trimPadding(item);
                _dataView.updateItem(item.id, item);
                logit("reapPadding: reaped id:"+item.id);
                delete _removedlist[id];
            }
            else logit("reapPadding: still in range: id:"+item.id);
        }

        _dataView.endUpdate();
    }

    //////////////////////////////////////////////////////////////
    //this is project-specific. it knows how to calculate the padding requirements.
    //TODO: ...so there's some work do to here, abstracting a dev API call..
    //////////////////////////////////////////////////////////////
    var setCellPaddingInfos=function(row, column)
    {
        var colOpts=_grid.getColumns()[column];
        var item=_dataView.getItem(row);

        if (colOpts && item && !item._collapsed && !item._isPadding)
        {
            item._sizePadding=Math.ceil(colOpts.width / _grid.getOptions().rowHeight);
            item._height=item._sizePadding*_grid.getOptions().rowHeight;
            item._nodeDetail.css({height: item._height});
            _dataView.updateItem(item.id, item);
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
                (a._parent[_sortCol.field] == b._parent[_sortCol.field] ?
                  (a._parent.id > b._parent.id) :
                  (a._parent[_sortCol.field] > b._parent[_sortCol.field]))) }

            var tf=function() {
              return (a._parent.id == b.id ? _sortAsc :
                (a._parent[_sortCol.field]==b[_sortCol.field] ? (a._parent.id>b.id):
                  (a._parent[_sortCol.field] > b[_sortCol.field]))) }

            var ft=function() {
              return (a.id == b._parent.id ? !_sortAsc :
                (a[_sortCol.field] == b._parent[_sortCol.field] ? (a.id > b._parent.id) :
                  (a[_sortCol.field] > b._parent[_sortCol.field]))) }

            var ff=function() {
              return (a[_sortCol.field] == b[_sortCol.field] ? (a.id > b.id) :
                (a[_sortCol.field] > b[_sortCol.field])) }

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
    //wraps everything to do with filtering on the pcComplete field
    //////////////////////////////////////////////////////////////
    var pcFilter=(function()
    {
        var _min=0, _max=100; //current state of the filter limits in visible range
        var _timer=undefined;

        //invoked from the generic callback we provide to dataView
        //if row is padding; get the value from it's parent. that's it ;)
        var onFilter=function(i) { return ((!i._isPadding || (i=i._parent)) && i.pcComplete >=_min && i.pcComplete <=_max); }

        //delay updating the grid UI till the user's stopped twiddling around ;)
        var onChangeComplete=function() {  _timer=undefined; _dataView.refresh(); return true; /*done. consume the event*/ }
        var onChange=        function() { !_timer && (_timer=whenSysIdle())(onChangeComplete, 150); }


        var initialiseUI=function()
        {
            var setMax=function(v){_max=v;uiMaxR.val(v);uiMaxN.val(v);(v<_min) && setMin(v) }
            var setMin=function(v){_min=v;uiMinR.val(v);uiMinN.val(v);(_max<v) && setMax(v) }

            var onMin= function() { setMin(parseInt($(this).val(),10)); onChange() }
            var onMax= function() { setMax(parseInt($(this).val(),10)); onChange() }

            var uiMinR=$("tr:first input[type=range]",  "#settings-ex-caching");
            var uiMinN=$("tr:first input[type=number]", "#settings-ex-caching");
            var uiMaxR=$("tr:last  input[type=range]",  "#settings-ex-caching");
            var uiMaxN=$("tr:last  input[type=number]", "#settings-ex-caching");

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
        var _handlers, _class;

        var onEachMutation=function(mutation)
        {
            for (var i=0, node; (node=mutation.addedNodes.item(i)) && i < mutation.addedNodes.length; i++)
                node.classList.contains(_class) && _handlers.onAdd && _handlers.onAdd(node);

            for (var i=0, node; (node=mutation.removedNodes.item(i)) && i < mutation.removedNodes.length; i++)
                node.classList.contains(_class) && _handlers.onRemove && _handlers.onRemove(node);
        }
        var onGotMutations=function(mutations) { _class && _handlers && mutations.forEach(onEachMutation); }
        var _observer=MutationObserver && new MutationObserver(onGotMutations); //degrade gracefully to non optimised runtime

        return function(ctr,c,h) {_observer && _observer.observe(ctr,_options); _class=c; _handlers=h; return _observer;}
    })();

    //////////////////////////////////////////////////////////////
    //make this it's own thing since we have need of it twice now
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
    //can do other stuff in here; only saying ;) return true to consume
    //////////////////////////////////////////////////////////////
    var onSysIdle=function() { return reapPadding(); }

    //////////////////////////////////////////////////////////////
    //attach detail to cell and show it now;
    //apply a custom css that boils away the hidden overflow.
    //NB: there's an API for applying cell-level css: setCellCssStyles()
    //but doing it that way; slickgrid *remembers it. so we'd also
    //need to explicitly remove it every time the cell is collapsed :(
    //NB: we *will receive *unwanted onload events as things get
    //moved about in the DOM ~> we *do need some uberDefensive codez
    //////////////////////////////////////////////////////////////
    var onPostRender=function(index, element)
    {
        var arrId=this.id.split("-"); //uid: literal + record + field
        var item=_dataView.getItemById(parseInt(arrId[1],10));
        var cellNode=$(this).parent();

        if (item && cellNode.length && !cellNode.hasClass(_attribs.cell))
        {
            cellNode.addClass(_attribs.cell).append(item._nodeDetail);
            item._countPadding==0 && revivePadding(item); //restore any reaped padding now
            delete _removedlist[item.id]; //in any case, item is back in view & fat again !
        }
    }

    //////////////////////////////////////////////////////////////
    //just add the item to the removedList
    //////////////////////////////////////////////////////////////
    var onDetailRemoved=function(index, element)
    {
        var arrId=this.id.split("-"); //uid: literal + record + field
        var item=_dataView.getItemById(parseInt(arrId[1],10));

        item && (item._sizePadding > 0) && (_removedlist[item.id]=item);
    }

    //////////////////////////////////////////////////////////////
    //in this example we only have *one detail cell but we could have more..
    //////////////////////////////////////////////////////////////
    var onRemoveRow=function(nodeRow) { $(_attribs.classSelector("cellDetailCtr"), nodeRow).each(onDetailRemoved); }

    //////////////////////////////////////////////////////////////
    //in this example we only have *one detail cell but we could have more..
    //////////////////////////////////////////////////////////////
    var onAddRow=function(nodeRow) { $(_attribs.classSelector("cellDetailCtr"), nodeRow).each(onPostRender); }

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

        var range=_grid.getRenderedRange();
        var col=getIdxDetailCol();

        //everything within the our cache is likely to still have padding
        range.top-=30;  range.bottom+30; // ..&& lets also cut some slack..

        var start=(range.top-ReaperCacheSize > 0 ? range.top-ReaperCacheSize : 0);
        var end=(range.bottom+ReaperCacheSize > _dataView.getLength() ? range.bottom+ReaperCacheSize : _dataView.getLength());

        for (var row=start; row<=end; row++)
            adjustPadding(setCellPaddingInfos(row, col));

        _dataView.endUpdate();
    }

    //////////////////////////////////////////////////////////////
    //this just builds our expand collapse button
    //////////////////////////////////////////////////////////////
    var onRenderIDCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding==true) return; //render nothing
        return (item._collapsed ?
            "<div class='toggle expand'></div>" : "<div class='toggle collapse'></div>");
    }

    //////////////////////////////////////////////////////////////
    //we apply this stub to whichever cell requires expanded details
    //////////////////////////////////////////////////////////////
    var onRenderDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";
        var html=[];
        html.push("<div>",value,"</div>");       //preserve unexpanded cell display value; with ellipses
        html.push("<div id='detail-", item.id, "-", columnDef.id, "' "); //uid: literal + record + field
        html.push("class='", _attribs.cellDetailCtr, "'></div>");       //used as a selector in onAddRow
        return html.join("");
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var onRowClick=function(e, args)
    {
        _dataView.beginUpdate();

        if ($(e.target).hasClass(_attribs.toggle))
        {
            var item=_dataView.getItem(args.row);
            if (item)
            {
                if (!item._collapsed)
                {
                    item._collapsed=true;
                    item._sizePadding=0;
                    trimPadding(item);
                }
                else
                {
                    item._collapsed=false;
                    kookupDynamicContent(item, args.row);
                    addPadding(item);
                }
                _dataView.updateItem(item.id, item);
            }
            e.stopImmediatePropagation();
        }

        _dataView.endUpdate();
    }

    //////////////////////////////////////////////////////////////
    //here we dynamically redefine a row that is about to be rendered.
    //we want to style away the bottom borders of our detail rows so that
    //they appear to be all one row. Note: this is all pre-processing.
    //////////////////////////////////////////////////////////////
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

            if (!item._collapsed) //..so we need to render the detail; provide our custom renderer
            {
                (format.columns={})[_attribs.detailField]={formatter: onRenderDetailCell};
                cssClasses.push(_attribs.row, _attribs.rowParent); //&mark row as a parent (of it's padding children)
            }
        }

        return (format.cssClasses=cssClasses.join(" ")) && format;
    };

    //////////////////////////////////////////////////////////////
    var _gridColumns=
    [
        {
            id:         "id",
            name:       "",
            field:      "id",
            resizable:  false,
            width:      20,
            formatter:  onRenderIDCell
        },
        {id: "title",         name: "Title",         field: "title",        width: 100 },
        {id: "duration",      name: "Duration",      field: "duration",     width: 100 },
        {id: "pcComplete",    name: "% Complete",    field: "pcComplete",   width: 120 },
        {id: "start",         name: "Start",         field: "start",        width: 120 },
        {id: "finish",        name: "Finish",        field: "finish",       width: 120 },
        {id: "effortDriven",  name: "Effort Driven", field: "effortDriven", width: 100 },
    ];

    //////////////////////////////////////////////////////////////
    for (var i=1; i<_gridColumns.length;i++) _gridColumns[i]["sortable"]=true;

    //////////////////////////////////////////////////////////////
    //create the detail ctr node. this belongs to the dev & can be custom-styled as per
    //////////////////////////////////////////////////////////////
    var kookupDynamicContent=function(item, row)
    {
        var getfirstchild=function(n) {
            return (n ? (n.nodeType!=1 ? getfirstchild(n.nextSibling) : n) : null); }

        if (!item._nodeDetail)
        {
            //make an inline svg from a template
            var template=getfirstchild(document.getElementById("tmpl-smartee").firstChild);
            var clone=template.cloneNode(true);
            var nodeDefs=clone.querySelector('defs');

            var svgNS=clone.namespaceURI;
            var gradient=$("radialGradient",clone)[0];
            gradient.id="grad-"+item.id;

            var hue=250-(2*item.pcComplete);
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

            if (item.pcComplete==100)
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
            dataSmile.Q[0][1]+=item.pcComplete;
            for (var key in dataSmile){arrSmile.push(key+dataSmile[key].map(function(n){return n.join()}).join(" "))};
            $(".smile",clone)[0].setAttribute("d", arrSmile.join(" "));


            //create a new detail ctr; drop in the svg; jquerify for convenience
            var ctrDetail=document.createElement("div");
            ctrDetail.id=item.id;
            ctrDetail.className=_attribs.cellDetail;
            ctrDetail.appendChild(clone);
            item._nodeDetail=$(ctrDetail);
        }
        else; //nothing: did already.

        setCellPaddingInfos(row, getIdxDetailCol()); //in any case, callibrate the detail
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var run=function()
    {
        //initialise the data-model
        _dataView=new Slick.Data.DataView();
        _dataView.getItemMetadata=onRenderRow; //override the dataview callback with our own
        _dataView.setFilter(onFilter);
        _dataView.beginUpdate();
        _dataView.setItems(_data);
        _dataView.endUpdate();

        ////////////////////////////////////////////////////////////////////////////////////////
        //lol. no longer *options* per 6pac breaking changes:
        //slick.grid.js :
        //L326: if (!options.suppressCssChangesOnHiddenInit) { cacheCssForHiddenInit(); }
        //L331: options = $.extend({}, defaults, options);
        //L326 should have been placed *after L331 where the *options* defaults are instantiated.
        var gridOptions={ };
        ////////////////////////////////////////////////////////////////////////////////////////

        //initialise the grid
        _grid=new Slick.Grid(_attribs.idSelector("grid"), _dataView, _gridColumns, gridOptions);
        _grid.onColumnsResized.subscribe(onColumnsResized);
        _grid.onClick.subscribe(onRowClick);
        _grid.onSort.subscribe(onRowSort);

        //wire up model events to drive the grid per DataView requirements
        _dataView.onRowCountChanged.subscribe
            (function(){ _grid.updateRowCount();_grid.render(); });

        _dataView.onRowsChanged.subscribe
            (function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        sort(); //give the data an initial sort ~default is by id

        pcFilter.initialiseUI(); //kick-off our filter hooks into the UI

        //start pumping out onAddRow & onRemoveRow events
        internationalObserver(_grid.getCanvasNode(), _attribs.slickRow, {onAdd:onAddRow, onRemove:onRemoveRow});

        //start our own idle-time event-pump
        whenSysIdle()(onSysIdle, 350);

        $(window).resize(function() {_grid.resizeCanvas()});
    };

    var setData=function(data) { _data=data;  }

    var resize=function() { _grid.resizeCanvas(); }

    return {run:run, resize:resize, setData:setData}

}
)();


//////////////////////////////////////////////////////////////
//kookup some test data & supply it to the example
//////////////////////////////////////////////////////////////
V313.modSlickgridEx6TestData=(
function()
{
    var _data=[];
    for (var i = 0; i < 100; i++)
        _data[i] =
        {
            id:               i,
            title:            "Task " + i,
            duration:         "5 days",
            pcComplete:       Math.round(Math.random() * 100),
            start:            "01/01/2009",
            finish:           "01/05/2009",
            effortDriven:     (i % 5 == 0),

            //additional hidden metadata fields
            _collapsed:       true,
            _nodeDetail:      null, //DOM detail container node
            _sizePadding:     0,    //required number of pading rows
            _countPadding:    0,    //current number of pading rows
            _height:          0,    //actual height in pixels of the detail field
            _isPadding:       false,
            _parent:          undefined,
            _offset:          0,    //each padding item is keyed by it's offset
            _colour:          0,    //bit of state to deal with row stripiness
        };

    V313.modSlickgridEx6.setData(_data);
}
)();

//////////////////////////////////////////////////////////////
//done ;)

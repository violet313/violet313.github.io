////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
window.V313=(function(V313, $, undefined){return V313;})(window.V313 || {}, jQuery);

V313.modSlickgridEx5=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];

    var _attribs= //lets make a start on abstracting out all the DOM attribute literals
    {
        //belongs to slickgrid
        slickRow:           "slick-row",

        //ours
        grid:               "oh-my-griddy-aunt",
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

        //delay updating the grid UI till the user's stopped twiddling ;)
        var onChangeComplete= function() {  _timer=undefined; _dataView.refresh(); }
        var onChange=         function() { !_timer && (_timer=setTimeout(onChangeComplete,150)); }
        var reset=            function() {  _timer=clearTimeout(_timer); onChange(); }

        document.onmousemove=reset;
        document.onkeypress= reset;


        var initialiseUI=function()
        {
            var setMax=function(v) { _max=v;uiMaxR.val(v); uiMaxN.val(v); (v<_min) && setMin(v) }
            var setMin=function(v) { _min=v;uiMinR.val(v); uiMinN.val(v); (_max<v) && setMax(v) }

            var onMin= function()  { setMin(parseInt($(this).val(),10)); onChange() }
            var onMax= function()  { setMax(parseInt($(this).val(),10)); onChange() }

            var uiMinR=$("tr:first input[type=range]",  "#settings-ex-postrender");
            var uiMinN=$("tr:first input[type=number]", "#settings-ex-postrender");
            var uiMaxR=$("tr:last  input[type=range]",  "#settings-ex-postrender");
            var uiMaxN=$("tr:last  input[type=number]", "#settings-ex-postrender");

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
        var _handler, _class;

        var onEachMutation=function(mutation){
            for (var i=0, node; (node=mutation.addedNodes.item(i)) && i < mutation.addedNodes.length; i++)
                node.classList.contains(_class) && _handler(node); }
        var onGotMutations=function(mutations) { _class && _handler && mutations.forEach(onEachMutation); }
        var _observer=MutationObserver && new MutationObserver(onGotMutations); //degrade gracefully to non optimised runtime

        return function(ctr,c,h) {_observer && _observer.observe(ctr,_options); _class=c; _handler=h; return _observer;}
    })();

    //////////////////////////////////////////////////////////////
    //attach detail to cell and show it now;
    //apply a custom css that boils away the hidden overflow.
    //NB: there's an API for applying cell-level css: setCellCssStyles()
    //but doing it that way; slickgrid *remembers it. so we'd also
    //need to explicitly remove it every time things change :(
    //NB: we *will receive *unwanted onload events as things get
    //moved about in the DOM ~> we *do need some uberDefensive codez
    //////////////////////////////////////////////////////////////
    var onPostRender=function(index, element)
    {
        var arrId=this.id.split("-"); //uid: literal + record + field
        var item=_dataView.getItemById(parseInt(arrId[1],10));
        var cellNode=$(this).parent(); //could call _grid.getCellNode but really, why bother

        if (item && cellNode.length && !cellNode.hasClass(_attribs.cell))
            cellNode.addClass(_attribs.cell).append(item._nodeDetail);
    }

    //////////////////////////////////////////////////////////////
    //in this example we only have *one detail cell but we could have more..
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

        var col=getIdxDetailCol();
        var end=_dataView.getLength();

        for (var row=0; row<=end; row++)
            adjustPadding(setCellPaddingInfos(row, col));

        _dataView.endUpdate();
    }

    //////////////////////////////////////////////////////////////
    //this just builds our expand collapse button
    //////////////////////////////////////////////////////////////
    var onRenderIDCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding==true) return; //render nothing
        return (item._collapsed ? "<div class='toggle expand'></div>" : "<div class='toggle collapse'></div>");
    }

    //////////////////////////////////////////////////////////////
    //we apply this stub to whichever cell requires expanded details
    //////////////////////////////////////////////////////////////
    var onRenderDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";
        var html=[];
        html.push("<div>",value,"</div>");  //preserve unexpanded cell display value; with ellipses
        html.push("<div id='detail-", item.id, "-", columnDef.id, "' "); //literal + record + field
        html.push("class='", _attribs.cellDetailCtr, "'></div>");  //used as a selector in onAddRow
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
        {id: "id",            name: "",              field: "id",           width:  20,},
        {id: "title",         name: "Title",         field: "title",        width: 100 },
        {id: "duration",      name: "Duration",      field: "duration",     width: 100 },
        {id: "pcComplete",    name: "% Complete",    field: "pcComplete",   width: 120 },
        {id: "start",         name: "Start",         field: "start",        width: 120 },
        {id: "finish",        name: "Finish",        field: "finish",       width: 120 },
        {id: "effortDriven",  name: "Effort Driven", field: "effortDriven", width: 100 },
    ];

    //////////////////////////////////////////////////////////////
    _gridColumns[0].resizable=false;
    _gridColumns[0].formatter=onRenderIDCell;
    for (var i=1; i<_gridColumns.length; i++) _gridColumns[i]["sortable"]=true;

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
            var nodeDefs=clone.querySelector("defs");

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

            var arrSmile=[], dataSmile={ M: [[120,280]], Q: [[200,230], [280,280]] };
            dataSmile.Q[0][1]+=item.pcComplete;
            for (var key in dataSmile)
              arrSmile.push(key+dataSmile[key].map(function(n){return n.join()}).join(" "));
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
        _dataView.onRowCountChanged.subscribe(function(){ _grid.updateRowCount();_grid.render(); });
        _dataView.onRowsChanged.subscribe(function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        sort(); //give the data an initial sort ~default is by id
        pcFilter.initialiseUI(); //kick-off our filter hooks into the UI

        //start pumping out onAddRow events
        internationalObserver(_grid.getCanvasNode(), _attribs.slickRow, onAddRow);

        $(window).resize(function() {_grid.resizeCanvas()});
    });

    //////////////////////////////////////////////////////////////
    //time to chuck-out the test data kooker
    //////////////////////////////////////////////////////////////
    return { setData: function(data){_data=data} }
}());

//////////////////////////////////////////////////////////////
//kookup some test data & supply it to the example
//////////////////////////////////////////////////////////////
V313.modSlickgridEx5TestData=(
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

    V313.modSlickgridEx5.setData(_data);
}
)();

//////////////////////////////////////////////////////////////
//done ;)

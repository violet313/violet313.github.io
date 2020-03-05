////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
modSlickgridSort=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];

    var _attribs= //lets make a start on abstracting out all the DOM attribute literals
    {
        //ours
        grid:               "oh-my-griddy-aunt",
        tardis:             "tardis",  //for templates & hiding stuff.
        detailField:        "pcComplete",

        //ours, for styling away UI side-efects etc
        toggle:             "toggle",
        cell:               "dynamic-cell",
        cellDetail:         "dynamic-cell-detail",
        row:                "dynamic-row",
        rowYin:             "dynamic-row-yin",
        rowYang:            "dynamic-row-yang",
        rowParent:          "dynamic-row-parent",
        rowPadding:         "dynamic-row-padding",
        rowPaddingLast:     "dynamic-row-padding-last",
        rowPaddingInner:    "dynamic-row-padding-inner",
    };
    _attribs.idSelector=function(k)    {return "#"+this[k]};


    //////////////////////////////////////////////////////////////
    //always reference columns by name so user can move 'em around
    //////////////////////////////////////////////////////////////
    var getIdxDetailCol=function(){return _grid.getColumnIndex(_attribs.detailField);}

    var getKeyDynoCellStyle=function(row)
    {
        return _attribs.cell+"."+_attribs.detailField+"."+row;
    }

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
            _dataView.updateItem(item.id, item);
        }
        else
            item=undefined;

        return item;
    }

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

    //////////////////////////////////////////////////////////////
    //delegate the sorting to DataView; which will sort the data using our
    //comparer callback; fire appropriate change events and update the grid
    //////////////////////////////////////////////////////////////
    var sort=function() { _dataView.sort(comparer.compare, comparer.getSortAsc()); }

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
        return (item._collapsed ?
            "<div class='toggle expand'></div>" : "<div class='toggle collapse'></div>");
    }

    //////////////////////////////////////////////////////////////
    //provide the detail inside a ctr div for us to custom-style
    //////////////////////////////////////////////////////////////
    var onRenderDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";

        var html=[];
        var rowHeight=_grid.getOptions().rowHeight;

        html.push("<div>",value,"</div>");                    //keep uncollapsed field val
        html.push("<div class='", _attribs.cellDetail, "' "); //add css to permit overflow
        html.push("style='height:", item._height, "px;");     //set total padding height
        html.push("top:", rowHeight, "px'>");                 //shift detail below 1st row
        html.push("<div>",item._nodeDetail,"</div>");         //sub-ctr for custom styling
        html.push("</div>");

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
                    _dataView.updateItem(item.id, item);
                }
                else
                {
                    item._collapsed=false;
                    kookupDynamicContent(item, args.row);
                    addPadding(item);
                }
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
            cssClasses.push(_attribs.row, ((item._colour=row%2) ?
                _attribs.rowYin : _attribs.rowYang));

        else if (item._isPadding==true)
        {
            _grid.removeCellCssStyles(getKeyDynoCellStyle(row));

            //ensure padding has same stripe colour as parent.
            cssClasses.push(_attribs.row, (colourPrevious ?
                _attribs.rowYin : _attribs.rowYang));
            item._colour=(colourPrevious);

            //apply classes to identify padding rows,
            //&also inner or last padding rows to avoid styling away the bottom border
            cssClasses.push(_attribs.rowPadding);
            cssClasses.push(item._offset==item._parent._sizePadding ?
                _attribs.rowPaddingLast : _attribs.rowPaddingInner);
        }
        else //not padding
        {
            //ensure parent has opposite stripe colour to previous parent.
            cssClasses.push((colourPrevious ? _attribs.rowYang : _attribs.rowYin));
            item._colour=colourPrevious^1;

            if (!item._collapsed) //..need to render the detail; provide our custom renderer
            {
                var cssDynoCellStyle={};
                (cssDynoCellStyle[row]={})[_attribs.detailField]=_attribs.cell;
                _grid.setCellCssStyles(getKeyDynoCellStyle(row), cssDynoCellStyle);

                (format.columns={})[_attribs.detailField]={formatter: onRenderDetailCell};
                cssClasses.push(_attribs.row, _attribs.rowParent); //&mark row as a parent
            }
            else
                _grid.removeCellCssStyles(getKeyDynoCellStyle(row));
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
    //////////////////////////////////////////////////////////////
    var kookupTestData=(function()
    {
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
    })();

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

            var arrSmile=[], dataSmile={ M: [[120,280]], Q: [[200,230], [280,280]] };
            dataSmile.Q[0][1]+=item.pcComplete;
            for (var key in dataSmile)
              arrSmile.push(key+dataSmile[key].map(function(n){return n.join()}).join(" "));
            $(".smile",clone)[0].setAttribute("d", arrSmile.join(" "));


            //stringify clone &save the generated html in the item detail
            var serialiser=new XMLSerializer();
            item._nodeDetail=serialiser.serializeToString(clone);
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
        _dataView.beginUpdate();
        _dataView.setItems(_data);
        _dataView.endUpdate();

        //initialise the grid
        _grid=new Slick.Grid(_attribs.idSelector("grid"), _dataView, _gridColumns);
        _grid.onColumnsResized.subscribe(onColumnsResized);
        _grid.onClick.subscribe(onRowClick);
        _grid.onSort.subscribe(onRowSort);

        //wire up model events to drive the grid per DataView requirements
        _dataView.onRowCountChanged.subscribe
            (function(){ _grid.updateRowCount();_grid.render(); });

        _dataView.onRowsChanged.subscribe
            (function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        sort(); //give the data an initial sort ~default is by id

        $(window).resize(function() {_grid.resizeCanvas()});
    });
}
)();
//////////////////////////////////////////////////////////////
//done ;)

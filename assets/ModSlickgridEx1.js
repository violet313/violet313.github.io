////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
window.V313=(function(V313, $, undefined){return V313;})(window.V313 || {}, jQuery);

V313.modSlickgridEx1=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];

    var _attribs= //lets make a start on abstracting out all the DOM attribute literals
    {
        //ours
        grid:               "grid-noresize-no-postrender",
        detailField:        "duration",

        //ours, for styling away UI side-efects etc
        toggle:             "toggle",
        cell:               "dynamic-cell",
        cellDetail:         "dynamic-cell-detail-no-resize",
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
    //////////////////////////////////////////////////////////////
    var getKeyDynoCellStyle=function(row) {return _attribs.cell+"."+_attribs.detailField+"."+row;}

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
    //this just builds our expand collapse button
    //////////////////////////////////////////////////////////////
    var onRenderIDCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding==true); //render nothing
        else return (item._collapsed ? "<div class='toggle expand'></div>" : "<div class='toggle collapse'></div>");
    }

    //////////////////////////////////////////////////////////////
    //provide the detail inside a ctr div for us to custom-style
    //////////////////////////////////////////////////////////////
    var onRenderDetailCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";

        var html=[];
        var rowHeight=_grid.getOptions().rowHeight;

        html.push("<div>",value,"</div>");                     //preserve uncollapsed header val
        html.push("<div class='", _attribs.cellDetail, "' ");  //appy custom css to evade overflow restrictions
        html.push("style='height:", item._height, "px;");      //apply the total height of our padding cells
        html.push("top:", rowHeight, "px'>");                  //shift detail down below the uncollapsed header val
        html.push("<div>",item._detailContent,"</div>");       //detail in sub ctr for custom styling purposes
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
                    for (var idx=1; idx<=item._sizePadding; idx++)
                        _dataView.deleteItem(item.id+"."+idx);
                    item._sizePadding=0;
                }
                else
                {
                    item._collapsed=false;
                    kookupDynamicContent(item);
                    var idxParent=_dataView.getIdxById(item.id);
                    for (var idx=1; idx<=item._sizePadding; idx++)
                        _dataView.insertItem(idxParent+idx, getPaddingItem(item,idx));
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
            _grid.removeCellCssStyles(getKeyDynoCellStyle(row));

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
                var cssDynoCellStyle={};
                (cssDynoCellStyle[row]={})[_attribs.detailField]=_attribs.cell;
                _grid.setCellCssStyles(getKeyDynoCellStyle(row), cssDynoCellStyle);

                (format.columns={})[_attribs.detailField]={formatter: onRenderDetailCell};
                cssClasses.push(_attribs.row, _attribs.rowParent); //&mark row as a parent (of it's padding children)
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

        {id: "title",         name: "Title",         field: "title",        resizable: true, width: 100 },
        {id: "duration",      name: "Duration",      field: "duration",     resizable: true, width: 100 },
        {id: "pcComplete",    name: "% Complete",    field: "pcComplete",   resizable: true, width: 120 },
        {id: "start",         name: "Start",         field: "start",        resizable: true, width: 120 },
        {id: "finish",        name: "Finish",        field: "finish",       resizable: true, width: 120 },
        {id: "effortDriven",  name: "Effort Driven", field: "effortDriven", resizable: true, width: 100 },
    ];

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
                _sizePadding:     0,        //the required number of pading rows
                _height:          0,        //the actual height in pixels of the detail field
                _isPadding:       false,
                _parent:          undefined,
                _offset:          0,        //each padding item is keyed by it's offset
                _colour:          0,        //bit of state so we can deal with row stripyness
            };
    })();

    //////////////////////////////////////////////////////////////
    //create the detail ctr node. this belongs to the dev & can be custom-styled as per
    //////////////////////////////////////////////////////////////
    var kookupDynamicContent=function(item)
    {
        //add some random oooks as fake detail content
        var oookContent=[];
        var oookCount=Math.round(Math.random() * 12)+1;
        for (var next=0; next<oookCount; next++)
            oookContent.push("<div><span>oook</span></div>");
        item._detailContent=oookContent.join("");

        //calculate padding requirements based on detail-content..
        //ie. worst-case: create an invisible dom node now &find it's height.
        var lineHeight=13; //we know cuz we wrote the custom css innit ;)
        item._sizePadding=Math.ceil((oookCount*lineHeight) / _grid.getOptions().rowHeight);
        item._height=(item._sizePadding * _grid.getOptions().rowHeight);
    }

    //////////////////////////////////////////////////////////////
    var run=function()
    {
        //initialise the data-model
        _dataView=new Slick.Data.DataView();
        _dataView.getItemMetadata=onRenderRow; //override the dataview callback with our own
        _dataView.beginUpdate();
        _dataView.setItems(_data);
        _dataView.endUpdate();

        //initialise the grid
        _grid=new Slick.Grid(_attribs.idSelector("grid"), _dataView, _gridColumns);
        _grid.onClick.subscribe(onRowClick);

        //wire up model events to drive the grid per DataView requirements
        _dataView.onRowCountChanged.subscribe(function(){ _grid.updateRowCount();_grid.render(); });
        _dataView.onRowsChanged.subscribe(function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        $(window).resize(function() {_grid.resizeCanvas()});
    };

    var resize=function() { _grid.resizeCanvas(); }

    return {run:run, resize:resize}

}
)();
//////////////////////////////////////////////////////////////
//done ;)


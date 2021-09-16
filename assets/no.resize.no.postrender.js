////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
modSlickgridNoResize=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];

    var _detailField="duration";

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var getKeyDynoCellStyle=function(row) {return "dynamic-cell"+"."+_detailField+"."+row;}

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

        html.push("<div>",value,"</div>");                //keep uncollapsed field val
        html.push("<div class='dynamic-cell-detail' ");   //apply css to permit overflow
        html.push("style='height:", item._height, "px;"); //set total height of padding
        html.push("top:", rowHeight, "px'>");             //shift detail below 1st row
        html.push("<div>",item._detailContent,"</div>");  //sub-ctr for custom styling
        html.push("</div>");

        return html.join("");
    }

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    var onRowClick=function(e, args)
    {
        _dataView.beginUpdate();

        if ($(e.target).hasClass("toggle"))
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
            cssClasses.push("dynamic-row", ((item._colour=row%2) ?
                "dynamic-row-yin" : "dynamic-row-yang"));

        else if (item._isPadding==true)
        {
            _grid.removeCellCssStyles(getKeyDynoCellStyle(row));

            //ensure padding has same stripe colour as parent.
            cssClasses.push("dynamic-row", (colourPrevious ?
                "dynamic-row-yin" : "dynamic-row-yang"));
            item._colour=(colourPrevious);

            //apply classes to identify padding rows,
            //&also inner or last padding rows to avoid styling away the bottom border
            cssClasses.push("dynamic-row-padding");
            cssClasses.push(item._offset==item._parent._sizePadding ?
                "dynamic-row-padding-last" : "dynamic-row-padding-inner");
        }
        else //not padding
        {
            //ensure parent has opposite stripe colour to previous parent.
            cssClasses.push((colourPrevious ? "dynamic-row-yang" : "dynamic-row-yin"));
            item._colour=colourPrevious^1;

            if (!item._collapsed) //..need to render the detail; provide our custom renderer
            {
                var cssDynoCellStyle={};
                (cssDynoCellStyle[row]={})[_detailField]="dynamic-cell";
                _grid.setCellCssStyles(getKeyDynoCellStyle(row), cssDynoCellStyle);

                (format.columns={})[_detailField]={formatter: onRenderDetailCell};
                cssClasses.push("dynamic-row", "dynamic-row-parent"); //&mark row as parent
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
                _sizePadding:     0,    //required number of pading rows
                _height:          0,    //actual height in pixels of the detail field
                _isPadding:       false,
                _parent:          undefined,
                _offset:          0,    //each padding item is keyed by it's offset
                _colour:          0,    //bit of state to deal with row stripyness
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
        item._sizePadding=Math.ceil((oookCount*lineHeight)/_grid.getOptions().rowHeight);
        item._height=(item._sizePadding * _grid.getOptions().rowHeight);
    }

    //////////////////////////////////////////////////////////////
    //jquery onDocumentLoad
    //////////////////////////////////////////////////////////////
    $(function()
    {
        //initialise the data-model
        _dataView=new Slick.Data.DataView();
        _dataView.getItemMetadata=onRenderRow; //override the dataview callback with ours
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
        _grid=new Slick.Grid("#oh-my-griddy-aunt", _dataView, _gridColumns, gridOptions);
        _grid.onClick.subscribe(onRowClick);

        //wire up model events to drive the grid per DataView requirements
        _dataView.onRowCountChanged.subscribe
            (function(){ _grid.updateRowCount();_grid.render(); });

        _dataView.onRowsChanged.subscribe
            (function(e, a){ _grid.invalidateRows(a.rows);_grid.render(); });

        $(window).resize(function() {_grid.resizeCanvas()});
    });
}
)();
//////////////////////////////////////////////////////////////
//done ;)


////////////////////////////////////////////////////////////////////////////////
//example codez re trying to create a grid with rows of dynamic height to
//cater for folks that wanna bung loads of stuff in a field & see it all...
//by violet313@gmail.com ~ visit: www.violet313.org/slickgrids
//have all the fun with it  ;) vxx.
////////////////////////////////////////////////////////////////////////////////
modSlickgridSimple=(
function()
{
    var _dataView=null;
    var _grid=null;
    var _data=[];


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

        return item;
    }

    //////////////////////////////////////////////////////////////
    //this just builds our expand collapse button
    //////////////////////////////////////////////////////////////
    var onRenderIDCell=function(row, cell, value, columnDef, item)
    {
        if (item._isPadding==true); //render nothing
        else if (item._collapsed) return "<div class='toggle expand'></div>";
        else
        {
            var html=[];
            var rowHeight=_grid.getOptions().rowHeight;

            //V313HAX:
            //putting in an extra closing div after the closing toggle div and ommiting a
            //final closing div for the detail ctr div causes the slickgrid renderer to
            //insert our detail div as a new column ;) ~since it wraps whatever we provide
            //in a generic div column container. so our detail becomes a child directly of
            //the row not the cell. nice =)  ~no need to apply a css change to the parent
            //slick-cell to escape the cell overflow clipping.

            //sneaky extra </div> inserted here--------------v
            html.push("<div class='toggle collapse'></div></div>");

            html.push("<div class='dynamic-cell-detail' ");   //apply custom css to detail
            html.push("style='height:", item._height, "px;"); //set total height of padding
            html.push("top:", rowHeight, "px'>");             //shift detail below 1st row
            html.push("<div>",item._detailContent,"</div>");  //sub ctr for custom styling
            //&omit a final closing detail container </div> that would come next

            return html.join("");
        }
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
    var gridOptions={ enableColumnReorder:  true };

    //////////////////////////////////////////////////////////////
    var _gridColumns=
    [
        {
            id:         "id",
            name:       "",
            field:      "id",
            resizable:  false,
            width:      20,
            formatter:  onRenderIDCell,
        },
        {id: "title",        name: "Title",         field: "title",        resizable: true},
        {id: "duration",     name: "Duration",      field: "duration",     resizable: true},
        {id: "pcComplete",   name: "% Complete",    field: "pcComplete",   resizable: true},
        {id: "start",        name: "Start",         field: "start",        resizable: true},
        {id: "finish",       name: "Finish",        field: "finish",       resizable: true},
        {id: "effortDriven", name: "Effort Driven", field: "effortDriven", resizable: true},
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
                _sizePadding:     0,     //the required number of pading rows
                _height:          0,     //the actual height in pixels of the detail field
                _isPadding:       false,
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
    //jquery onDocumentLoad
    //////////////////////////////////////////////////////////////
    $(function()
    {
        //initialise the data-model
        _dataView=new Slick.Data.DataView();
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
        _grid=new Slick.Grid("#grid-simple", _dataView, _gridColumns, gridOptions);
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

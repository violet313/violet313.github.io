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
}

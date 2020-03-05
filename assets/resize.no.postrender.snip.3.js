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

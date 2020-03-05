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

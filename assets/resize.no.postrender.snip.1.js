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


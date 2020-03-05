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

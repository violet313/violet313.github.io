//////////////////////////////////////////////////////////////
//just add the item to the removedList
//////////////////////////////////////////////////////////////
var onDetailRemoved=function(index, element)
{
    var arrId=this.id.split("-"); //uid: literal + record + field
    var item=_dataView.getItemById(parseInt(arrId[1],10));

    item && (item._sizePadding > 0) && (_removedlist[item.id]=item);
}

//////////////////////////////////////////////////////////////
//in this example we only have *one detail cell but we could have more..
//////////////////////////////////////////////////////////////
var onRemoveRow=function(nodeRow) { $(_attribs.classSelector("cellDetailCtr"), nodeRow).each(onDetailRemoved); }

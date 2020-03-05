var onPostRender=function(index, element)
{
    var arrId=this.id.split("-"); //uid: literal + record + field
    var item=_dataView.getItemById(parseInt(arrId[1],10));
    var cellNode=$(this).parent(); //could call _grid.getCellNode but really, why bother

    if (item && cellNode.length && !cellNode.hasClass(_attribs.cell))
        cellNode.addClass(_attribs.cell).append(item._nodeDetail);
}


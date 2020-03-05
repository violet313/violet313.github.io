var onPostRender=function(idItem, cell)
{
    var item=_dataView.getItemById(idItem);
    var row=_dataView.getRowById(idItem);
    var cellNode=$(_grid.getCellNode(row, cell));

    if (item && cellNode.length && !cellNode.hasClass(_attribs.cell))
        cellNode.addClass(_attribs.cell).append(item._nodeDetail);
}

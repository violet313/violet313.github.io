//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
var onColumnsResized=function(e, args)
{
    _dataView.beginUpdate();

    var col=getIdxDetailCol();
    var end=_dataView.getLength();

    for (var row=0; row<=end; row++)
        adjustPadding(setCellPaddingInfos(row, col));

    _dataView.endUpdate();
}

var onRenderDetailCell=function(row, cell, value, columnDef, item)
{
    if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";
    var html=[];
    html.push("<div>",value,"</div>");  //preserve unexpanded cell display value; with ellipses
    html.push("<div id='detail-", item.id, "-", columnDef.id, "' "); //literal + record + field
    html.push("class='", _attribs.cellDetailCtr, "'></div>");  //used as a selector in onAddRow
    return html.join("");
}

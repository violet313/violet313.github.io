var onRenderDetailCell=function(row, cell, value, columnDef, item)
{
    if (item._isPadding || item._collapsed) throw "onRenderDetailCell: wtf?";
    var html=[];
        html.push("<div>",value,"</div>"); //keep uncollapsed field val
        html.push(
            "<style onload='V313.modSlickgridEx5a.onPostRender(",
            item.id,
            ",",
            cell,
            ")'></style>");
    return html.join("");
}

var internationalObserver=(function()
{
    var  MutationObserver=window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var _options={characterData:false, attributes:false, childList:true, subtree:true};
    var _handlers, _class;

    var onEachMutation=function(mutation)
    {
        for (var i=0, node; (node=mutation.addedNodes.item(i)) && i < mutation.addedNodes.length; i++)
            node.classList.contains(_class) && _handlers.onAdd && _handlers.onAdd(node);

        for (var i=0, node; (node=mutation.removedNodes.item(i)) && i < mutation.removedNodes.length; i++)
            node.classList.contains(_class) && _handlers.onRemove && _handlers.onRemove(node);
    }
    var onGotMutations=function(mutations) { _class && _handlers && mutations.forEach(onEachMutation); }
    var _observer=MutationObserver && new MutationObserver(onGotMutations); //degrade gracefully to non optimised runtime

    return function(ctr,c,h) {_observer && _observer.observe(ctr,_options); _class=c; _handlers=h; return _observer;}
})();

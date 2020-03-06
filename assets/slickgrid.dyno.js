//////////////////////////////////////////////////////////////
(function()
{
    var _snippets=
    {
        //intro: just a simple drop-down panel
        "simple-js":
        {
            url:          "./assets/simple.dropdown.panel.js",
            highlight:    [51,52,53,54,55,56,57,58,78,79,80,81, 85,86,87,88,89, 111],
            brush:        "js",
        },

        //intro: just a simple drop-down panel
        "simple-snip-js":
        {
            url:          "./assets/simple.dropdown.panel.snip.js",
            highlight:    [78,79,80,81, 85,86,87,88,89],
            "first-line": 64,
            brush:        "js",
        },

        "simple-css":
        {
            url:          "./assets/simple.dropdown.panel.snip.css",
            highlight:    [],
            "first-line": 61,
            brush:        "css",
        },

        //ex1: no resize; no post-render
        "no-resize-no-postrender-js":
        {
            url:          "./assets/no.resize.no.postrender.js",
            highlight:    (function(){for(var a=[],i=102;i<=160;a[i]=i++); return a.push(18,233),a})(),
            brush:        "js",
        },

        "no-resize-no-postrender-snip-js":
        {
            url:          "./assets/no.resize.no.postrender.snip.js",
            highlight:    [127,148,149,150,152,156],
            "first-line": 102,
            brush:        "js",
        },

        "no-resize-no-postrender-css":
        {
            url:          "./assets/no.resize.no.postrender.css",
            highlight:    [],
            "first-line": 61,
            brush:        "css",
        },



        //ex2: resize; no post-render
        "resize-no-postrender-js":
        {
            url:          "./assets/resize.no.postrender.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=64;i<=145;a[i]=i++);
                              return a.push(39,366,383),a}
                          )(),
            brush:        "js",
        },

        "resize-no-postrender-snip1-js":
        {
            url:          "./assets/resize.no.postrender.snip.1.js",
            highlight:    [],
            "first-line": 64,
            brush:        "js",
        },

        "resize-no-postrender-snip2-js":
        {
            url:          "./assets/resize.no.postrender.snip.2.js",
            highlight:    [],
            "first-line": 164,
            brush:        "js",
        },

        "resize-no-postrender-snip3-js":
        {
            url:          "./assets/resize.no.postrender.snip.3.js",
            highlight:    [],
            "first-line": 111,
            brush:        "js",
        },


        //ex3: resize; sort
        "resize-sort-js":
        {
            url:          "./assets/resize.sort.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=132;i<=193;a[i]=i++);
                              return a.push(352,452,461),a}
                          )(),
            brush:        "js",
        },

        "resize-sort-snip-js":
        {
            url:          "./assets/resize.sort.snip.js",
            highlight:    [],
            "first-line": 132,
            brush:        "js",
        },


        //ex4: resize; sort; filter
        "resize-sort-filter-js":
        {
            url:          "./assets/resize.sort.filter.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=189;i<=239;a[i]=i++);
                              return a.push(458,477),a}
                          )(),
            brush:        "js",
        },

        "resize-sort-filter-css":
        {
            url:          "./assets/resize.sort.filter.css",
            highlight:    [],
            brush:        "css",
        },

        "resize-sort-filter-html":
        {
            url:          "./assets/resize.sort.filter.html",
            highlight:    [],
            brush:        "html",
        },

        "resize-sort-filter-snip-js":
        {
            url:          "./assets/resize.sort.filter.snip.js",
            highlight:    [199,200,201],
            "first-line": 189,
            brush:        "js",
        },



        //ex5: resize; sort; filter; postrender
        "postrender-snip1-js":
        {
            url:          "./assets/postrender.snip.1.js",
            highlight:    [],
            "first-line": 237,
            brush:        "js",
        },

        "postrender-snip2-js":
        {
            url:          "./assets/postrender.snip.2.js",
            highlight:    [318,319],
            "first-line": 313,
            brush:        "js",
        },

        "postrender-snip3-js":
        {
            url:          "./assets/postrender.snip.3.js",
            highlight:    [],
            "first-line": 261,
            brush:        "js",
        },

        "postrender-js":
        {
            url:          "./assets/postrender.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=234;i<=274;a[i]=i++);
                              return a.push(19,29,318,319,502),a}
                          )(),
            brush:        "js",
        },

        "postrender-snip4-js":
        {
            url:          "./assets/postrender.snip.4.js",
            highlight:    [295,296,297,298,299,300],
            "first-line": 290,
            brush:        "js",
        },

        "postrender-snip5-js":
        {
            url:          "./assets/postrender.snip.5.js",
            highlight:    [],
            "first-line": 242,
            brush:        "js",
        },


        //ex6: resize; sort; filter; postrender; cache
        "postrender-cache-js":
        {
            url:          "./assets/postrender.cache.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=135;i<=190;a[i]=i++);
                              for(i=325;i<=345;a[i]=i++);
                              for(i=370;i<=384;a[i]=i++);
                              for(i=638;i<=642;a[i]=i++);
                              return a.push(17,316,317,365,366,413,414),a}
                          )(),
            brush:        "js",
        },

        "postrender-cache-snip1-js":
        {
            url:          "./assets/postrender.cache.snip.1.js",
            highlight:    [316,317],
            "first-line": 305,
            brush:        "js",
        },

        "postrender-cache-snip2-js":
        {
            url:          "./assets/postrender.cache.snip.2.js",
            highlight:    [],
            "first-line": 370,
            brush:        "js",
        },

        "postrender-cache-snip3-js":
        {
            url:          "./assets/postrender.cache.snip.3.js",
            highlight:    [],
            "first-line": 328,
            brush:        "js",
        },

        "postrender-cache-snip4-js":
        {
            url:          "./assets/postrender.cache.snip.4.js",
            highlight:    [],
            "first-line": 135,
            brush:        "js",
        },

        "splash-js":
        {
            url:          "./assets/splash.js",
            highlight:    (function()
                          {
                              var a=[];
                              for(i=105;i<=147;a[i]=i++);
                              for(i=348;i<=352;a[i]=i++);
                              for(i=417;i<=511;a[i]=i++);
                              for(i=557;i<=615;a[i]=i++);
                              return a.push(29,30,283,311,312,387,624,625,626),a}
                          )(),
            brush:        "js",
        },

    };


    //////////////////////////////////////////////////////////////
    var htmlEntities=function(str)
    {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    //////////////////////////////////////////////////////////////
    var buildCodeSnippetContent=function(codes, id)
    {
        var strMod=htmlEntities(codes);
        var nodeCtr=document.getElementById("code-block-"+id);
        var nodeCodes=document.createElement("pre");

        if (nodeCtr==null || nodeCodes==null) alert("missing: " +id);
        else
        {
            nodeCodes.innerHTML=strMod.replace(/[\n\r];[\n\r]+$/,"");
            nodeCtr.removeChild(nodeCtr.childNodes[0]);
            nodeCtr.appendChild(nodeCodes);
            SyntaxHighlighter.highlight(_snippets[id], nodeCodes);
        }
    }

    //////////////////////////////////////////////////////////////
    var getAjaxCallbackSuccess=function(key)
    {
        return function(data) { buildCodeSnippetContent(data, key); }
    }

    //////////////////////////////////////////////////////////////
    var _ajaxOpts={type:"GET", dataType:"text"};
    var loadCodeExampleSnippets=function()
    {
        for  (var key in _snippets)
        {
            _snippets[key].toolbar=false;
            _ajaxOpts.success=getAjaxCallbackSuccess(key);
            _ajaxOpts.url=_snippets[key].url;
            $.ajax(_ajaxOpts);
        }
    };

    //////////////////////////////////////////////////////////////
    var _exampleMods=
    [
        "modSlickgridSimple",
        "modSlickgridEx1",
        "modSlickgridEx2",
        "modSlickgridEx3",
        "modSlickgridEx4",
        "modSlickgridEx5",
        "modSlickgridEx5a",
        "modSlickgridEx6",
    ];

    //////////////////////////////////////////////////////////////
    var modRun=     function(e) { V313[e].run(); }
    var modResize=  function(e) { V313[e].resize(); }


    //////////////////////////////////////////////////////////////
    //v.useful lil plugin
    //thx @mr.psycho ~ http://stackoverflow.com/a/12426657
    //////////////////////////////////////////////////////////////
    $.fn.noScrollOuter=function()
    {
        var _noScrollOuter=function(e)
        {
            var dy=e.originalEvent.wheelDelta || -e.originalEvent.detail;
            var h=$(this).height(), sT=$(this).scrollTop(), sH=this.scrollHeight;
            return ( (sH==h) || !((dy>0 && sT<=0) || (dy<0 && sT>=(sH-h))) );
        }
        this.on("mousewheel DOMMouseScroll", _noScrollOuter);
        return this;
    }

    //////////////////////////////////////////////////////////////
    var showTheCraft=function()
    {
        $("#splash").css("visibility", "hidden");
        V313.runTestData.pause();
        $("#code-steps").show();
        window.dispatchEvent(new Event('resize'));
        _exampleMods.forEach(modResize);

        var obj=$(window.location.hash);
        obj.length && $("html, body").scrollTop(obj.offset().top) || (window.location.hash="#intro");
    }

    //////////////////////////////////////////////////////////////
    var hideTheCraft=function()
    {
        $("#splash").css("visibility", "visible");
        V313.runTestData.resume();
        $("#code-steps").hide();
    }

    //////////////////////////////////////////////////////////////
    //add deep linx to the browser addy-bar
    //////////////////////////////////////////////////////////////
    $.fn.addDeepLinx=function()
    {
        var _addDeepLinx=function(e)
        {
            this.hash && window.location.hash==this.hash && $("html, body").scrollTop($(this.hash).offset().top);
            return this.hash && (window.location.hash=this.hash) && false;
        }
        this.on("click", _addDeepLinx);
        return this;
    }

    //////////////////////////////////////////////////////////////
    $(function()
    {
        _exampleMods.forEach(modRun);

        loadCodeExampleSnippets();

        $(".sh-inline-js").each(function()  { SyntaxHighlighter.highlight({brush: "js",  toolbar: false}, this); });
        $(".sh-inline-css").each(function() { SyntaxHighlighter.highlight({brush: "css", toolbar: false}, this); });


        $("#splash").css("visibility", "visible").show();
        $("#code-steps").css("visibility", "visible").hide();

        window.location.hash && showTheCraft();
        $("#show-details").on("click", showTheCraft);
        $(".skullie").on("click", hideTheCraft);
        $('.section-anchor').addDeepLinx();

        $('.code-block, .slick-viewport, #log').noScrollOuter();

        $("#spaghetti-plate").hover
        (
            function() { $("#spaghetti", this).css($(this).offset()).fadeIn() },
            function() { $("#spaghetti", this).fadeOut(); }
        );

        $("a", "#sh-fanks").hover(function() { $(".c4", "#sh-fanks1").toggleClass("c4h") });
        $("a", "#wr-fanks").hover(function() { $(".c5", this).toggleClass("c5h") });

    });

})();

//////////////////////////////////////////////////////////////
//all done ;)

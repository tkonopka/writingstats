


// count letters in words    
    var maxlen = 14, longwords = [], longcount = [];
    for (var i = 1; i < maxlen; i++) {
        longwords.push([]);
        longcount.push({"name": "" + i, idx: i - 1, value: 0, color: col[0]});
    }
    longwords.push([]);
    longcount.push({"name": maxlen + "+", idx: maxlen - 1, value: 0, color: col[0]});
    for (var i = 0; i < ws.words.length; i++) {
        var nowlen = ws.words[i].length;
        var nowindex = (nowlen >= maxlen) ? maxlen - 1 : nowlen - 1;
        longwords[nowindex].push(ws.words[i]);
        longcount[nowindex].value++;
    }
    
    
    var showwords = function (d, bar) {
        // highlight the clicked bar
        d3.selectAll("#ws-structure svg rect").attr("stroke", null);
        d3.select(bar).attr("stroke", brst.stroke);
        // fetch words of given length        
        var words = _.uniq(longwords[ +d.idx]).sort();
        var abox = d3.select("#ws-structure .ws-anno");
        abox.style("display", "block");
        abox.select("h4").text("Unique words of length " + d.name);
        abox.select("div").text(sanitizeHtml(words.join(", ")));
    };
    
     // prepare long words barplot
    brst.xlab = "Characters";
    ws.makeBarplotV("#ws-structure .ws-B", brst, longcount, showwords);

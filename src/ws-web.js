/* ws-web.js. Copyright 2017 Tomasz Konopka. */

/**
 * Dependencies (included in _includes folder): 
 * 
 * - d3.js
 * - sanitize-html
 * - underscore.js
 *   
 */

// This block is for netbeans book-keeping
/* global d3 */
/* global _ */


/**
 * Namespaces and constants for the app
 */
var ws = {
    builders: {},
    settings: {
        latex: true, // filter out latex "words"
        fontsize: "100%", // size of textarea text
        fontcolor: "#222"	// color of textarea text
    },
    kmerk: 6, // length of kmers to analyze
    age: -1, // age of analysis
    barmax: 24, // maximum number of rows in barplots
    badwords: ["the", "a", "an", "to", "for", "as",
        "in", "on", "and", "is", "of", "with"],
    allowedTags: ['span', 'b', 'em', 'ul', 'li']
};


/* ==========================================================================
 * General purpose helper functions
 * ========================================================================== */

/*
 * transfer key:value from settings into a target object 
 * 
 * @param target - target object
 * @param settings - source object
 * 
 * @returns {Element}
 */
ws.updateObj = function (target, settings) {
    for (var key in settings) {
        if (!settings.hasOwnProperty(key))
            continue;
        target[key] = settings[key];
    }
    return;
};


/** 
 * Wrapper for getElementById
 * 
 * @param x string id
 * @returns {Element}
 */
var gId = function (x) {
    return document.getElementById(x);
};


// manipulate dom elements with d3
// from: http://blog.webkid.io/replacing-jquery-with-d3/
d3.selection.prototype.show = function () {
    this.style('display', 'initial');
    return this;
};
d3.selection.prototype.hide = function () {
    this.style('display', 'none');
    return this;
};
d3.selection.prototype.toggle = function () {
    var isHidden = this.style('display') === 'none';
    return this.style('display', isHidden ? 'inherit' : 'none');
};
d3.selection.prototype.toggleClasses = function (a, b) {
    var isA = this.classed(a);
    return this.classed(a, !isA).classed(b, isA);
};


/**
 * Helper function return its input
 * 
 * @param x
 * @returns 
 */
ws.thex = function (x) {
    return x;
};


/**
 * Sorter by value field within an object
 * 
 * @param a object containing .value
 * @param b object containing .value
 */
ws.sortByValue = function (a, b) {
    if (a.value < b.value) {
        return 1;
    }
    if (a.value > b.value) {
        return -1;
    }
    return 0;
};


/** 
 * use sanitizeHTML to clean an input string or array
 * 
 * @param {type} x string or array of strings
 */
ws.sanitize = function (x) {
    if (typeof x === "string") {
        return sanitizeHtml(x, {
            "allowedTags": ws.allowedTags,
            "allowedAttributes": {"span": ['class']}
        });
    }
    return x.map(function (x) {
        return ws.sanitize(x);
    });
};


/*
 * helper to wrap words in one sentece into spans
 * 
 * @param a simple array of words
 * @param re regexp for highlighting
 * @param starting determines if to highlight only the first word
 * @returns html string (not sanitized)
 */
ws.wrapInSpans = function (a, re, starting = false) {
    var ee = "</span>";
    if (starting) {
        var a2 = a.map(function (x) {
            return "<span>" + x + ee;
        });
        if (a[0].match(re)) {
            a2[0] = "<span class='ws-highlight'>" + a[0] + ee;
        }
        return a2;
    }
    return a.map(function (x) {
        if (x.match(re)) {
            return "<span class='ws-highlight'>" + x + ee;
        } else {
            return "<span>" + x + ee;
        }
    });
};


/**
 * Related to ws.wrapInSpans, this prepares multiple sentences
 * 
 * @param sentences array of sentences
 * @param re regex for highlighting
 * @param starting logical, check if highlighting only the first words
 * @returns string with html (not sanitized)
 */
ws.wrapManyInSpans = function (sentences, re, starting = false) {
    sentences = sentences.map(function (a) {
        var a2 = ws.wrapInSpans(a, re, starting);
        var a2 = "<li>" + a2.join(" ") + "</li>";
        return a2;
    });
    return "<ul>" + sentences.join(" ") + "</ul>";
};


/* ==========================================================================
 * Builders
 * ========================================================================== */

/*
 * Turn empty <div class="ws-analysis"> into more complex objects 
 */
ws.builders.makeWidgets = function () {
    // fetch all analysis boxes and create contents	
    d3.selectAll(".ws-analysis").each(function () {
        var adiv = d3.select(this);
        var ah3 = adiv.append("h3");
        ah3.append("span").classed("glyphicon glyphicon-triangle-right", true);
        ah3.append("span").text(adiv.attr("val"));
        adiv.append("div").classed("ws-widget", true);
    });
    // create behaviors (rolling/unrolling)
    d3.selectAll("h3").on('click', function (d) {
        // toggle the glyphicon and widget visibility
        d3.select(this).select("span.glyphicon")
                .toggleClasses("glyphicon-triangle-right", "glyphicon-triangle-bottom");
        d3.select(this.parentNode).select(".ws-widget").toggle();
    });
    // hide widgets
    d3.selectAll(".ws-analysis .ws-widget").style("display", "none");
};


/**
 * Initializes the structure annotation box with h4 and div.  
 * 
 * @param target string identifier, e.g. #ws-structure
 */
ws.builders.makeAnnoBox = function (target) {
    var parent = d3.select(target + " .ws-widget");
    parent.selectAll("div.ws-anno").remove();
    var annodiv = parent.append("div").classed("ws-anno", true)
            .style("display", "none");
    annodiv.append("h4");
    annodiv.append("div").classed("ws-anno-content", true);
};


/** 
 * initialize a widget with one or two parts 
 * 
 * @param rootname selection root
 * @param parts int, set 1 or 2 to create a div with one or two columns
 */
ws.builders.makeWidgetAB = function (rootname, parts = 1) {
    var parent = d3.selectAll(rootname + " .ws-widget");
    parent.selectAll("svg").remove();
    if (parent.selectAll("div").size() < 2) {
        if (parts === 2) {
            parent.append("div").classed("col-md-6 ws-A", true);
            parent.append("div").classed("col-md-6 ws-B", true);
        } else {
            parent.append("div").classed("ws-AB", true);
        }
    }
};


/**
 *  This is a builder for one particular analysis component - overview
 */
ws.builders.makeOverview = function () {
    var parent = d3.select("#ws-overview .ws-widget");
    if (parent.selectAll("div").size() < 2) {
        var row = parent.append("div").attr("class", "row");
        var newdiv = function () {
            return row.append("div").attr("class", "col-md-4");
        };
        var mydiv = newdiv();
        mydiv.append("span").attr("id", "ws-overview-para-count");
        mydiv.append("span").attr("id", "ws-overview-para-comment").text("paragraphs");
        var mydiv = newdiv();
        mydiv.append("span").attr("id", "ws-overview-sentence-count");
        mydiv.append("span").attr("id", "ws-overview-sentence-comment").text("sentences");
        var mydiv = newdiv();
        mydiv.append("span").attr("id", "ws-overview-word-count");
        mydiv.append("span").attr("id", "ws-overview-word-comment").text("words");
        parent.append("div").classed("ws-AB", true);
    }
};


/**
 *  This is a builder for one particular analysis component - patterns
 */
ws.builders.makePatterns = function () {
    var parent = d3.select("#ws-patterns .ws-widget");
    if (parent.select("#ws-patterns-text").size() === 1) {
        //console.log("already constructed");
        return;
    }
    // create the regex text field and 
    var ig = parent.append("div").attr("class", "input-group");
    ig.append("input").classed("form-control", true)
            .attr("type", "text")
            .attr("placeholder", "Enter pattern (regular expression)")
            .attr("id", "ws-patterns-text")
            .attr("aria-describedby", "basic-addon2");
    var igspan = ig.append("span").classed("input-group-btn", true);
    igspan.append("button").classed("btn btn-default", true)
            .attr("type", "button").html("Find pattern");
    // create the output field    
    parent.append("div").classed("ws-AB", true);

    //attach handlers for the input text and buttons
    ig.select("input").on('keyup', ws.runPatterns);
    ig.select("button").on('click', ws.runPatterns);
};


/* ==========================================================================
 * Init App
 * ========================================================================== */

/**
 * Initialize the page upon load
 * 
 * (Add event handlers, update the page)
 * 
 */
document.addEventListener("DOMContentLoaded", function () {
    // setup the page
    ws.builders.makeWidgets();
    // handle internal a links hidden by navbar    
    window.addEventListener("hashchange", function () {
        scrollBy(0, -55);
    });
    // handle window key events
    document.addEventListener("keydown", function (e) {
        // run load on F3, run analysis on F4
        if (e.keyCode === 114)
            ws.loadText();
        if (e.keyCode === 115)
            ws.runAnalysis();
    });
    d3.select("#ws-textarea").on('keyup', function (e) {
        if (ws.age >= 0 && ws.age < 5) {
            ws.age++;
            d3.select("#ws-run").text("Re-run analysis (F4)");
        }
    });
    // handle file buttons and analysis run
    d3.select("#ws-load-btn").on('click', ws.loadText);
    d3.select("#ws-load-browse").on('click', ws.loadBrowse);
    d3.select("#ws-load-file").on('change', ws.updateURL);
    d3.select("#ws-save").on('click', ws.saveText);
    d3.select("#ws-run").on('click', ws.runAnalysis);
});


/**
 * Perform analysis. Script runs multiple components in turn.
 */
ws.runAnalysis = function () {
    // get the text from the textbox
    var nowtext = gId("ws-textarea").value;
    // run the tokenizing
    ws.tokens = ws.tokenize(nowtext);
    if (ws.settings.latex) {
        ws.tokens = ws.filterLatex(ws.tokens);
    }
    ws.tokens = ws.filterDocument(ws.tokens);
    ws.words = ws.tokens2words(ws.tokens)
            .filter(ws.nonempty)
            .map(function (x) {
                return x.toLowerCase();
            });
    // run the inidvidual analyses    
    ws.runOverview();
    ws.runStructure();
    ws.runFreqWords();
    ws.runKmers();
    ws.runPatterns();
    d3.select(".ws-analysis .ws-widget").style("display", "inherit");
    d3.select(".ws-analysis .ws-anno").style("display", "none");
    ws.age = 0;
    d3.select("#ws-run").text("Analysis ready!");
};


/* ==========================================================================
 * Loading of text
 * ========================================================================== */

/* 
 * invoked when file input changes status 
 */
ws.updateURL = function () {
    gId("ws-load-url").value = "file::" + gId('ws-load-file').value;
    ws.loadText();
};


/*
 *  invoked when user presses browse button  
 */
ws.loadBrowse = function () {
    var fileinput = gId("ws-load-file");
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, false);
    fileinput.dispatchEvent(evt);
};


/*
 *  invoked when user presses button to load data from URL/file
 */
ws.loadText = function () {
    // start by processing the textbox
    var url = gId("ws-load-url").value;
    if (url === "")
        return;
    var ta = gId("ws-textarea");
    if (url.match(/^file::/)) {
        // use a file reader
        url = gId('ws-load-file').files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            ta.value = reader.result;
            ws.runAnalysis();
        };
        reader.readAsText(url);
    } else {
        // use a network request				
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    ta.value = request.responseText;
                } else {
                    ta.value = "Oops! Response: " + request.status;
                }
                ws.runAnalysis();
            }
        };
        request.send(null);
    }
};


/** 
 * Collects info from text area and prompts user to download 
 */
ws.saveText = function () {
    // makes a guess at new filename (from old one)
    var oldfile = gId("ws-load-url").value;
    var newfile = "writingstats.txt";
    if (oldfile.match(/^file::/)) {
        newfile = oldfile.replace(/^file::/, '');
    }
    // collects text area contents and saves
    var tatext = gId("ws-textarea").value;
    var blob = new Blob([tatext], {type: "text/plain;charset=utf-8"});
    saveAs(blob, newfile);
};


/* ==========================================================================
 * Overview widget
 * ========================================================================== */

/**
 *  Perform the simplest overview analysis 
 */
ws.runOverview = function () {
    // always try to initialize the box
    ws.builders.makeOverview();
    // count paragraphs, sentences, words -> update document
    var numparagraphs = ws.countParagraphs(ws.tokens),
            numsentences = ws.countSentences(ws.tokens),
            numwords = ws.countWords(ws.tokens);
    d3.select("#ws-overview-para-count").text(numparagraphs);
    d3.select("#ws-overview-sentence-count").text(numsentences);
    d3.select("#ws-overview-word-count").text(numwords);
};


/* ==========================================================================
 * Document structure widget
 * ========================================================================== */

/**
 *  Perform the counting-per-sentence analysis
 */
ws.runStructure = function () {

    // make sure widget is well-formed 
    ws.builders.makeWidgetAB("#ws-structure", 1);
    ws.builders.makeAnnoBox("#ws-structure");

    // count words per sentence, color by paragraph
    var strdata = [], col = ws.barplot.color, toks = ws.tokens;
    for (var i = 0; i < toks.length; i++) {
        for (var j = 0; j < toks[i].length; j++) {
            strdata.push({"name": strdata.length + 1,
                "value": toks[i][j].length, "color": col[i % 2]});
        }
    }

    // prep click handler (displays plain sentence)
    // d - object (with .value .name, etc
    // bar - object clicked on
    var showsentence = function (d, bar) {
        // highlight the clicked bar
        d3.selectAll("#ws-structure svg rect").attr("stroke", null);
        d3.select(bar).attr("stroke", brst.stroke);
        // fetch sentence and convert into html
        var sentence = ws.getSentence(toks, (+d.name) - 1);
        var abox = d3.select("#ws-structure .ws-anno");
        abox.style("display", "block");
        abox.select("h4").text("Highlighted sentence");
        abox.select("div").text(ws.sanitize(sentence.join(" ")));
    };

    // prepare settings for sentence barplot
    var ww = d3.select("#ws-structure").node().getBoundingClientRect().width;
    var brst = JSON.parse(JSON.stringify(ws.barplot));
    ws.updateObj(brst, {w: ww - 2, h: 120, margin: [8, 25, 40, 55],
        offset: ["-3.5em", "2.5em", "-2.5em"],
        xlab: "Sentence Index", ylab: "No. words"});
    ws.plot.makeBarplotV("#ws-structure .ws-AB", brst, strdata, showsentence);
    // simplify the x axis (filter out odd-numbered sentences)
    var step = strdata.length;
    var step = step > 100 ? step / 8 : step / 16;
    ws.plot.integerTicks("#ws-structure .ws-AB svg .xaxis", Math.ceil(step));
};


/* ==========================================================================
 * Frequent words widget
 * ========================================================================== */

/**
 * Perform frequent-word analysis
 */
ws.runFreqWords = function () {
    // remove an existing graphic withi init
    ws.builders.makeWidgetAB("#ws-freqwords", 2);
    ws.builders.makeAnnoBox("#ws-freqwords");

    // count frequency of all words	
    var toks = ws.tokens;
    var freq = _.countBy(ws.words, ws.thex);
    // count frequency of starting words	
    var startwords = ws.startingWords(toks);
    var startfreq = _.countBy(startwords, ws.thex);
    // helper to prepare an object for barplot
    var obj4barplot = function (x, strict) {
        var y = [];
        for (var key in x) {
            // skip loop if the property is from prototype            
            if (!x.hasOwnProperty(key))
                continue;
            // skip if word is in undesirable , or too infrequent, or just one character		    
            if (strict) {
                if (ws.badwords.indexOf(key) >= 0 || x[key] < 2 || key.length < 2) {
                    continue;
                }
            }
            y.push({"name": key, "value": x[key], "color": ws.barplot.color[0]});
        }
        // sort by decreasing count, return top hits
        y.sort(ws.sortByValue);
        return y.slice(0, Math.min(ws.barmax, y.length));
    };
    // convert into arrays of top words	    
    var freqarr = obj4barplot(freq, true);
    var startarr = obj4barplot(startfreq, false);

    // handler for click behavior on the barplot
    var showsentencesGeneric = function (d, bar, starting) {
        // highlight the clicked bar
        d3.selectAll("#ws-freqwords svg rect").attr("stroke", null);
        d3.select(bar).attr("stroke", brst.stroke);
        var word = d.name;
        var wordre = new RegExp(word, "i");
        // fetch sentence and convert into html
        var sentences = ws.getSentencesContaining(toks, word, starting);
        var html = ws.wrapManyInSpans(sentences, wordre, starting);
        var abox = d3.select("#ws-freqwords .ws-anno");
        abox.style("display", "block");
        abox.select("h4").text("Highlighted words");
        abox.select("div").html(ws.sanitize(html));
    };
    var showsentencesAny = function (d, bar) {
        return showsentencesGeneric(d, bar, false);
    };
    var showsentencesFirst = function (d, bar) {
        return showsentencesGeneric(d, bar, true);
    };

    // prepare settings for barplot
    var ww = d3.select("#ws-freqwords").node().getBoundingClientRect().width / 2;
    var brst = JSON.parse(JSON.stringify(ws.barplot));
    ws.updateObj(brst, {w: ww - 2, h: freqarr.length > 10 ? 280 : 180,
        margin: [60, 25, 15, 90], offset: ["-3.5em", "-2.3em", "-3em"],
        title: "Frequent words", xlab: "(no. occurances)", ylab: ""});

    // make word frequency barplot
    ws.plot.makeBarplotH("#ws-freqwords .ws-A", brst, freqarr, showsentencesAny);

    // adjust the settings for the starting words barplot, then make
    ws.updateObj(brst, {title: "Frequent starting words"});
    ws.plot.makeBarplotH("#ws-freqwords .ws-B", brst, startarr, showsentencesFirst);
    ws.plot.integerTicks("#ws-freqwords svg .xaxis", 1);
};


/* ==========================================================================
 * Analysis for kmers
 * ========================================================================== */

/**
 * Compute an array of object with an enrichment by count
 * 
 * @param index int (identifier of the enrichment neighborhood, e.g. sentence)
 * @param kmers array of kmers in neighborhood
 * @param refcount dictionary of kmer counts in reference set
 * 
 * @returns array of hits
 */
ws.getEnrichmentC = function (index, kmers, refcount) {
    var hits = [];
    // get counts in the input kmerss
    var kcount = _.countBy(kmers, ws.thex);
    for (var key in kcount) {
        if (!kcount.hasOwnProperty(key))
            continue;
        if (kcount[key] > 1) {
            var enrich = kcount[key] / refcount[key];
            hits.push({"kmer": key, "value": enrich, "index": index});
        }
    }
    hits.sort(ws.sortByValue);
    return hits.slice(0, Math.min(ws.barmax, hits.length));
};


/**
 * Get an array of hits using a chisq approach
 * 
 * @param index int, identifier (e.g. paragraph number)
 * @param kmers array of kmers in selection
 * @param refcount dicionary of kmer counts in reference set
 * @param selwords int, number of words in selection
 * @param totwords int, number of wrods in+out of selection
 * @returns 
 */
ws.getEnrichmentChiSq = function (index, kmers, refcount, selwords, totwords) {
    var hits = [];
    // get counts in the input kmerss
    var kcount = _.countBy(kmers, ws.thex);
    for (var key in kcount) {
        // skip if this key is trivial
        if (!kcount.hasOwnProperty(key))
            continue;
        var kk = kcount[key];
        if (kk <= 1)
            continue;
        // compute expected quantities            
        // rows are for hits/nonhits, cols are for in/out selection
        var rowcounts = [refcount[key], totwords - refcount[key]];
        var colcounts = [selwords, totwords - selwords];
        // compute expected contingency table
        var expected = [rowcounts[0] * colcounts[0] / totwords,
            rowcounts[0] * colcounts[1] / totwords,
            rowcounts[1] * colcounts[0] / totwords,
            rowcounts[1] * colcounts[1] / totwords];
        // compute observed matrix                        
        var observed = [kk, refcount[key] - kk, selwords - kk,
            totwords - selwords - refcount[key] + kk];
        var chisq = 0;
        for (var q = 0; q < 4; q++) {
            var temp = (expected[q] - observed[q] - 0.5);
            chisq += temp * temp / expected[q];
        }
        hits.push({"kmer": key, "value": chisq, "index": index});
    }
    hits.sort(ws.sortByValue);
    return hits.slice(0, Math.min(ws.barmax, hits.length));
};


/** 
 * Perform the k-mer counting analysis 
 */
ws.runKmers = function () {

    // initialize the DOM space
    ws.builders.makeWidgetAB("#ws-kmers", 2);
    ws.builders.makeAnnoBox("#ws-kmers");

    // split the tokens into kmers    
    var allkmers = ws.getKmers(ws.tokens, ws.kmerk);
    var refcount = _.countBy(allkmers, ws.thex);
    var toks = ws.tokens;
    var totwords = ws.countWords(toks);

    // collect hits from sentences and paragraphs analysis        
    var si = 0; // counter, sentence index
    var hitsR = [], hitsC = []; // array with hits
    for (var i = 0; i < toks.length; i++) {
        //console.log("Paragraph " + i);
        var parkmers = [];
        var numwords = 0;
        // compute enrichment in sentences                
        for (var j = 0; j < toks[i].length; j++) {
            si++;
            var nowsentence = toks[i][j];
            numwords += nowsentence.length;
            var nowkmers = ws.getKmers(nowsentence, ws.kmerk);
            hitsC = hitsC.concat(ws.getEnrichmentC(si, nowkmers, refcount));
            parkmers = parkmers.concat(nowkmers);
        }
        // compute enrichment in paragraphs        
        hitsR = hitsR.concat(ws.getEnrichmentChiSq(i + 1, parkmers, refcount,
                numwords, totwords));
    }

    hitsC = hitsC.sort(ws.sortByValue).slice(0, Math.min(ws.barmax, hitsC.length));
    hitsR = hitsR.sort(ws.sortByValue).slice(0, Math.min(ws.barmax, hitsR.length));

    // augment the hitsC and hitsR with additional fields
    var aughits = function (ha) {
        for (var i = 0; i < ha.length; i++) {
            ha[i].name = ha[i].kmer + " [" + ha[i].index + "]";
            ha[i].color = ws.barplot.color[0];
        }
    };
    aughits(hitsC);
    aughits(hitsR);

    // click handler to display a sentence with highlighted kmer
    // d - object (with .value .name, etc
    // bar - object clicked on
    var showsentence = function (d, bar) {
        // highlight the clicked bar
        d3.selectAll("#ws-kmers svg rect").attr("stroke", null);
        d3.select(bar).attr("stroke", brst.stroke);
        // fetch sentence and convert into html
        var sentence = ws.getSentence(toks, +d.index - 1);
        sentence = ws.wrapInSpans(sentence, new RegExp(d.kmer, "i"));
        var abox = d3.select("#ws-kmers .ws-anno");
        abox.style("display", "block");
        abox.select("h4").text("Highlighted k-mer in sentence " + d.index);
        abox.select("div").html(ws.sanitize(sentence.join(" ")));
    };
    var showparagraph = function (d, bar) {
        // highlight the clicked bar
        d3.selectAll("#ws-kmers svg rect").attr("stroke", null);
        d3.select(bar).attr("stroke", brst.stroke);
        // fetch sentence and convert into html
        var paragraph = ws.getParagraph(toks, +d.index - 1);
        paragraph = ws.wrapInSpans(paragraph, new RegExp(d.kmer, "i"));
        var abox = d3.select("#ws-kmers .ws-anno");
        abox.style("display", "block");
        abox.select("h4").text("Highlighted k-mer in paragraph " + d.index);
        abox.select("div").html(ws.sanitize(paragraph.join(" ")));
    };

    // prepare one paragraph for sentences
    var ww = d3.select("#ws-kmers").node().getBoundingClientRect().width / 2;
    var brst = JSON.parse(JSON.stringify(ws.barplot));
    ws.updateObj(brst, {w: ww - 2, h: 280,
        margin: [60, 25, 15, 90], offset: ["-3.5em", "-2.3em", "-3em"],
        title: "Simple enrichment", xlab: "in sentences", ylab: ""});
    ws.plot.makeBarplotH("#ws-kmers .ws-A", brst, hitsC, showsentence);

    // prepare second barplot about paragraphs
    brst.xlab = "in paragraphs";
    brst.title = "Chi-squared enrichment";
    ws.plot.makeBarplotH("#ws-kmers .ws-B", brst, hitsR, showparagraph);
};


/* ==========================================================================
 * Patterns
 * ========================================================================== */

/**
 * Activate the regex pattern matching tool
 */
ws.runPatterns = function () {

    // construct the widget
    ws.builders.makePatterns();
    ws.builders.makeAnnoBox("#ws-patterns");

    // clean out the results
    d3.selectAll("#ws-patterns .ws-anno ul").remove();

    // get the requested patterns & matching sentences
    var retext = gId("ws-patterns-text").value;
    if (retext === "") {
        return;
    }
    var re = new RegExp(retext, "i");
    var sentences = ws.getSentencesContaining(ws.tokens, re, false, true);
    var html = ws.wrapManyInSpans(sentences, re, false);

    // add the hits to the output
    var abox = d3.select("#ws-patterns .ws-anno");
    abox.style("display", "block");
    abox.select("h4").text("Sentences matching pattern");
    abox.select("div").html(ws.sanitize(html));
};



/* ==========================================================================
 * Handling for the about page
 * ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // modify the ws-example paragraphs
});


/* ==========================================================================
 * The end
 * ========================================================================== */

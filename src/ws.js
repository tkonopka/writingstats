/** ws.js. Writing Stats. Copyright 2017 Tomasz Konopka **/

/*
 * This is the main word-handling library used in the Writing Stats app.
 * Tests for this library are located in the test/ folder. 
 */

/* global ws */


// this is here so that ws.js can be loaded either before or after ws-web.js
if (typeof ws === "undefined") {
    ws = {};
}


// helper function used during filter (removes empty senteces/words)
ws.nonempty = function (x) {
    return x !== "";
};


// helper to replace and split a string x via character c (preserving c)
ws.replaceWithBar = function (x, c) {
    var special = ["[", "]", "(", ")", ".", "?"];
    if (c.length === 1) {
        var creg = c + "\\s+";
        if (special.indexOf(c) >= 0) {
            creg = "\\" + creg;
        }
        var re = new RegExp(creg, "g");
        return x.replace(re, c + "|");
    } else {
        // apply all character in c
        for (var i = 0; i < c.length; i++) {
            x = ws.replaceWithBar(x, c[i]);
        }
        return x;
    }
};


/**
 * Tokenize a strings s into paragraphs, sentences, and tokens.
 * 
 * @param s input string
 * @returns a three-level array.
 */
ws.tokenize = function (s) {
    if (s === null) {
        s = "";
    }
    var paragraphs = s.trim().split(/\n\n+/);
    var tokens = [];
    for (var i = 0; i < paragraphs.length; i++) {
        tokens[i] = [];
        var sentences = ws.replaceWithBar((paragraphs[i] + " "), ".?!");
        sentences = sentences.split(/\|/).filter(ws.nonempty);
        for (var j = 0; j < sentences.length; j++) {
            var temp = ws.replaceWithBar(sentences[j], ".,?!:;\"\'[]{}()");
            tokens[i][j] = temp.split(/\s|\|/).filter(ws.nonempty);
        }
    }
    return tokens;
};


/**
 * Get string with first token.  
 * 
 * @param tokens array with sentence, paragraph, or document.
 * @returns string or null
 */
ws.getFirstToken = function (tokens) {
    if (typeof tokens === "string") {
        return tokens;
    }
    // here assume tokens is an array
    if (tokens.length === 0) {
        return null;
    }
    return ws.getFirstToken(tokens[0]);
};


/**
 * Get a simple array of all starting words in sentences
 * 
 * @param tokens nested array of all tokens (like returned by ws.tokenize)
 * @returns simple array of first-words in sentences.
 */
ws.startingWords = function (tokens) {
    var starting = [];
    for (var i = 0; i < tokens.length; i++) {
        for (var j = 0; j < tokens[i].length; j++) {
            // here tokens[i][j] holds an array of tokens for one sentence
            var sentence = ws.tokens2words(tokens[i][j]).filter(ws.nonempty);
            if (sentence.length > 1) {
                starting.push(sentence[0]);
            }
        }
    }
    return starting;
};


/**
 * Recursively convert a nested array of tokens into a simple array of words 
 * 
 * @param a string or array
 * @returns simple array of strings 
 */
ws.tokens2words = function (a) {
    var nonletter = /[.,\?!;\:"'\[\]\(\)\{\}><]/g;
    if (typeof a === "string") {
        return a.replace(nonletter, '');
    }
    if (typeof a === "undefined") {
        return a;
    }
    var result = [];
    a.map(function (x) {
        result = result.concat(ws.tokens2words(x));
    });
    return result.filter(ws.nonempty);
};


/**
 * Helper regex for detecting string with at least one alphanumeric character
 * 
 * @type RegExp
 */
ws.alphanumeric = new RegExp(/[a-z0-9]/, "i");


/**
 * Filter tokens that seem to be latex. 
 * 
 * @param tokens a nested array as output by tokenize()
 * @returns an array similar to input
 */
ws.filterLatex = function (tokens) {

    // helper to filter one string object
    var f1 = function (x) {
        return !(x[0] === '\\' || x.match(ws.alphanumeric) === null);
    };

    var result = [];
    // loop over paragraphs
    for (var i = 0; i < tokens.length; i++) {
        result[i] = [];
        // loop over sentences        
        for (var j = 0; j < tokens[i].length; j++) {
            var nowwords = tokens[i][j].filter(f1);
            if (nowwords.length > 0) {
                result[i].push(nowwords);
            }
        }
    }

    // here can have some paragraphs that are empty, get rid of them
    result = result.filter(function (y) {
        return ws.countWords(y) > 0;
    });
    // but if result is all empty, need to reset to nested array
    if (ws.countParagraphs(result) === 0) {
        result = [[[]]];
    }

    return result;
};


/**
 * Filter document 
 *  - remove paragraphs that begin with comment characters
 *  - cut document to paragraphs between start and end markers
 * 
 * @param tokens a nested array as output by tokenize()
 * @param commentchars array of starting characters that signal comment
 * 
 * @param startmarker string that, if present at start of paragraph, signals
 * to ignore everything before the marker
 * @param endmarker string that, if present at start of paragraph, signals to 
 * skip over remaining tokens
 * 
 * @returns an array similar to input
 */
ws.filterDocument = function (tokens, commentchars = ["%", "#", "```"],
        startmarker = "%start%", endmarker = "%end%") {

    var toklen = tokens.length;

    // create regex for comments
    commentchars = commentchars.map(function(x) {
        return "^"+x;
    });
    var commentre = new RegExp(commentchars.join("|"));
                
    // look for start marker in the document
    var startparagraph = 0;
    for (var i = 0; i < toklen; i++) {
        var first = ws.getFirstToken(tokens[i]);
        if (first === startmarker) {
            startparagraph = i + 1;
            break;
        }
    }

    // loop over paragraphs, from start to real-end or end-marker
    var result = [];
    for (var i = startparagraph; i < toklen; i++) {
        var first = ws.getFirstToken(tokens[i]);
        if (first === endmarker) {
            break;
        }
        if (commentchars.length > 0 && commentre.test(first)) {
            continue;
        }
        result[result.length] = tokens[i];
    }

    // but if result is all empty, need to reset to nested array
    if (ws.countParagraphs(result) === 0) {
        result = [[[]]];
    }
    return result;
};


/*
 * Fetch one sentence from a tokens object.
 * 
 * @param tokens nested array of tokens (by tokenize())
 * @param index int, determines which sentence to return.
 * @returns array of tokens making up a sentence
 */
ws.getSentence = function (tokens, index) {
    // traverse tokens array linearly, one para and one sentence at a time
    var s = 0;
    for (var i = 0; i < tokens.length; i++) {
        for (var j = 0; j < tokens[i].length; j++) {
            if (s === index) {
                return tokens[i][j];
            }
            s++;
        }
    }
    return null;
};


/**
 * Fetch one paragraph from a tokens object. Return as one array only.
 * 
 * @param {type} tokens nested array as output by tokenize()
 * @param {type} index paragraph identifier
 * @returns simple array with all the tokens.
 */
ws.getParagraph = function (tokens, index) {
    var result = [];
    tokens[index].map(function (x) {
        result = result.concat(x);
    });
    return result;
};


/**
 * Helper function to getSentencesContaining
 * 
 * @param a simple array (not nested)
 * @param  target string or regexp
 * @param starting - check only first word?
 * @param lowercase - check case insensitive?
 * @returns true/false
 */
ws.isSentenceMatch = function (a, target, starting = true, lowercase = true) {

    // prep the input array
    a = ws.tokens2words(a);
    if (lowercase) {
        a = a.map(function (x) {
            return x.toLowerCase();
        });
    }

    // process differently for strings and regex, starting or inside sentence
    if (typeof target === "string") {
        if (lowercase) {
            target = target.toLowerCase();
        }
        if (starting) {
            return a[0] === target;
        } else {
            var hits = a.filter(function (x) {
                return x === target;
            });
            return hits.length > 0;
        }
    } else {
        if (starting) {
            return a[0].match(target) !== null;
        } else {
            var hits = a.filter(function (x) {
                return x.match(target) !== null;
            });
            return hits.length > 0;
        }
}
};


/**
 * Fetches all sentences that contain a word
 * 
 * @param tokens nested array as output by tokenize()
 * @param target string or regex, 
 * if string, interpreted as exact word to look for
 * if regex, interpreted in terms of pattern matching
 * @param starting boolean, set true to match first words only.
 * @param lowercase boolean, set true to force word comparison all-in-lowercase
 * @returns {undefined}
 */
ws.getSentencesContaining = function (tokens, target, starting = true,
        lowercase = true) {

    var result = [];
    for (var i = 0; i < tokens.length; i++) {
        for (var j = 0; j < tokens[i].length; j++) {
            var a = tokens[i][j];
            if (ws.isSentenceMatch(a, target, starting, lowercase)) {
                result.push(a);
            }
        }
    }
    return result;
};


/**
 * Counts the number of paragraphs
 * 
 * @param tokens nested array as returned by tokenize
 * @returns int number of paragraphs
 */
ws.countParagraphs = function (tokens) {
    if (tokens.length === 1 && ws.countWords(tokens) === 0) {
        return 0;
    }
    return tokens.length;
};


/**
 * Counts the number of sentences
 * 
 * @param tokens nested array as returned by tokenize 
 * @returns int number of sentences
 */
ws.countSentences = function (tokens) {
    var x = 0;
    for (var i = 0; i < tokens.length; i++) {
        // beware of sentences with no words.
        if (tokens[i][0].length > 0) {
            x += tokens[i].length;
        }
    }
    return x;
};


/**
 * Counts the number of words
 * 
 * @param tokens nested array as returned by tokenize 
 * @returns int number of sentences
 */
ws.countWords = function (tokens) {
    var x = 0;
    for (var i = 0; i < tokens.length; i++) {
        var nowsentences = tokens[i].length;
        for (var j = 0; j < nowsentences; j++) {
            x += tokens[i][j].length;
        }
    }
    return x;
};


/**
 * Extract all kmers from words 
 * 
 * @param words nested array of words
 * @param k int, length of kmer
 * @returns simple array containing all kmers
 */
ws.getKmers = function (words, k) {
    // for a simple string
    if (typeof words === "string") {
        words = ws.tokens2words(words);
        var result = [];
        if (words.length <= k) {
            result.push(words);
        } else {
            var imax = words.length - k + 1;
            for (var i = 0; i < imax; i++) {
                result.push(words.slice(i, i + k));
            }
        }
        return result;
    }

    // if words is an array, concatenate the results
    var result = [];
    for (var i = 0; i < words.length; i++) {
        result = result.concat(ws.getKmers(words[i], k));
    }
    return result;
};


/* ==========================================================================
 * End of library. Here testing.
 * ========================================================================== */

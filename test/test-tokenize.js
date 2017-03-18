/** Unit tests for tokenizing */

/* global ws */

require("../src/ws.js");
var assert = require('assert');


/* ==========================================================================
 * ws.tokenize
 * ========================================================================== */

describe('Tokenize:', function () {

    describe('null', function () {
        it('should give empty nesting', function () {
            var result = ws.tokenize(null);
            var expected = [[[]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('empty string', function () {
        it('should give empty nested array', function () {
            var result = ws.tokenize("");
            var expected = [[[]]];
            assert.deepEqual(expected, result);
        });
    });

    describe('whitespace string', function () {
        it('should give empty nested array', function () {
            var result = ws.tokenize(" ");
            var expected = [[[]]];
            assert.deepEqual(expected, result);
        });
    });

    describe('one word', function () {
        it('should give one sentence', function () {
            var result = ws.tokenize("bob");
            var expected = [[["bob"]]];
            assert.deepEqual(expected, result);
        });
    });

    describe('two words', function () {
        it('should give one sentence', function () {
            var result = ws.tokenize("Bob ate.");
            var expected = [[["Bob", "ate."]]];
            assert.deepEqual(expected, result);
        });
    });

    describe('Two sentences', function () {
        it('should give two arrays', function () {
            var result = ws.tokenize("Bob ate. Sally drank.");
            var expected = [[["Bob", "ate."], ["Sally", "drank."]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('Single line breaks and weird spaces', function () {
        it('should now break sentences', function () {
            var result = ws.tokenize("Bob\n  ate    pizza.");
            var expected = [[["Bob", "ate", "pizza."]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('Two paragraphs, two sentences', function () {
        it('should give nesting', function () {
            var result = ws.tokenize("Bob ate.\n\nSally drank.");
            var expected = [[["Bob", "ate."]], [["Sally", "drank."]]];
            assert.deepEqual(result, expected);
        });
    });

});


/* ==========================================================================
 * ws.tokenize and ws.filterLatex
 * ========================================================================== */

describe('Tokenize and filter:', function () {

    var textlatex0 = "\\documentclass[a4paper,10pt] \n\n\\usepackage{color}\n";
    var textlatex1 = "\\begin{document} One sentence \\end{document}";
    var textlatex2 = "\\begin{document}\n\n\\bfOne \\bfsentence. \n\n ";
    textlatex2 += "Two.\n\nThree \\bf{ Four } \\end{document}";

    describe('latex commands', function () {
        it('should be ignored', function () {
            var result = ws.filterLatex(ws.tokenize(textlatex0));
            var expected = [[[]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('latex commands surrounding text', function () {
        it('should give plain text', function () {
            var result = ws.filterLatex(ws.tokenize(textlatex1));
            var expected = [[["One", "sentence"]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('latex commands forming strange sentences', function () {
        it('should give plain text', function () {
            var result = ws.filterLatex(ws.tokenize(textlatex2));
            var expected = [[["Two."]], [["Three", "Four"]]];
            assert.deepEqual(result, expected);
        });
    });

});


/* ==========================================================================
 * ws.tokenize and ws.filterComments
 * ========================================================================== */

describe('Tokenize and remove comments:', function () {

    var textC = "I am.\n\n##Comment\n\n%Another comment. \n\nYou are.";
    var textE = "I am.\n\n##Comment\n\n%end% comment? \n\nYou are.";
    var textSE = "I am.\n\n#ABC\n\n%start% \n\nYou are.\n\n%end%\n\nHe is.";
    var textNE = "%end% \n\n I am.\n\n You are.";
    var textK = "I am.\n\n```{r}\nx=5\n```\n\n You are.";
    var tokensC = ws.tokenize(textC);    
    var tokensE = ws.tokenize(textE);
    var tokensSE = ws.tokenize(textSE);    
    var tokensNE = ws.tokenize(textNE); 
    var tokensK = ws.tokenize(textK); 

    describe('fetching first token in document', function () {
        it('should give simple string', function () {
            var result = ws.getFirstToken(tokensC);
            var expected = "I";
            assert.deepEqual(result, expected);
        });
    });
    
    describe('fetching first token in paragraph', function () {
        it('should give simple string', function () {
            var result = ws.getFirstToken(tokensC[1]);
            var expected = "##Comment";
            assert.deepEqual(result, expected);
        });
    });

    describe('paragraphs with comments', function () {
        it('should disappear', function () {
            var result = ws.filterDocument(tokensC);
            var expected = [[["I", "am."]],[["You", "are."]]];
            assert.deepEqual(result, expected);
        });
    });
    
    describe('paragraphs with knitr', function () {
        it('should disappear', function () {
            var result = ws.filterDocument(tokensK);
            var expected = [[["I", "am."]], [["You", "are."]]];
            assert.deepEqual(result, expected);
        });
    });
    
    describe('paragraphs after end marker', function () {
        it('should disappear', function () {
            var result = ws.filterDocument(tokensE);
            var expected = [[["I", "am."]]];
            assert.deepEqual(result, expected);
        });
    });
       
    describe('document with start and end markers', function () {
        it('should give sub document', function () {
            var result = ws.filterDocument(tokensSE);            
            var expected = [[["You", "are."]]];
            assert.deepEqual(result, expected);
        });
    });

    describe('document starting with end marker', function () {
        it('should give empty document', function () {
            var result = ws.filterDocument(tokensNE);
            var expected = [[[]]];
            assert.deepEqual(result, expected);
        });
    });

});


/* ==========================================================================
 * ws.tokens2words
 * ========================================================================== */

describe('Tokens-to-words conversion:', function () {

    var textA = "Bob ate rice, beans, and greens.";            
    var textB = "Alex exclaimed: \"Wow!\" ";            
    var textC = "Math? a < b";    
        
    var tokensA = ws.tokenize(textA);    
    var tokensB = ws.tokenize(textB);    
    var tokensC = ws.tokenize(textC);    
    
    describe('commas and periods', function () {
        it('should disappear', function () {
            var result = ws.tokens2words(tokensA);
            var expected = ["Bob", "ate", "rice", "beans", "and", "greens"];
            assert.deepEqual(result, expected);
        });
    });

    describe('other characters', function () {
        it('should disappear', function () {
            var result = ws.tokens2words(tokensB);
            var expected = ["Alex", "exclaimed", "Wow"];
            assert.deepEqual(result, expected);
        });
    });

    describe('math expressions', function () {
        it('should be cleaned', function () {
            var result = ws.tokens2words(tokensC);
            var expected = ["Math", "a", "b"];
            assert.deepEqual(result, expected);
        });
    });

});


/* ==========================================================================
 * ws.startingWords
 * ========================================================================== */

describe('Starting words:', function () {

    var textA = "Bob one. Sally two.";
    var textB = "Bob ate.\n\nSally, drank.\n\nAlex did not. Joe was last.";
    var tokensA = ws.tokenize(textA);
    var tokensB = ws.tokenize(textB);

    describe('empty string', function () {
        it('should give empty array', function () {
            var result = ws.startingWords(ws.tokenize(""));
            var expected = [];
            assert.deepEqual(result, expected);
        });
    });

    describe('one paragraph', function () {
        it('should give simple array', function () {
            var result = ws.startingWords(tokensA);
            var expected = ["Bob", "Sally"];
            assert.deepEqual(result, expected);
        });
    });

    describe('multiple paragraphs', function () {
        it('should give simple array', function () {
            var result = ws.startingWords(tokensB);
            var expected = ["Bob", "Sally", "Alex", "Joe"];
            assert.deepEqual(result, expected);
        });
    });

});
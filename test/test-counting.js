/** Unit tests for sentence and paragraph manipualtions */

/* global ws */

require("../src/ws.js");
var assert = require('assert');


/* ==========================================================================
 * ws.countParagraphs, ws.countSentences, ws.countWords
 * ========================================================================== */

describe('Counting', function () {

    var text0 = "";
    var text1 = "Hello there.";
    var text2 = "Hello there. My name is XYZ.\n\nSecond paragraph.";
    var text3 = "Hello there.\nMy name is XYZ.\n\nSecond\n paragraph.";
    text3 += "\n\n\nThird.\n\n\n";

    var tokens0 = ws.tokenize(text0);
    var tokens1 = ws.tokenize(text1);
    var tokens2 = ws.tokenize(text2);
    var tokens3 = ws.tokenize(text3);

    describe('empty text', function () {
        it('should give zero counts', function () {            
            assert.deepEqual(0, ws.countParagraphs(tokens0));
            assert.deepEqual(0, ws.countSentences(tokens0));
            assert.deepEqual(0, ws.countWords(tokens0));
        });
    });

    describe('simple text', function () {
        it('should give simple counts', function () {
            assert.deepEqual(1, ws.countParagraphs(tokens1));
            assert.deepEqual(1, ws.countSentences(tokens1));
            assert.deepEqual(2, ws.countWords(tokens1));
        });
    });

    describe('long text', function () {
        it('should also give simple counts', function () {
            assert.deepEqual(2, ws.countParagraphs(tokens2));
            assert.deepEqual(3, ws.countSentences(tokens2));
            assert.deepEqual(8, ws.countWords(tokens2));
        });
    });

    describe('longer text', function () {
        it('should also give simple counts', function () {
            assert.deepEqual(3, ws.countParagraphs(tokens3));
            assert.deepEqual(4, ws.countSentences(tokens3));
            assert.deepEqual(9, ws.countWords(tokens3));
        });
    });

});


/* ==========================================================================
 * ws.getSentence, ws.getParagraph
 * ========================================================================== */

describe('Extracting', function () {
    
    var textA = "Hello there.";
    var textB = "Hello there. My name is XYZ.\n\nSecond paragraph.";
    var textC = "Hello there.\nMy name is XYZ.\n\nSecond\n paragraph.";
    textC += "\n\n\nThird.\n\n\n";

    var tokensA = ws.tokenize(textA);
    var tokensB = ws.tokenize(textB);
    var tokensC = ws.tokenize(textC);    

    describe('single sentence', function () {
        it('should return array', function () {
            var result = ws.getSentence(tokensA, 0);
            var expected = ["Hello", "there."];
            assert.deepEqual(expected, result);            
        });
    });
    
    describe('sentences from paragraphs', function () {
        it('should also return arrays', function () {
            var result = ws.getSentence(tokensB, 0);
            var expected = ["Hello", "there."];
            assert.deepEqual(expected, result);
            
            var result = ws.getSentence(tokensB, 2);
            var expected = ["Second", "paragraph."];
            assert.deepEqual(expected, result);                        
        });
    });

   describe('getting paragraph', function () {
        it('should return simple arrays', function () {
            var result = ws.getParagraph(tokensB, 0);
            var expected = ["Hello", "there.", "My", "name",  "is","XYZ."];
            assert.deepEqual(expected, result);
            
            var result = ws.getParagraph(tokensB, 1);
            var expected = ["Second", "paragraph."];
            assert.deepEqual(expected, result);                        
        });
    });
       
});

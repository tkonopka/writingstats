/** Unit tests for k-mer counting */

/* global ws */

require("../src/ws.js");
var assert = require('assert');


/* ==========================================================================
 * ws.getKmers
 * ========================================================================== */

describe('K-mers', function () {

    describe('short words', function () {
        it('should give back whole word', function () {
            var result = ws.getKmers("Bob", 5);
            var expected = ["Bob"];
            assert.deepEqual(expected, result);
        });
    });

    describe('long words', function () {
        it('should give an array', function () {
            var result = ws.getKmers("verylong", 5);
            var expected = ["veryl", "erylo", "rylon", "ylong"];
            assert.deepEqual(expected, result);
        });
    });

    describe('array of words', function () {
        it('should give simple array or kmers', function () {
            var result = ws.getKmers(["one", "seven"], 4);
            var expected = ["one", "seve", "even"];
            assert.deepEqual(expected, result);
        });
    });

    describe('nested array of words', function () {
        it('should give nested array or kmers', function () {
            var result = ws.getKmers([["two"], ["one", "seven"]], 4);
            var expected = ["two", "one", "seve", "even"];
            assert.deepEqual(expected, result);
        });
    });

    describe('repeat words', function () {
        it('should give non-unique kmers', function () {
            var result = ws.getKmers(["bobby", "bobbo"], 4);
            var expected = ["bobb", "obby", "bobb", "obbo"];
            assert.deepEqual(expected, result);
        });
    });

});

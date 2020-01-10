import { equal } from "assert";
import { hasChar } from "../src/public/js/utils";

describe("hasChar", function() {
    describe("#hasChar(a: string)", function() {
        it("should return true when input is ABC", function() {
            equal(hasChar("ABC"), true);
        });
        it("should return true when input is DEFG", function() {
            equal(hasChar("DEFG"), true);
        });
        it("should return false when input is empty", function() {
            equal(hasChar(""), false);
        });
        it("should return false when input is '   '(3 spaces)", function() {
            equal(hasChar("   "), false);
        });
        it("should return false when input is '		'(two tabs)", function() {
            equal(hasChar("		"), false);
        });
        it("should return false when input is '   		'(3 spaces and two tabs)", function() {
            equal(hasChar("   		"), false);
        });
        it("should return true when input is 'a   '(3 spaces)", function() {
            equal(hasChar("a   "), true);
        });
        it("should return true when input is '	b	'(two tabs)", function() {
            equal(hasChar("	b	"), true);
        });
        it("should return true when input is '   		c'(3 spaces and two tabs)", function() {
            equal(hasChar("   		c"), true);
        });
    });
});

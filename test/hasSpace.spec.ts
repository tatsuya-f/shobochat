import { equal } from "assert";
import { hasSpace } from "../src/public/js/messageHandler";
describe("hasSpace", function() {
    describe("#hasSpace(a: string)", function() {
        it("should return true when input is ABC", function() {
            equal(hasSpace("ABC"), true);
        });
        it("should return true when input is DEFG", function() {
            equal(hasSpace("DEFG"), true);
        });
        it("should return false when input is empty", function() {
            equal(hasSpace(""), false);
        });
        it("should return false when input is '   '(3 spaces)", function() {
            equal(hasSpace("   "), false);
        });
        it("should return false when input is '		'(two tabs)", function() {
            equal(hasSpace("		"), false);
        });
        it("should return false when input is '   		'(3 spaces and two tabs)", function() {
            equal(hasSpace("   		"), false);
        });
        it("should return true when input is 'a   '(3 spaces)", function() {
            equal(hasSpace("a   "), true);
        });
        it("should return true when input is '	b	'(two tabs)", function() {
            equal(hasSpace("	b	"), true);
        });
        it("should return true when input is '   		c'(3 spaces and two tabs)", function() {
            equal(hasSpace("   		c"), true);
        });
    });
});

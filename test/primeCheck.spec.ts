import { equal } from "assert";
import { primeCheck } from "../src/primeCheck";

describe("escapeHTML", function() {
    describe("#primeCheck(num: number)", function() {
        it("should return false when input is 0", function() {
            equal(primeCheck(0), false);
        });
        it("should return true when input is 2", function() {
            equal(primeCheck(2), true);
        });
        it("should return false when input is 4 ", function() {
            equal(primeCheck(4), false);
        });
        it("should return true when input is 13 ", function() {
            equal(primeCheck(13), true);
        });
        it("should return true when input is 1000000007 ", function() {
            equal(primeCheck(1000000007), true);
        });
        


    });
});

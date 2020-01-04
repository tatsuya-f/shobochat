import { strictEqual } from "assert";
import { isPrime, extractNumFromPrimeQ } from "../src/server/handler/primeHandler";

describe("check; about prime", () => {
    describe("#isPrime(num: number)", () => {
        it("should return false when input is 0", () => {
            strictEqual(isPrime(0), false);
        });
        it("should return true when input is 2", () => {
            strictEqual(isPrime(2), true);
        });
        it("should return false when input is 4 ", () => {
            strictEqual(isPrime(4), false);
        });
        it("should return true when input is 13 ", () => {
            strictEqual(isPrime(13), true);
        });
        it("should return true when input is 1000000007 ", () => {
            strictEqual(isPrime(1000000007), true);
        });
    });
    describe("check; is text question about prime", () => {
        it("get number", () => {
            strictEqual(extractNumFromPrimeQ("10は素数ですか？"), 10);
            strictEqual(extractNumFromPrimeQ("300004って素数ですか？"), 300004);
            strictEqual(extractNumFromPrimeQ("1は素数?"), 1);
            strictEqual(extractNumFromPrimeQ("101って素数?"), 101);
            strictEqual(extractNumFromPrimeQ("qは素数ですか？"), null);
            strictEqual(extractNumFromPrimeQ("１０は素数なの?"), null);
        });
    });
});


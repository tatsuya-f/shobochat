import { equal } from "assert";
import { escapeHTML } from "../src/common/validate";

describe("escapeHTML", () => {
    describe("#escapeHTML(str: string)", () => {
        it("should return ABC when input is ABC", () => {
            equal(escapeHTML("ABC"), "ABC");
        });
        it("should return DEFG when input is DEFG", () => {
            equal(escapeHTML("DEFG"), "DEFG");
        });
        it("should return &amp; when input is & ", () => {
            equal(escapeHTML("&"), "&amp;");
        });
        it("should return &#x27; when input is ' ", () => {
            equal(escapeHTML("'"), "&#x27;");
        });
        it("should return &#x60; when input is ` ", () => {
            equal(escapeHTML("`"), "&#x60;");
        });
        it("should return &quot; when input is \" ", () => {
            equal(escapeHTML("\""), "&quot;");
        });
        it("should return &lt; when input is < ", () => {
            equal(escapeHTML("<"), "&lt;");
        });
        it("should return &quot; when input is > ", () => {
            equal(escapeHTML(">"), "&gt;");
        });
    });
});

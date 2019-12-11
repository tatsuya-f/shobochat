import { equal } from "assert";
import { escapeHTML } from "../src/public/js/messageHandler";

describe("escapeHTML", function() {
    describe("#escapeHTML(str: string)", function() {
        it("should return ABC when input is ABC", function() {
            equal(escapeHTML("ABC"), "ABC");
        });
        it("should return DEFG when input is DEFG", function() {
            equal(escapeHTML("DEFG"), "DEFG");
        });
        it("should return &amp; when input is & ", function() {
            equal(escapeHTML("&"), "&amp;");
        });
        it("should return &#x27; when input is ' ", function() {
            equal(escapeHTML("'"), "&#x27;");
        });
        it("should return &#x60; when input is ` ", function() {
            equal(escapeHTML("`"), "&#x60;");
        });
        it("should return &quot; when input is \" ", function() {
            equal(escapeHTML("\""), "&quot;");
        });
        it("should return &lt; when input is < ", function() {
            equal(escapeHTML("<"), "&lt;");
        });
        it("should return &quot; when input is > ", function() {
            equal(escapeHTML(">"), "&gt;");
        });


    });
});

import { strictEqual } from "assert";
import { isValidChannelName, isValidUsername, isValidUserpass } from "../src/common/validate";

describe("isValid", () => {
    describe("#isValidChannelName", () => {
        it("'': invalid", () => {
            strictEqual(isValidChannelName(""), false);
        });
        it("'A': valid", () => {
            strictEqual(isValidChannelName("A"), true);
        });
        it("'123': valid", () => {
            strictEqual(isValidChannelName("123"), true);
        });
        it("':abcd:': valid : can use alpha numeric", () => {
            strictEqual(isValidChannelName(":abcd:"), false);
        });
        it("'a_cd:': valid", () => {
            strictEqual(isValidChannelName("a_cd"), true);
        });
        it("'a-cd:': valid", () => {
            strictEqual(isValidChannelName("a-cd"), false);
        });
        it("'(^_^)': invalid", () => {
            strictEqual(isValidChannelName("(^_^)"), false);
        });
        it("'(^_^)': invalid : too long", () => {
            strictEqual(isValidChannelName("(^_^)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"), false);
        });
    });
    describe("#isValidUsername", () => {
        it("'': invalid", () => {
            strictEqual(isValidUsername(""), false);
        });
        it("'A': valid", () => {
            strictEqual(isValidUsername("A"), true);
        });
        it("'123': valid", () => {
            strictEqual(isValidUsername("123"), true);
        });
        it("':abcd:': valid", () => {
            strictEqual(isValidUsername(":abcd:"), true);
        });
        it("'a_cd:': valid", () => {
            strictEqual(isValidUsername("a_cd"), true);
        });
        it("'a-cd:': valid", () => {
            strictEqual(isValidUsername("a-cd"), true);
        });
    });
    describe("#isValidUserpass", () => {
        it("'': invalid", () => {
            strictEqual(isValidUserpass(""), false);
        });
        it("'A': valid: too short", () => {
            strictEqual(isValidUserpass("A"), false);
        });
        it("'12345': valid", () => {
            strictEqual(isValidUserpass("12345678"), true);
        });
        it("':abcd:': valid", () => {
            strictEqual(isValidUserpass(":abcd:abcd"), true);
        });
        it("'a_cd@daf:': valid", () => {
            strictEqual(isValidUserpass("a_cd@daf"), true);
        });
        it("'a-dasfewcd:': valid", () => {
            strictEqual(isValidUserpass("a-dasfewcd"), true);
        });
        it("'(^_^)': valid", () => {
            strictEqual(isValidUserpass("(^_^)yahoooo"), true);
        });
        it("'(^_^)': invalid : too long", () => {
            strictEqual(isValidChannelName("(^_^)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"), false);
        });
    });
});

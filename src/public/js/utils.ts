import * as MarkdownIt from "markdown-it";
import { highlight } from "highlight.js";
import * as sanitizeHtml from "sanitize-html";
//@ts-ignore
import * as fa from "markdown-it-fontawesome";  // There are no type definition files

const markdownit = new MarkdownIt({
    highlight: (code, lang) => {
        if (typeof lang === "string") {
            try {
                return highlight(lang, code).value;
            }
            catch (err) {
                console.log(err);
                return code;
            }
        } else {
            return code;
        }
    },
    breaks: true,
    linkify: true,
    html: true
}).use(fa);

export function parseMarkdown(md: string): string {
    return sanitizeHtml(markdownit.render(md), {
        allowedTags: [
            "h1", "h2", "h3", "h4", "h5",
            "b", "i", "strong", "em", "strike", "del", "blockquote", "s",
            "pre", "p", "div", "code", "span",
            "tr", "th", "td", "ol", "li", "ul", "table", "thead", "tbody",
            "br",
            "a", "img", "details", "summary"],
        allowedAttributes: {
            "a": ["href"],
            "i": ["class"],
            "span": ["style", "class"],
            "code": ["class"],
        },
    });
}

export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

export function changeTimeFormat(time : Date): string {
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hour = time.getHours();
    const minites = time.getMinutes();

    return (year + "<sub>ねん</sub>" +
            month + "<sub>がつ</sub>" +
            day + "<sub>にち</sub>" +
            hour + "<sub>じ</sub>" +
            minites + "<sub>ふん</sub>");
}


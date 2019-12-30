import { Message } from "./Message";
import * as MarkdownIt from "markdown-it";
import { highlight } from "highlight.js";
import * as sanitizeHtml from "sanitize-html";

export class HTTPHandler {
    url: string = "/messages"
    async get(messageId: string): Promise<Message> {
        const res = await fetch(`${this.url}/${messageId}`, {
            method: "GET",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error(`Failed to get Message whose id is ${messageId}`);
        }
    }
    async post(content: string): Promise<number> {
        const res = await fetch(this.url, {
            method: "POST",
            body: JSON.stringify({ content: content }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async delete(messageId: string): Promise<number> {
        const res = await fetch(`${this.url}/${messageId}`, {
            method: "DELETE",
            headers: {
                "Content-Length": "0"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
    async put(messageId: string, content: string): Promise<number> {
        const res = await fetch(`${this.url}/${messageId}`, {
            method: "PUT",
            body: JSON.stringify({
                content: content
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        });
        return res.status;
    }
}

export const httpHandler = new HTTPHandler();

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
});

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
            "span": ["style", "class"],
            "code": ["class"],
        },
    });
}

export function hasChar(input: string): boolean {
    return input.trim() !== "";
}

export function isValidMessage(message: Message): boolean {
    let isValid = true;
    if (!hasChar(message.name)) {
        isValid = false;
        $("#name").addClass("is-danger");
    }
    else {
        $("#name").removeClass("is-danger");
    }
    if (!hasChar(message.content)) {
        isValid = false;
        $("#message").addClass("is-danger");
    }
    else {
        $("#message").removeClass("is-danger");
    }
    return isValid;
}

export async function sendMessage() {
    const message = $("#message").val();

    if (typeof message === "string" && message !== "") {
        try {
            const status = await httpHandler.post(message);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage.html("メッセージを送信しました");
                $queryMessage.css("color", "black");
                $("#shobo-main").animate({
                    scrollTop: $("#shobo-main")[0].scrollHeight
                });
            } else {
                $queryMessage.html("メッセージを送信できませんでした");
                $queryMessage.css("color", "red");
                console.log("POST Failed");
            }
            $("#send").prop("disabled", true);
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export async function updateMessage() {
    const message = $("#message").val();
    const messageId = $("#input-area").data("message-id");
    if (typeof message === "string" && message !== "") {
        try {
            const status = await httpHandler.put(messageId, message);
            const $queryMessage = $("#queryMessage");
            if (status === 200) {
                $queryMessage.html("メッセージを更新しました");
                $queryMessage.css("color", "black");
            } else {
                $queryMessage.html("メッセージを更新できませんでした");
                $queryMessage.css("color", "red");
                console.log("POST Failed");
            }
            $("#send").prop("disabled", true);
        } catch (err) {
            console.log(err);
        }
    }
    $("#message").val("");
}

export function showMessages(messages: Array<Message>) {
    const $messageList = $("#messageList");
    $messageList.empty();
    messages.forEach((message) => {
        if (message.time !== undefined) {
            const time = new Date(message.time);
            const displayTime = changeTimeFormat(time);
            const messageTag = `\
                <div class="shobo-message-div" \
                     data-message-id=${message.id}> \
                    <span style="font-size: 40px;"> \
                        <i class="fas fa-user-circle"></i> \
                    </span>
                    <span class="shobo-name"> \
                        ${escapeHTML(message.name)} \
                    </span> \
                    <span class="shobo-time"> \
                        ${displayTime} \
                    </span> \
                    <div class="content shobo-message"> \
                        ${parseMarkdown(message.content)} \
                    </div> \
                </div>`;
            $messageList.prepend(messageTag);
        }
    });
}

export async function removeMessage(messageId: string): Promise<void> {
    const status = await httpHandler.delete(messageId);
    const $queryMessage = $("#queryMessage");
    if (status === 200) {
        $queryMessage.html("メッセージを削除しました");
        $queryMessage.css("color", "black");
    } else {
        $queryMessage.html("メッセージを削除できませんでした");
        $queryMessage.css("color", "red");
        console.log("DELETE Failed");
    }
}

export function escapeHTML(str : string): string {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#x27;");
    str = str.replace(/`/g, "&#x60;");
    return str;
}

export async function checkInput(): Promise<void> {
    const message = $("#message").val();
    if (typeof message === "string" && message !== "") {
        $("#send").prop("disabled", false);
        $("#edited").prop("disabled", false);
    } else {
        $("#send").prop("disabled", false);
        $("#edited").prop("disabled", true);
    }
}

function changeTimeFormat(time : Date): string {
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

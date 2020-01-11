import { MessagesHTTPHandler } from "./HTTPHandler";
import { Message } from "../../common/Message";
import { defaultChannel } from "../../common/Channel";
import { escapeHTML, changeTimeFormat, parseMarkdown } from "./utils";

export class MessageManager {
    private _messages: Array<Message>
    private time: number;  // last updated time
    private _channel: string;
    private httpHandler: MessagesHTTPHandler;
    constructor(httpHandler: MessagesHTTPHandler) {
        this.httpHandler = httpHandler;
        this._messages = [];
        this.time = Date.now();
        this._channel = defaultChannel;
    }
    async setChannel(channel: string) {
        if (this._channel === channel) { return; }
        this._channel = channel;
        await this.initialize();
    }
    get channel(): string {
        return this._channel;
    }
    async initialize() {
        try {
            this.messages = await this.httpHandler.getInit(this.channel);
        } catch (err) {
            console.log(err);
        }
    }
    messageTag(message: Message): string {
        const time = new Date(message.time);
        const displayTime = changeTimeFormat(time);
        const messageTag = `\
            <div class="shobo-message-div" data-message-id=${message.id}> \
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
        return messageTag;
    }
    private showAll() {
        const $messageList = $("#messageList");
        $messageList.empty();
        this._messages.forEach((message) => {
            $messageList.prepend(this.messageTag(message));
        });
    }
    async getNew() {
        const messages = await this.httpHandler.getNewer(this._channel, this.time);
        this._messages.unshift(...messages);
        this.updateTime();
        const $messageList = $("#messageList");
        for (const message of messages) {
            $messageList.append(this.messageTag(message));
        }
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }
    private updateTime() {
        if (this._messages.length === 0) {
            this.time = Date.now();
        } else {
            this.time = this._messages[0].time || Date.now();
        }
    }
    async fetch(messageId: string) {
        const message = await this.httpHandler.get(messageId);
        for (let i = 0;i < this._messages.length;i++) {
            if (this._messages[i].id === messageId) {
                this._messages[i].content = message.content;
                $("#messageList").children()
                    .eq(this._messages.length - 1 - i)
                    .replaceWith(this.messageTag(message));
                break;
            }
        }
    }
    async getOld() {
        const messages = await this.httpHandler.getOlder(
            this._channel,
            this._messages[this._messages.length - 1].time, 5);
        this._messages.push(...messages);
        const $shobomain = $("#shobo-main")[0];
        const oldScrollHeight = $shobomain.scrollHeight;
        for (const message of messages) {
            $("#messageList").prepend(this.messageTag(message));
        }
        // keep current position
        $("#shobo-main").scrollTop($shobomain.scrollHeight - oldScrollHeight);
    }
    onDeleteEvent(messageId: string) {
        for (let i = 0;i < this._messages.length;i++) {
            if (this._messages[i].id === messageId) {
                const oldScrollTop = $("#shobo-main")[0].scrollTop;
                $("#messageList").children()
                    .eq(this._messages.length - 1 - i)
                    .remove();
                $("#shobo-main").scrollTop(oldScrollTop);
                break;
            }
        }
        // keep current position
    }
    onChangeUserNameEvent(oldName: string, newName: string) {
        console.log(oldName, newName);
        for (let i = 0;i < this._messages.length;i++) {
            if (this._messages[i].name === oldName) {
                this._messages[i].name = newName;
            }
        }
        this.showAll();
    }
    private set messages(messages: Array<Message>) {
        this._messages = messages;
        this.updateTime();
        this.showAll();
        // goto bottom
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }

    // http wrapper
    async delete(messageId: string): Promise<number> {
        return await this.httpHandler.delete(this._channel, messageId);
    }

    async update(messageId: string, content: string): Promise<number> {
        if (typeof messageId === "string" && content !== "") {
            $("#send").prop("disabled", true);
            $("#message").val("");
            return await this.httpHandler.put(this.channel, messageId, content);
        } else {
            throw new Error("either messageId or content is not string");
        }
    }

    async send(content: string): Promise<number> {
        return await this.httpHandler.post(this._channel, content);
    }
}


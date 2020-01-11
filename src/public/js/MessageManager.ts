import { HTTPHandler } from "./HTTPHandler";
import { Message } from "../../common/Message";
import { defaultChannel } from "../../common/Channel";
import { escapeHTML, changeTimeFormat, parseMarkdown } from "./utils";

export class MessageManager {
    private _messages: Array<Message>
    private time: number;  // last updated time
    private _channel: string;
    private httpHandler: HTTPHandler;
    constructor(httpHandler: HTTPHandler) {
        this.httpHandler = httpHandler;
        this._messages = [];
        this.time = Date.now();
        this._channel = defaultChannel;
    }
    async setChannel(channel: string) {
        this._channel = channel;
        try {
            this.messages = await this.httpHandler.getInit(this.channel);
        } catch (err) {
            console.log(err);
        }
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
    showAll() {
        const $messageList = $("#messageList");
        $messageList.empty();
        this._messages.forEach((message) => {
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
            $messageList.prepend(messageTag);
        });
    }
    async getNew() {
        const messages = await this.httpHandler.getNewer(this._channel, this.time);
        this._messages.unshift(...messages);
        this.updateTime();
        this.showAll();
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }
    updateTime() {
        if (this._messages.length === 0) {
            this.time = Date.now();
        } else {
            this.time = this._messages[0].time || Date.now();
        }
    }
    async fetch(messageId: string) {
        const message = await this.httpHandler.get(messageId);
        for (let m of this._messages) {
            if (m.id === messageId) {
                m.content = message.content;
            }
        }
        this.showAll();
    }
    async getOld() {
        const messages = await this.httpHandler.getOlder(
            this._channel,
            this._messages[this._messages.length - 1].time, 5);
        this._messages.push(...messages);
        const $shobomain = $("#shobo-main")[0];
        const oldScrollHeight = $shobomain.scrollHeight;
        this.showAll();
        // keep current position
        $("#shobo-main").scrollTop($shobomain.scrollHeight - oldScrollHeight);
    }
    onDeleteEvent(messageId: string) {
        this._messages = this._messages.filter(m => m.id !== messageId);
        // keep current position
        const oldScrollTop = $("#shobo-main")[0].scrollTop;
        this.showAll();
        $("#shobo-main").scrollTop(oldScrollTop);
    }
    onChangeUserNameEvent(oldName: string, newName: string) {
        for (let m of this._messages) {
            if (m.name === oldName) {
                m.name = newName;
            }
        }
    }
    set messages(messages: Array<Message>) {
        this._messages = messages;
        this.updateTime();
        this.showAll();
        // goto bottom
        $("#shobo-main").scrollTop($("#shobo-main")[0].scrollHeight);
    }
    async delete(messageId: string) {
        const queryMessageDuration = 3000;
        const status = await this.httpHandler.delete(this._channel, messageId);
        const $queryMessage = $("#queryMessage");
        if (status === 200) {
            $queryMessage
                .css("color", "black")
                .html("メッセージを削除しました")
                .fadeIn("fast")
                .delay(queryMessageDuration)
                .fadeOut("fast");
        } else {
            $queryMessage
                .css("color", "red")
                .html("メッセージを削除できませんでした")
                .fadeIn("fast")
                .delay(queryMessageDuration)
                .fadeOut("fast");
            console.log("DELETE Failed");
        }
    }

    async update() {
        const queryMessageDuration = 3000;
        const message = $("#message").val();
        const messageId = $("#input-area").data("message-id");
        if (typeof message === "string" && message !== "") {
            try {
                const status = await this.httpHandler.put(this._channel, messageId, message);
                const $queryMessage = $("#queryMessage");
                if (status === 200) {
                    $queryMessage
                        .css("color", "black")
                        .html("メッセージを更新しました")
                        .fadeIn("fast")
                        .delay(queryMessageDuration)
                        .fadeOut("fast");
                } else {
                    $queryMessage
                        .css("color", "red")
                        .html("メッセージを更新できませんでした")
                        .fadeIn("fast")
                        .delay(queryMessageDuration)
                        .fadeOut("fast");
                    console.log("POST Failed");
                }
                $("#send").prop("disabled", true);
            } catch (err) {
                console.log(err);
            }
        }
        $("#message").val("");
    }

    async send() {
        const queryMessageDuration = 3000;
        const message = $("#message").val();
        if (typeof message === "string" && message !== "") {
            try {
                const status = await this.httpHandler.post(this._channel, message);
                const $queryMessage = $("#queryMessage");
                if (status === 200) {
                    $queryMessage
                        .css("color", "black")
                        .html("メッセージを送信しました")
                        .fadeIn("fast")
                        .delay(queryMessageDuration)
                        .fadeOut("fast");
                    $("#shobo-main").animate({
                        scrollTop: $("#shobo-main")[0].scrollHeight
                    });
                } else {
                    $queryMessage
                        .css("color", "red")
                        .html("メッセージを送信できませんでした")
                        .fadeIn("fast")
                        .delay(queryMessageDuration)
                        .fadeOut("fast");
                    console.log("POST Failed");
                }
                $("#send").prop("disabled", true);
            } catch (err) {
                console.log(err);
            }
        }
        $("#message").val("");

    }
}


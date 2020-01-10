import { HTTPHandler } from "./HTTPHandler";

const StateList = ["normal", "edit", "hidden"] as const;
type State = typeof StateList[number];
export class StateManager {
    private _state: State = "normal"
    private httpHandler: HTTPHandler;
    constructor(httpHandler: HTTPHandler) {
        this.httpHandler = httpHandler;
        this.normal();
    }
    set state(state: State) {
        this._state = state;
        for (const state of StateList) {
            if (state !== this._state) {
                $(`.shobo-${state}-mode`).hide();
            }
        }
        $(`.shobo-${this.state}-mode`).show();
    }
    get state() {
        return this._state;
    }
    normal() {
        this.state = "normal";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
        $("#message").val("");
    }
    async edit(messageId: string) {
        this.state = "edit";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
        try {
            $("#message").val();
            const msg = await this.httpHandler.get(messageId);
            $("#message").val(msg.content);
            $("#input-area").data("message-id", messageId);
        } catch (err) {
            console.log(err);
        }
    }
    hidden() {
        this.state = "hidden";
        document.documentElement.style.setProperty(
            "--input-area-height", `${$("#input-area").outerHeight()}px`
        );
    }
}

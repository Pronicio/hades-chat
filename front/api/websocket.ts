import { pack } from 'msgpackr';

export class WS {
    private ws: WebSocket;

    constructor() {
        this.ws = new WebSocket("ws://127.0.0.1:9000/ws");

        this.ws.addEventListener("open", (event) => {
            this.init()
        });

        this.ws.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });

        this.ws.addEventListener("error", (event) => {
            console.log("WebSocket error: ", event);
        });

        this.ws.addEventListener("close", (event) => {
            console.log("The connection has been closed successfully.");
        });
    }

    init() {
        this.ws.send(pack({
            action: "init",
            data: {
                username: localStorage.getItem("username"),
                publicKey: localStorage.getItem("public")
            }
        }));
    }

    sendData(message: string, who: string) {
        this.ws.send(pack({
            action: "message",
            data: {
                who: who,
                message: message
            }
        }));
    }
}

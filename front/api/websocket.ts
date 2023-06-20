import { pack } from 'msgpackr';

export class WS {
    public ws: WebSocket;

    constructor() {
        this.ws = new WebSocket("wss://hades-chat-v2.onrender.com/ws");

        this.ws.addEventListener("open", (event) => {
            this.init()
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

    sendMessageData(message: string, who: string) {
        this.ws.send(pack({
            action: "message",
            data: {
                who: who,
                message: message
            }
        }));
    }

    askFriend(username: string) {
        this.ws.send(pack({
            action: "askFriend",
            data: {
                who: username
            }
        }));
    }

    acceptFriend(username: string) {
        this.ws.send(pack({
            action: "askFriendResult",
            data: {
                who: username
            }
        }));
    }
}

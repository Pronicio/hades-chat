const {WebSocket, WebSocketServer} = require('ws');

const {join} = require("path");
const Redis = require("./redis/main");
const dotenv = require('dotenv').config().parsed;

class Class {
    constructor() {
        this.server = new WebSocketServer({
            port: process.env.PORT
        })

        this.db = new Redis();

        this.server.on('listening', () => {
            console.log(`Server listening to ws://127.0.0.1:${this.server.options.port}`);
        })

        this.server.on('connection', (socket, req) => {
            socket.id = this.getUniqueID();

            const file = require(join(__dirname, "./events", 'message'));
            socket.on('message', (message) => file(message, socket));

            socket.on('close', (client) => this.userDisconnected(client, socket))
            socket.on('error', (client) => this.userDisconnected(client, socket))
        })

        this.sendToEveryone = this.sendToEveryone.bind(this)
    }

    sendToEveryone(msg, id) {
        this.server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.id !== id) {
                client.send(msg);
            }
        });
    }

    async userDisconnected(client, socket) {
        const usersConnected = await this.db.usersConnected()
        let user = usersConnected.find(el => {
            let user = JSON.parse(el)
            return user.id === socket.id
        });

        await this.db.leaveUser(user)
        user = JSON.parse(user)

        console.log(`❌ Client ${user.username} disconnect`)

        this.sendToEveryone(JSON.stringify({
            action: "leaveUser",
            username: user.username,
            msg: `<-- ${user.username} leave the chat !`
        }))
    }

    getUniqueID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4();
    };
}

module.exports = new Class();

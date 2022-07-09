import { WebSocket, WebSocketServer } from 'ws';
import { messageEvent } from './events/message.js'

import { randomUUID } from 'crypto';
import Redis from "./redis/main.js";
import dotenv from 'dotenv/config';

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
            socket.id = randomUUID();

            socket.on('message', (message) => messageEvent(message, socket));
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

        this.sendToEveryone(JSON.stringify({
            action: "leaveUser",
            username: user.username,
            msg: `<-- ${user.username} leave the chat !`
        }))
    }
}

export const { db, sendToEveryone } = new Class()

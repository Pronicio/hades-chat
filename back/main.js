import Fastify from 'fastify'
import CORS from '@fastify/cors'
import multipart from '@fastify/multipart'

import { WebSocket, WebSocketServer } from 'ws';
import { messageEvent } from './events/message.js'

import Redis from "./redis/main.js";
import dotenv from 'dotenv/config';
import api from "./routes/api.js";

import { lookup } from 'dns'
import { hostname } from 'os'

class Class {
    constructor() {
        this.fastify = Fastify({ logger: false })

        this.server = new WebSocketServer({
            port: process.env.PORT
        })

        this.db = new Redis();

        this.server.on('listening', () => {
            const serverPort = this.server.options.port

            lookup(hostname(), function (err, add, fam) {
                console.log(`Server listening to ws://${add}:${serverPort}`);
            })
        })

        this.server.on('connection', (socket, req) => {
            socket.on('message', (message) => messageEvent(message, socket));
            socket.on('close', (client) => this.userDisconnected(client, socket))
            socket.on('error', (client) => this.userDisconnected(client, socket))
            socket.on('wsClientError', (error, client) => this.userDisconnected(client, socket))
        })

        this.sendToEveryone = this.sendToEveryone.bind(this)
        this.sendToSomeone = this.sendToSomeone.bind(this)

        this.fastify.register(CORS, {
            origin: "*",
            methods: [ 'GET', 'POST' ],
            credentials: true
        });

        this.fastify.register(multipart)

        this.fastify.register(api)

        this.fastify.listen({ port: process.env.API_PORT, host: "0.0.0.0" }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Fastify is on : ${address}`)
        })
    }

    sendToEveryone(msg, id, userMessage) {
        this.server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.id !== id) {
                if (userMessage) {
                    client.send(JSON.stringify({
                        from: "global",
                        msg
                    }));
                } else {
                    client.send(msg);
                }
            }
        });
    }

    async sendToSomeone(msg, id, socketId) {
        this.server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.id === id) {
                client.send(JSON.stringify({
                    from: socketId,
                    msg
                }));
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

        try {
            user = JSON.parse(user)
        } catch (e) {
            console.error(e)
        }

        if (!user) return false

        this.sendToEveryone(JSON.stringify({
            action: "leaveUser",
            username: user.username,
            msg: `<-- ${user.username} leave the chat !`
        }))
    }
}

export const { db, sendToEveryone, sendToSomeone } = new Class()

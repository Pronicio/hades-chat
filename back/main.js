import Fastify from 'fastify'
import ws from '@fastify/websocket'
import CORS from '@fastify/cors'
import multipart from '@fastify/multipart'

import { messageEvent } from './events/message.js'

import Redis from "./redis/main.js";
import dotenv from 'dotenv/config';
import api from "./routes/api.js";

import { lookup } from 'dns'
import { hostname } from 'os'

class Class {
    constructor() {
        this.fastify = Fastify({ logger: false })

        this.db = new Redis();

        this.sendToEveryone = this.sendToEveryone.bind(this)
        this.sendToSomeone = this.sendToSomeone.bind(this)

        this.fastify.register(CORS, {
            origin: "*",
            methods: [ 'GET', 'POST' ],
            credentials: true
        });

        this.fastify.register(multipart)
        this.fastify.register(api)

        this.fastify.register(ws)
        this.fastify.register(async (fastify) => {
            fastify.get('/ws', { websocket: true }, (connection, req) => {
                connection.socket.on('message', (message) => messageEvent(message, connection.socket));
                connection.socket.on('close', (client) => this.userDisconnected(client, connection.socket))
                connection.socket.on('error', (client) => this.userDisconnected(client, connection.socket))
                connection.socket.on('wsClientError', (error, client) => this.userDisconnected(client, connection.socket))
            })
        })

        this.fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }

            lookup(hostname(), function (err, add, fam) {
                console.log(`Server listening to http://${add}:${process.env.PORT}`);
            })
        })
    }

    sendToEveryone(msg, id, userMessage) {
        this.fastify.websocketServer.clients.forEach(function each(client) {
            if (client.readyState === 1 && client.id !== id) {
                if (userMessage) {
                    client.send(JSON.stringify({
                        action: "from",
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
        this.fastify.websocketServer.clients.forEach(function each(client) {
            if (client.readyState === 1 && client.id === id) {
                client.send(JSON.stringify({
                    action: "from",
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
    }
}

export const { db, sendToEveryone, sendToSomeone } = new Class()

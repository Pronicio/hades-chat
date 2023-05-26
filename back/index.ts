import { fastify, FastifyInstance, FastifyRequest } from 'fastify'
import ws, { SocketStream } from '@fastify/websocket'
import jwt from '@fastify/jwt'

import { pack } from "msgpackr";
import Redis from "ioredis";
import { consola } from "consola";
import * as dotenv from 'dotenv'

dotenv.config()

import { messageEvent } from "./events/messageEvent";
import { connected, error, ready } from "./events/redisEvents";
import { WebSocketExtended } from "./utils/types";

class Main {
    private server: FastifyInstance<any>;
    public redis: Redis;

    constructor() {
        this.server = fastify({ logger: false });
        this.redis = new Redis(process.env.REDIS_URI as string);

        this.server.register(ws, {
            options: {
                maxPayload: 1048576,
            }
        });

        this.server.register(jwt, {
            secret: process.env.SUPER_TOKEN as string,
            sign: {
                expiresIn: process.env.TOKEN_EXPIRE as string
            }
        })

        this.server.register(async (fastify: FastifyInstance) => {
            fastify.get('/ws', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
                connection.socket.on('message', (message: Buffer) => messageEvent(message, connection.socket, fastify));
                connection.socket.on('close', (client: number) => this.userDisconnected(client, connection.socket))
                connection.socket.on('error', (error: Error, client: number) => {
                    this.userDisconnected(client, connection.socket)
                    consola.error(error)
                })
                connection.socket.on('wsClientError', (client: number) => this.userDisconnected(client, connection.socket))
            })
        })

        this.redis.on("connect", connected)
        this.redis.on("ready", ready)
        this.redis.on("error", error)

        this.sendToSomeone = this.sendToSomeone.bind(this)

        this.launch()
    }

    async userDisconnected(client: number, socket: WebSocketExtended): Promise<void> {
        await this.redis.del(socket.username)
    }

    async sendToSomeone(data: any, username: string) {
        this.server.websocketServer.clients.forEach((client: any) => {
            if (client.readyState === 1 && client.username === username) {
                client.send(pack(data));
            }
        });
    }

    launch(): void {
        this.server.listen({ port: 9000, host: "0.0.0.0" }, (err, address): void => {
            if (err) {
                consola.error(err)
                process.exit(1)
            }

            consola.success(`Server listening at ${address}`);
        })
    }
}

export const { redis, sendToSomeone } = new Main();

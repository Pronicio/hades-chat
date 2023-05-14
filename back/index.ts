import { fastify, FastifyInstance, FastifyRequest } from 'fastify'
import ws, { SocketStream } from '@fastify/websocket'

import { consola } from "consola";
import { messageEvent } from "./events/messageEvent";

class Main {
    private server: FastifyInstance<any>;

    constructor() {
        this.server = fastify({ logger: false });

        this.server.register(ws, {
            options: {
                maxPayload: 1048576,
            }
        });

        this.server.register(async (fastify) => {
            fastify.get('/ws', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
                connection.socket.on('message', (message: Buffer) => messageEvent(message, connection.socket));
                connection.socket.on('close', (client: number) => this.userDisconnected(client))
                connection.socket.on('error', (error: Error, client: number) => {
                    this.userDisconnected(client)
                    consola.error(error)
                })
                connection.socket.on('wsClientError', (client: number) => this.userDisconnected(client))
            })
        })

        this.launch()
    }

    async userDisconnected(client: number) {
        consola.log(client)
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

new Main();

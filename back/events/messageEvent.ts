import { pack, unpack } from 'msgpackr';
import { consola } from "consola";
import { redis, sendToSomeone } from "../index";

import { WebSocketExtended } from '../utils/types'
import { FastifyInstance } from "fastify";

export async function messageEvent(message: Buffer, socket: WebSocketExtended, fastify: FastifyInstance) {

    try {
        const data = unpack(message)

        if (data.action === "init") {
            const userExist = await redis.get(data.data.username)

            if (!userExist) {
                socket.username = data.data.username;

                await redis.set(data.data.username, pack({
                    publicKey: data.data.publicKey
                }))

                const token = fastify.jwt.sign({
                    username: socket.username
                })

                return socket.send(pack({
                    action: "init",
                    token: token,
                    success: true,
                }))
            } else {
                socket.send(pack({
                    action: "init", success: false,
                }))
            }
        }

        if (data.action === "restore") {
            //TODO: Restore.
        }

        if (data.action === "askFriend") {
            const who = data.data.who
            const userExist = await redis.get(who)

            if (!userExist) {
                return socket.send(pack({
                    action: "askFriendResult",
                    who: who,
                    success: false,
                }))
            }

            await sendToSomeone({
                action: "askFriendRequest",
                who: socket.username
            }, who)
        }

        if (data.action === "askFriendResult") {
            const who = data.data.who
            const result = await redis.getBuffer(socket.username)

            if (result) {
                const user = unpack(result)

                await sendToSomeone({
                    action: "askFriendResult",
                    who: socket.username,
                    publicKey: user.publicKey,
                    success: true
                }, who)
            }
        }

        if (data.data.message && !((/^\s+$/g).test(data.data.message))) {
            /*
                const result = await redis.getBuffer(socket.username)
                if (result) console.log(unpack(result));
             */

            socket.send(pack(data))
        }
    } catch (e) {
        consola.error(e)
    }
}

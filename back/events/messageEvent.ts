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

                return socket.send(pack({
                    action: "init", success: true,
                }))
            } else {
                socket.send(pack({
                    action: "init", success: false,
                }))
            }
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
            const receiver = await redis.getBuffer(socket.username)
            const sender = await redis.getBuffer(who)

            if (receiver && sender) {
                const userReceiver = unpack(receiver)
                const userSender = unpack(sender)

                await sendToSomeone({
                    action: "askFriendResult",
                    who: socket.username,
                    publicKey: userReceiver.publicKey,
                    success: true
                }, who)

                await sendToSomeone({
                    action: "askFriendResultForReceiver",
                    who: who,
                    publicKey: userSender.publicKey,
                    success: true
                }, socket.username)
            }
        }

        if (data.data.message && !((/^\s+$/g).test(data.data.message))) {
            await sendToSomeone({
                action: "message",
                who: socket.username,
                message: data.data.message
            }, data.data.who)
        }
    } catch (e) {
        consola.error(e)
    }
}

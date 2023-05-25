import { pack, unpack } from 'msgpackr';
import { consola } from "consola";
import { redis } from "../index";

import { WebSocketExtended } from '../utils/types'

export async function messageEvent(message: Buffer, socket: WebSocketExtended) {

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

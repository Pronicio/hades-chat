import { pack, unpack } from 'msgpackr';
import { consola } from "consola";
import { redis } from "../index";

export async function messageEvent(message: Buffer, socket: WebSocket) {

    try {
        const data = unpack(message)

        if (data.action === "init") {
            return redis.set(data.data.username, pack({
                ...data.data
            }))
        }

        if (data.data.message && !((/^\s+$/g).test(data.data.message))) {
            const result = await redis.getBuffer("Pronicio")
            if (result) console.log(unpack(result));

            socket.send(pack(data))
        }
    } catch (e) {
        consola.error(e)
    }
}

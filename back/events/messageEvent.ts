import { pack, unpack } from 'msgpackr';
import { consola } from "consola";

export async function messageEvent(message: Buffer, socket: WebSocket) {

    try {
        const data = unpack(message)

        if (data.data.message && !((/^\s+$/g).test(data.data.message))) {
            socket.send(pack(data))
        }
    } catch (e) {
        consola.error(e)
    }
}

import { unpack } from 'msgpackr';
import { consola } from "consola";

export async function messageEvent(message: Buffer, socket: WebSocket) {

    try {
        const data = unpack(message)
        console.log(data);

        socket.send(JSON.stringify(data))
    } catch (e) {
        consola.error(e)
    }
}

import { db, sendToEveryone, sendToSomeone } from "../main.js";
import { isUUID, chatbot } from "../utils/methods.js";
import { randomUUID } from 'crypto';

async function messageEvent(message, socket) {
    const data = JSON.parse(message)

    if (data.id && isUUID(data.id)) {
        socket.id = data.id
    } else {
        socket.id = randomUUID();

        socket.send(JSON.stringify({
            action: "newId",
            id: socket.id
        }))
    }

    if (data.action === "new") {

        await db.newUser({
            username: data.username,
            id: socket.id
        })

        sendToEveryone(JSON.stringify({
            action: "newUser",
            username: data.username,
            msg: `--> ${data.username} join the chat !`
        }))

    } else if (data.action === "msg") {
        if (data.to === 'global') return sendToEveryone(`${data.username}: ${data.msg}`, socket.id);
        if (data.to === 'chatbot') socket.send(await chatbot(data.msg, socket.id))
        await sendToSomeone(data.msg, data.to)
    }
}

export { messageEvent }

import { db, sendToEveryone, sendToSomeone } from "../main.js";
import { isUUID, chatbot } from "../utils/methods.js";

import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken'

async function messageEvent(message, socket) {
    const data = JSON.parse(message)

    const decoded = jwt.decode(data.token, process.env.TOKEN)

    if (data.id && isUUID(data.id) && decoded) {
        if (decoded.id !== data.id) return
        socket.id = data.id;
        socket.token = data.token;
    } else {
        socket.id = randomUUID();

        const token = jwt.sign({ id: socket.id }, process.env.TOKEN, {
            expiresIn: "7d"
        })

        socket.send(JSON.stringify({
            action: "newId",
            id: socket.id,
            token: token
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

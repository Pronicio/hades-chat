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
            expiresIn: process.env.EXP_TIME
        })

        socket.send(JSON.stringify({
            action: "newId",
            id: socket.id,
            token: token
        }))
    }

    if (data.action === "new") {

        if (!data.username.match('#\\d{4}')) {
            setNewName(data.username)
        } else {
            const usersConnected = await db.usersConnected()
            let tagAlreadyExist = usersConnected.find(el => {
                let user = JSON.parse(el)
                return user.username === data.username
            });
            if (tagAlreadyExist) {
                let tag = data.username.match('#\\d{4}', '')[0]
                let without = data.username.replace(tag, '')

                setNewName(without)
            }
        }

        function setNewName(name) {
            const discriminator = Math.floor(1000 + Math.random() * 9000);

            data.username = `${name}#${discriminator}`

            socket.send(JSON.stringify({
                action: "newName",
                name: data.username
            }))
        }

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
        if (data.to === 'global') return sendToEveryone(`${data.username}: ${data.msg}`, socket.id, true);
        if (data.to === 'chatbot') socket.send(await chatbot(data.msg, socket.id))
        await sendToSomeone(data.msg, data.to, socket.id)
    }
}

export { messageEvent }

import { db, sendToEveryone } from "../main.js";

async function messageEvent(message, socket) {
    const data = JSON.parse(message)

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
        sendToEveryone(`${data.username}: ${data.msg}`, socket.id)
    }
}

export { messageEvent }

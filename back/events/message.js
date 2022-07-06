const {db, sendToEveryone} = require("../main");

module.exports = async function (message, socket) {
    const data = JSON.parse(message)

    if (data.action === "new") {
        console.log(`✔ New Connection! Client Username: ${data.username}`)

        await db.newUser({
            username: data.username,
            id: socket.id
        })

        sendToEveryone(`--> ${data.username} join the chat !`)
        sendToEveryone(JSON.stringify({
            action: "newUser",
            username: data.username
        }))

        const usersConnected = await db.usersConnected()
        const list = usersConnected.map((i) => {
            let user = JSON.parse(i)
            return user.username;
        });

        socket.send(JSON.stringify({
            action: "usersConnected",
            list
        }))
    } else if (data.action === "msg") {
        sendToEveryone(`${data.username}: ${data.msg}`)
    }
}

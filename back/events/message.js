const {db, sendToEveryone} = require("../main");

module.exports = async function (message, socket) {
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
        sendToEveryone(`${data.username}: ${data.msg}`, socket.id)
    }
}

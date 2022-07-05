const {sendToEveryone} = require("../utils/methods");

module.exports = function (message, socket) {
    const data = JSON.parse(message)

    if (data.action === "new") {
        console.log(`✔ New Connection! Client Username: ${data.username}`)

        clients.push({
            username: data.username,
            socket
        })

        sendToEveryone(`--> ${data.username} join the chat !`)
        sendToEveryone(JSON.stringify({
            action: "newUser",
            username: data.username
        }))

        const usersConnected = clients.map((i) => {
            return i.username;
        });

        socket.send(JSON.stringify({
            action: "usersConnected",
            usersConnected
        }))
    } else if (data.action === "msg") {
        sendToEveryone(`${data.username}: ${data.msg}`)
    }
}

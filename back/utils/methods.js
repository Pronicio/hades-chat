const server = require("../main");

module.exports = {
    userDisconnected: function(client) {
        const user = clients.find(el => {
            return el.socket._closeCode === client
        });

        console.log(`❌ Client ${user.username} disconnect`)
        clients.splice(clients.indexOf(user), 1)

        this.sendToEveryone(`<-- ${user.username} leave the chat !`)
        this.sendToEveryone(JSON.stringify({
            action: "leaveUser",
            username: user.username
        }))
    },

    sendToEveryone: function(msg) {
        server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }
}

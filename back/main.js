const {WebSocket, WebSocketServer} = require('ws')

const {readdirSync} = require('fs');
const {join} = require("path");
const dotenv = require('dotenv').config().parsed;

const server = new WebSocketServer({
    port: process.env.PORT
})

let clients = []

server.on('listening', () => {
    console.log(`Server listening to ws://127.0.0.1:${server.options.port}`);
})

server.on('connection', (socket, req) => {

    socket.on('message', (message) => {
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
    })

    socket.on('close', userDisconnected)
    socket.on('error', userDisconnected)

    function userDisconnected(client) {
        const user = clients.find(el => {
            return el.socket._closeCode === client
        });

        console.log(`❌ Client ${user.username} disconnect`)
        clients.splice(clients.indexOf(user), 1)

        sendToEveryone(`<-- ${user.username} leave the chat !`)
        sendToEveryone(JSON.stringify({
            action: "leaveUser",
            username: user.username
        }))
    }

    function sendToEveryone(msg) {
        server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }
})

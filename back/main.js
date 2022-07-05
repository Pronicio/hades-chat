const {WebSocket, WebSocketServer} = require('ws');
const {userDisconnected} = require("./utils/methods");

const {readdirSync} = require('fs');
const {join} = require("path");
const dotenv = require('dotenv').config().parsed;

const server = new WebSocketServer({
    port: process.env.PORT
})

const Redis = require('./redis/main')
const db = new Redis();

db.test()

server.on('listening', () => {
    console.log(`Server listening to ws://127.0.0.1:${server.options.port}`);
})

server.on('connection', (socket, req) => {

    const file = require(join(__dirname, "./events", 'message'));
    socket.on('message', (message) => file(message, socket, server));

    socket.on('close', (client) => userDisconnected(client))
    socket.on('error', (client) => userDisconnected(client))
})

module.exports = server;

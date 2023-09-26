const express = require('express')
const { Server } = require('socket.io')
const bodyParser = require("body-parser")
const io = new Server({ cors: true })

const app = express()

app.use(bodyParser.json())

const emailToSocketMapping = new Map()

io.on('connection', (socket) => {
    console.log("new Connection");
    socket.on("join_room", (data) => {
        const { room_id, email_id } = data;
        console.log("user joined" + room_id + "with email" + email_id);
        socket.join(room_id)
        emailToSocketMapping.set(email_id, socket.id)
        socket.broadcast.to(room_id).emit("user-joined", { email_id })
    })
})

app.listen(9000, () => {
    console.log("server is running on port 9000");
})
io.listen(9001)
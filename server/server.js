const express = require('express')
const { Server } = require('socket.io')
const bodyParser = require("body-parser")
const io = new Server({ cors: true })

const app = express()

app.use(bodyParser.json())

const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()

io.on('connection', (socket) => {
    console.log("new Connection");
    socket.on("join_room", (data) => {
        const { room_id, email_id } = data;
        console.log("user joined" + room_id + "with email" + email_id);
        socket.join(room_id)
        emailToSocketMapping.set(email_id, socket.id)
        socketToEmailMapping.set(socket.id, email_id)

        socket.emit("joined_room", { room_id })
        socket.broadcast.to(room_id).emit("user_joined", { email_id })
    })
    socket.on("call_user", data => {
        const { email_id, offer } = data
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(email_id)

        console.log(fromEmail, "fromEmail");
        socket.to(socketId).emit("incomming_call", { fromEmail, offer })
    })

    socket.on('call_accepted', ({ email_id, ans }) => {
        console.log("on server call Accepted recived send to", email_id);
        const socketId = emailToSocketMapping.get(email_id)
        socket.to(socketId).emit("call_accepted", { ans })
    })
})

app.listen(9000, () => {
    console.log("server is running on port 9000");
})
io.listen(9001)
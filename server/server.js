const express = require('express')

const bodyParser = require("body-parser")
const app = express()

const server = app.listen(process.env.PORT || 8000)
var io = require('socket.io')(server);

app.use(bodyParser.json())

const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()


io.on('connection', (socket) => {

    socket.on("join_room", (data) => {

        const { room_id, email_id } = data;
        console.log("userjoin", email_id);

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

    // **Add ICE Candidate Exchange Handling Here**
    socket.on('ice_candidate', ({ email_id, candidate }) => {
        console.log('ICE candidate received from:', socket.id, 'for:', email_id);
        const socketId = emailToSocketMapping.get(email_id);
        if (socketId) {
            socket.to(socketId).emit('ice_candidate', { candidate });
            console.log('ICE candidate sent to:', email_id);
        }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        const email_id = socketToEmailMapping.get(socket.id);
        console.log('Client disconnected:', socket.id, 'Email:', email_id);

        emailToSocketMapping.delete(email_id);
        socketToEmailMapping.delete(socket.id);
    });
})



// app.listen(PORT, () => {
//     console.log("server is running on port 9000");
// })
// io.listen(9001, () => {
//     console.log("server is running on port 9001")
// })
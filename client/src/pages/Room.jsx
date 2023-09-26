import React, { useEffect } from 'react'
import { useSocket } from '../context/socketContext'


function Room() {
    const { socket } = useSocket()


    const handleNewUserJoin = (email_id) => {

        console.log("newUser join room " + email_id);
    }

    useEffect(() => {
        socket.on('user_joined', handleNewUserJoin)
    }, [socket])

    return (
        <div>Room</div>
    )
}

export default Room
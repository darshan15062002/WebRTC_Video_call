import React from 'react'
import { useSocket } from '../context/socketContext'

function Home() {
    const { socket } = useSocket()


    const handleClick = () => {
        socket.emit("join_room", { room_id: "1", email_id: 'example@gmail.com' })
    }
    return (
        <form style={{ display: 'flex', flexDirection: 'column', width: "300px" }}>
            <label>email</label>
            <input type="email" name="" id="" />
            <label>code</label>
            <input type="text" name="" id="" />
            <button type="button" onClick={handleClick}>enter Room</button>
        </form>
    )
}

export default Home
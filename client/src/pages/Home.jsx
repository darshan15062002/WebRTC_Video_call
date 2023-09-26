import React, { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/socketContext'
import { useNavigate } from 'react-router-dom'

function Home() {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')


    const handleRoomJoined = useCallback(({ room_id }) => {
        navigate(`/room/${room_id}`)

    }, [navigate])

    useEffect(() => {
        socket.on("joined_room", handleRoomJoined)

        return () => socket.off("joined_room", handleRoomJoined)

    }, [handleRoomJoined, socket])


    const handleClick = (e) => {
        e.preventDefault();

        socket.emit("join_room", { room_id: code, email_id: email })
    }
    return (
        <form style={{ display: 'flex', flexDirection: 'column', width: "300px" }}>
            <label>email</label>
            <input type="email" name="" id="" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>code</label>
            <input type="text" name="" id="" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" onClick={handleClick}>enter Room</button>
        </form>
    )
}

export default Home
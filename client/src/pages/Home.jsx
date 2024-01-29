import React, { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/socketContext'
import { useNavigate } from 'react-router-dom'

function Home() {
    const { socket } = useSocket()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')


    const handleRoomJoined = useCallback(({ room_id }) => {
        console.log("Joined room", room_id);
        navigate(`/room/${room_id}`)
    }, [navigate])

    useEffect(() => {
        socket.on("joined_room", handleRoomJoined)
        return () => socket.off("joined_room", handleRoomJoined)

    }, [handleRoomJoined, socket])


    const handleClick = (e) => {
        e.preventDefault();
        if (code && email) {
            socket.emit("join_room", { room_id: code, email_id: email })
        } else {
            alert("please enter details")
        }


    }
    return (
        <div className="home_container">

            <form className='form_container'>

                <label>Name</label>
                <input
                    type="email" name="" id="" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Code</label>
                <input type="text" name="" id="" value={code} onChange={(e) => setCode(e.target.value)} />
                <button type="button" onClick={handleClick}>Join</button>
            </form>
        </div>
    )
}

export default Home
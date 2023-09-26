import React, { useCallback, useEffect } from 'react'
import { useSocket } from '../context/socketContext'
import { usePeer } from '../context/webRtcContext'


function Room() {
    const { socket } = useSocket()
    const { peer, createOffer, createAns, setRemote } = usePeer()

    const handleNewUserJoin = useCallback(async ({ email_id }) => {

        console.log("newUser join room " + email_id);
        const offer = await createOffer()
        socket.emit("call_user", { email_id, offer })
    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async ({ from, offer }) => {
        console.log("incomming call" + from);
        const ans = await createAns(offer)
        socket.emit("call_accepted", { email_id: from, ans })
    }, [])

    const handleCallAccepted = useCallback(async ({ ans }) => {
        await setRemote(ans)
    }, [])


    useEffect(() => {
        socket.on('user_joined', handleNewUserJoin)
        socket.on('incomming_call', handleIncommingCall)
        socket.on('call_accepted', handleCallAccepted)


        return () => {
            socket.off('user_joined', handleNewUserJoin)
            socket.off('incomming_call', handleIncommingCall)
        }
    }, [handleNewUserJoin, handleNewUserJoin, socket])

    return (
        <div>Room</div>
    )
}

export default Room
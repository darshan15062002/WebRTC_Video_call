import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketContext'
import { usePeer } from '../context/webRtcContext'
import ReactPlayer from 'react-player'

function Room() {
    const { socket } = useSocket()

    const [myStream, setMyStream] = useState()
    const { peer, createOffer, createAns, setRemoteAns, sendStream, remoteStrem } = usePeer()

    const handleNewUserJoin = useCallback(async ({ email_id }) => {

        console.log("newUser join room " + email_id);
        const offer = await createOffer()
        console.log("offer is creted", offer);
        socket.emit("call_user", { email_id, offer })
    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async (data) => {
        const { fromEmail, offer } = data
        console.log({ fromEmail, offer });
        console.log("incomming call" + fromEmail);
        const ans = await createAns(offer)
        console.log("ans is creted", ans);
        socket.emit("call_accepted", { email_id: fromEmail, ans })
    }, [createAns, socket])

    const handleCallAccepted = useCallback(async ({ ans }) => {
        console.log("call got accepted", ans);
        await setRemoteAns(ans)
    }, [setRemoteAns])


    useEffect(() => {
        socket.on('user_joined', handleNewUserJoin)
        socket.on('incomming_call', handleIncommingCall)
        socket.on('call_accepted', handleCallAccepted)


        return () => {
            socket.off('user_joined', handleNewUserJoin)
            socket.off('incomming_call', handleIncommingCall)
            socket.off('call_accepted', handleCallAccepted)
        }
    }, [handleNewUserJoin, handleIncommingCall, handleCallAccepted, socket])


    const getUserMediaStrem = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        sendStream(stream)
        setMyStream(stream)
    }, [sendStream])


    useEffect(() => {
        getUserMediaStrem()

    }, [getUserMediaStrem])


    return (
        <div>
            <ReactPlayer url={myStream} playing={true} />
            {remoteStrem && <ReactPlayer url={remoteStrem} playing={true} />}
        </div>
    )
}

export default Room
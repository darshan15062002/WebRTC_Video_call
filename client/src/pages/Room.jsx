import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketContext'
import { usePeer } from '../context/webRtcContext'
import ReactPlayer from 'react-player'

function Room() {
    const { socket } = useSocket()

    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()
    const { peer, createOffer, createAns, setRemoteAns, sendStream, remoteStrem } = usePeer()

    const handleNewUserJoin = useCallback(async ({ email_id }) => {

        console.log("newUser join room " + email_id);
        const offer = await createOffer()
        console.log("offer is creted", offer);
        socket.emit("call_user", { email_id, offer })
        setRemoteEmailId(email_id)
    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async (data) => {
        const { fromEmail, offer } = data
        const ans = await createAns(offer)
        console.log("ans is creted", ans);
        socket.emit("call_accepted", { email_id: fromEmail, ans })
        setRemoteEmailId(fromEmail)
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
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
            stream => setMyStream(stream),
            err => console.log(err)

        );


    }, [])

    const handleNegotiation = useCallback(() => {
        const localoffer = peer.localDescription
        socket.emit("call_user", { email_id: remoteEmailId, offer: localoffer })
    }, [peer.localDescription, remoteEmailId, socket])


    useEffect(() => {
        getUserMediaStrem()
    }, [getUserMediaStrem])

    useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegotiation)

        return () => {

            peer.removeEventListener("negotiationneeded", handleNegotiation)
        }
    }, [peer, handleNegotiation])

    return (
        <div >
            <h1>You are connected to {remoteEmailId}</h1>
            {console.log(myStream, "mystrem")}
            <ReactPlayer url={myStream} playing={true} />
            {console.log(remoteStrem, "remoteStrem")}
            {remoteStrem && <ReactPlayer url={remoteStrem} playing={true} />}
            <button onClick={() => sendStream(myStream)}>click</button>

        </div>
    )
}

export default Room
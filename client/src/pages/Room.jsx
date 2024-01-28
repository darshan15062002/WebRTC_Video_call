import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketContext'
import { usePeer } from '../context/webRtcContext'
import ReactPlayer from 'react-player'

function Room() {
    const { socket } = useSocket()

    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()
    const { peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream } = usePeer()

    const handleNewUserJoin = useCallback(async ({ email_id }) => {


        const offer = await createOffer()

        socket.emit("call_user", { email_id, offer })
        setRemoteEmailId(email_id)
    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async (data) => {
        const { fromEmail, offer } = data
        const ans = await createAns(offer)

        socket.emit("call_accepted", { email_id: fromEmail, ans })
        setRemoteEmailId(fromEmail)
    }, [createAns, socket])

    const handleCallAccepted = useCallback(async ({ ans }) => {

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
        try {
            const localOffer = peer.localDescription;
            console.log("negotiation needed", localOffer);
            socket.emit("call_user", { email_id: remoteEmailId, offer: localOffer });
        } catch (error) {
            console.error("Error during negotiation:", error);
            // Handle error appropriately
        }
    }, [peer.localDescription, remoteEmailId, socket]);


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
        <div className='container' >
            <h1>You are connected to {remoteEmailId}</h1>
            <div className="new">

                <ReactPlayer className="myStream" url={myStream} playing={true} volume={0} />

                {remoteStream && <ReactPlayer className='remoteStream' url={remoteStream} playing={true} />}
                {!remoteStream && <button onClick={() => sendStream(myStream)}>click</button>}
            </div>
        </div>
    )
}

export default Room
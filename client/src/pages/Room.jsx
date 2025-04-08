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

    useEffect(() => {
        myStream && sendStream(myStream)
    }, [myStream])

    const handleNegotiation = useCallback(async () => {
        try {
            const localOffer = await createOffer()
            console.log("negotiation needed", localOffer);
            socket.emit("call_user", { email_id: remoteEmailId, offer: localOffer });
        } catch (error) {
            console.error("Error during negotiation:", error);
            // Handle error appropriately
        }
    }, [peer.localDescription, createOffer, remoteEmailId, socket]);




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
        <div style={{
            position: 'relative',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#000',
            overflow: 'hidden',
        }}>

            {/* Remote Video Full Screen */}
            {remoteStream ? (
                <ReactPlayer
                    url={remoteStream}
                    playing
                    controls={false}
                    muted={false}
                    width="100%"
                    height="100%"
                    style={{
                        objectFit: 'cover',
                        backgroundColor: '#111',
                    }}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'gray',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                }}>
                    Waiting for remote stream...
                </div>
            )}


            <div style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: '200px',
                height: '150px',
                border: '2px solid white',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000',
                zIndex: 10,
            }}>
                <ReactPlayer
                    url={myStream}
                    playing
                    muted
                    controls={false}
                    width="100%"
                    height="100%"
                />
            </div>


            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                zIndex: 10,
            }}>
                You are connected to {remoteEmailId}
            </div>

        </div>
    )
}

export default Room
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
        <div className='container' >
            <h1>You are connected to {remoteEmailId}</h1>
            <div className="new">
                <div className="video_container" style={{ position: 'relative' }}>
                    <ReactPlayer className="myStream" height={"100%"} width={"100%"} url={myStream} playing={true} volume={0} />
                    <button style={{ border: '1px solid black', background: 'white', position: 'absolute', bottom: "30px", padding: "5px", right: '30px' }} onClick={() => {
                        sendStream(myStream)
                        alert("Done")
                    }}>Send</button>
                </div>

                {console.log("here is remoteStream", remoteStream)}

                {remoteStream ? <div className="video_container" style={{ position: 'relative' }}> <ReactPlayer height={"100%"} width={"100%"} className='remoteStream' url={remoteStream} playing={true} /></div> : <div
                    style={{ height: "100%", width: '50%', background: 'gray', borderRadius: "20px" }}></div>}

            </div>
        </div >
    )
}

export default Room
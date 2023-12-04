
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const usePeer = () => useContext(webRtcContext)


export const webRtcContext = createContext(null)



export const WebRtcProvider = ({ children }) => {
    const [remoteStrem, setRemoteStream] = useState(null)

    const peer = useMemo(
        () =>
            new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            "stun:global.stun.twilio.com:3478",
                        ]

                    }
                ]
            }), []
    )

    const createOffer = async () => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }
    const createAns = async (offer) => {
        await peer?.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }

    const setRemoteAns = async (ans) => {
        await peer.setRemoteDescription(ans)
    }

    const sendStream = async (stream) => {
        console.log(stream.getTracks(), "my Stream");
        const tracks = stream?.getTracks();  // Use getTracks() instead of getTrack()
        for (const track of tracks) {
            peer.addTrack(track, stream);
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        console.log("remote track event", ev);
        const streams = ev.streams
        setRemoteStream(streams[0])
    }, [])


    useEffect(() => {
        peer.addEventListener("track", handleTrackEvent)
        return () => {
            peer.removeEventListener('track', handleTrackEvent)

        }
    }, [peer, handleTrackEvent])

    return (
        < webRtcContext.Provider value={{ peer, createOffer, createAns, setRemoteAns, sendStream, remoteStrem }}>
            {children}
        </webRtcContext.Provider>
    )
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'


export const usePeer = () => useContext(webRtcContext)


export const webRtcContext = createContext(null)



export const WebRtcProvider = ({ children }) => {
    const [remoteStream, setRemoteStream] = useState(null)
    const peer = useMemo(
        () =>
            new RTCPeerConnection(
                // {
                //     iceServers: [
                //         {
                //             urls: [
                //                 'stun:stun.l.google.com:19302',
                //                 "stun:global.stun.twilio.com:3478",
                //             ]

                //         }
                //     ]
                // }
            ), []
    )

    const createOffer = async () => {
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            console.log("offer send to peer");
            return offer;
        } catch (error) {
            console.error("Error creating offer:", error);
            // Handle error appropriately
        }
    }
    const createAns = async (offer) => {
        try {
            console.log("offer recived to peer", offer);
            await peer.setRemoteDescription(offer)
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)
            console.log("answer send to peer");
            return answer
        } catch (error) {
            console.error("Error creating ans:", error);
            // Handle error appropriately
        }
    }

    const setRemoteAns = async (ans) => {
        try {
            console.log("answer recived to peer");

            await peer.setRemoteDescription(ans)


        } catch (error) {
            console.error("Error setting setRemoteDescription:", error);
        }
    }

    const sendStream = async (stream) => {
        try {
            console.log(stream.getTracks(), "my Stream");
            const tracks = await stream.getTracks();  // Use getTracks() instead of getTrack()
            for (const track of tracks) {
                peer.addTrack(track, stream);
            }
        } catch (error) {
            console.log("error while send stream", error)
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        try {
            console.log("remote track event", ev);
            const streams = ev.streams
            setRemoteStream(streams[0])
        } catch (error) {
            console.log("error while setting remote stream")
        }

    }, [])

    useEffect(() => {
        try {
            peer.addEventListener("track", handleTrackEvent);
            return () => {
                peer.removeEventListener('track', handleTrackEvent);
            };
        } catch (error) {
            console.error("Error setting up track event listener:", error);
            // Handle error appropriately
        }
    }, [peer, handleTrackEvent]);

    return (
        < webRtcContext.Provider value={{ peer, createOffer, createAns, setRemoteAns, sendStream, remoteStream }}>
            {children}
        </webRtcContext.Provider>
    )
}
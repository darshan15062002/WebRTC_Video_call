
import { createContext, useContext, useMemo } from 'react'


export const usePeer = () => useContext(webRtcContext)


export const webRtcContext = createContext(null)



export const WebRtcProvider = ({ children }) => {
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
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAns()
        await peer.setLocalDescription(answer)
        return answer
    }

    const setRemoteAns = async (ans) => {
        await peer.setRemoteDescription(ans)
    }

    return (
        < webRtcContext.Provider value={{ peer, createOffer, createAns, setRemoteAns }}>
            {children}
        </webRtcContext.Provider>
    )
}
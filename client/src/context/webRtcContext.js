import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const usePeer = () => useContext(webRtcContext);
export const webRtcContext = createContext(null);

export const WebRtcProvider = ({ children }) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const videoSenderRef = useRef(null); // 👈 track video sender

    const peer = useMemo(() => new RTCPeerConnection(), []);

    const createOffer = async () => {
        try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            console.log("offer sent to peer");
            return offer;
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };

    const createAns = async (offer) => {
        try {
            console.log("offer received by peer", offer);
            await peer.setRemoteDescription(offer);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            console.log("answer sent to peer");
            return answer;
        } catch (error) {
            console.error("Error creating answer:", error);
        }
    };

    const setRemoteAns = async (ans) => {
        try {
            console.log("answer received by peer");
            await peer.setRemoteDescription(ans);
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    };

    const sendStream = async (stream) => {
        try {
            console.log(stream.getTracks(), "my Stream");
            const tracks = stream.getTracks();
            console.log(stream.getAudioTracks()); // should show a track
            stream.getTracks().forEach(track => console.log(track.kind)) // should show 'audio'

            for (const track of tracks) {
                const sender = peer.addTrack(track, stream);
                if (track.kind === "video") {
                    videoSenderRef.current = sender;
                }
            }
        } catch (error) {
            console.log("Error while sending stream:", error);
        }
    };

    const replaceVideoTrack = (newVideoTrack) => {
        if (videoSenderRef.current) {
            console.log("Replacing video track...");
            videoSenderRef.current.replaceTrack(newVideoTrack);
        } else {
            console.warn("No video sender available to replace track.");
        }
    };

    const handleTrackEvent = useCallback((ev) => {
        try {
            console.log("remote track event", ev);
            const streams = ev.streams;
            setRemoteStream(streams[0]);
        } catch (error) {
            console.log("Error while setting remote stream");
        }
    }, []);

    useEffect(() => {
        peer.addEventListener("track", handleTrackEvent);
        return () => {
            peer.removeEventListener("track", handleTrackEvent);
        };
    }, [peer, handleTrackEvent]);

    return (
        <webRtcContext.Provider
            value={{
                peer,
                createOffer,
                createAns,
                setRemoteAns,
                sendStream,
                replaceVideoTrack, // 👈 expose this
                remoteStream,
            }}
        >
            {children}
        </webRtcContext.Provider>
    );
};

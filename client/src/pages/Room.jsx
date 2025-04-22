import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketContext'
import { usePeer } from '../context/webRtcContext'
import ReactPlayer from 'react-player'
import { MdCallEnd } from "react-icons/md";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    ScreenShare,
    Phone,
    PhoneOff,
    MessageSquare,
    Users,
    MoreVertical,
    Volume,
    VolumeX
} from "lucide-react";
import WaitingScreen from '../componets/WaitingScreen';
import CallControlButton from '../componets/CallControlButton';
import { useNavigate } from 'react-router-dom';

function Room() {
    const { socket } = useSocket()

    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()
    const { peer, createOffer, createAns, setRemoteAns, replaceVideoTrack, sendStream, remoteStream } = usePeer()
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRemoteAudioMuted, setIsRemoteAudioMuted] = useState(false);
    const handleNewUserJoin = useCallback(async ({ email_id }) => {
        const offer = await createOffer()

        socket.emit("call_user", { email_id, offer })
        setRemoteEmailId(email_id)
    }, [createOffer, socket])
    const navigate = useNavigate()
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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            setMyStream(stream);
        } catch (err) {
            console.error("Error accessing media devices:", err);
            // Show user-friendly error message
            alert("Could not access camera or microphone. Please check permissions.");
        }
    }, []);

    useEffect(() => {
        if (!isScreenSharing) {
            getUserMediaStrem();
        }
    }, [getUserMediaStrem, isScreenSharing]);
    useEffect(() => {
        if (myStream && !isScreenSharing) {
            sendStream(myStream);
        }
    }, [myStream, isScreenSharing, sendStream]);

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
        !isScreenSharing && getUserMediaStrem()
    }, [getUserMediaStrem, isScreenSharing])

    useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegotiation)

        return () => {

            peer.removeEventListener("negotiationneeded", handleNegotiation)
        }
    }, [peer, handleNegotiation])


    const handleToggleMute = () => {
        if (!myStream) return;

        const audioTrack = myStream.getAudioTracks()[0];
        if (audioTrack) {
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            audioTrack.enabled = !newMuteState;
        }
    };
    const handleToggleVideo = () => {
        if (!myStream) return;

        const videoTrack = myStream.getVideoTracks()[0];
        if (videoTrack) {
            const newVideoState = !isVideoOff;
            setIsVideoOff(newVideoState);
            videoTrack.enabled = !newVideoState;
        }
    };


    const handleToggleRemoteAudio = () => {
        if (!remoteStream) return;

        const audioTrack = remoteStream.getAudioTracks()[0];
        if (audioTrack) {
            const newMuteState = !isRemoteAudioMuted;
            setIsRemoteAudioMuted(newMuteState);
            audioTrack.enabled = !newMuteState;
        }
    };

    const handleToggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });
                const screenTrack = screenStream.getVideoTracks()[0];

                if (screenTrack) {
                    // Add audio from current stream if exists
                    if (myStream && myStream.getAudioTracks().length > 0) {
                        screenStream.addTrack(myStream.getAudioTracks()[0]);
                    }

                    replaceVideoTrack(screenTrack);
                    setMyStream(screenStream);
                    setIsScreenSharing(true);

                    // Handle when user stops screen sharing via browser UI
                    screenTrack.onended = async () => {
                        await returnToCamera();
                    };
                }
            } else {
                // Stop screen sharing
                await returnToCamera();
            }
        } catch (err) {
            console.error("Screen share failed:", err);
            alert("Failed to share screen. Please try again.");
        }
    };

    // Helper function to return to camera after screen sharing
    const returnToCamera = async () => {
        try {
            const camStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            const camTrack = camStream.getVideoTracks()[0];

            if (camTrack) {
                replaceVideoTrack(camTrack);
                setMyStream(camStream);
                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error("Error returning to camera:", error);
        }
    };

    const handleEndCall = () => {
        socket.emit("call_ended", { email_id: remoteEmailId })
        myStream.getTracks().forEach(track => track.stop())
        peer.close()
        setMyStream(null)
        setRemoteEmailId(null)
        navigate("/")
    }

    return (
        <div className="video-call-container">

            {/* Remote Video Full Screen */}
            {remoteStream ? (
                <ReactPlayer
                    url={remoteStream}
                    playing
                    inverted={true}
                    controls={false}
                    width="100%"
                    height="80vh"
                    className="remote-video"
                />
            ) : (

                <WaitingScreen />

            )}


            <div className="call-controls-bar">
                <div className="call-controls-container">
                    <CallControlButton
                        onClick={handleToggleMute}
                        Icon={isMuted ? MicOff : Mic}
                        active={!isMuted}
                        className="control-button"
                    />

                    <CallControlButton
                        onClick={handleToggleVideo}
                        Icon={isVideoOff ? VideoOff : Video}
                        active={!isVideoOff}
                        className="control-button"
                    />

                    <CallControlButton
                        onClick={handleToggleScreenShare}
                        Icon={ScreenShare}
                        active={isScreenSharing}
                        className="control-button"
                    />

                    <CallControlButton
                        onClick={handleToggleRemoteAudio}
                        Icon={isRemoteAudioMuted ? VolumeX : Volume}
                        active={!isRemoteAudioMuted}
                        className="control-button"
                    />

                    {/* End Call Button - Always Red */}
                    <CallControlButton
                        onClick={handleEndCall}
                        Icon={PhoneOff}
                        className="end-call-button"
                    />

                    <CallControlButton
                        // onClick={handleChat}
                        Icon={MessageSquare}
                        className="control-button"
                    />

                    <CallControlButton
                        // onClick={handleParticipants}
                        Icon={Users}
                        className="control-button participants-button"
                    />

                    <CallControlButton
                        // onClick={handleMore}
                        Icon={MoreVertical}
                        className="control-button"
                    />
                </div>
            </div>


            <div className="self-view-container">
                {myStream && !isVideoOff ? (
                    <ReactPlayer
                        url={myStream}
                        playing
                        muted
                        controls={false}
                        width="100%"
                        height="100%"
                        className="self-video"
                    />
                ) : (
                    <div className="self-view-placeholder">
                        <div className="self-avatar">
                            <span>YOU</span>
                        </div>
                    </div>
                )}
                <div className="self-view-status">
                    {isVideoOff ? "Camera Off" : "You"}
                    {isMuted && <MicOff className="status-icon" size={12} />}
                </div>
            </div>


            <div className="call-info-banner">
                <div className="connection-indicator"></div>
                <span>Connected with <strong>{remoteEmailId}</strong></span>
            </div>


        </div>

    )
}

export default Room
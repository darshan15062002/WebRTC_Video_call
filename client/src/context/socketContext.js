import { createContext, useContext, useMemo } from "react";
import { io } from 'socket.io-client'



const socketContext = createContext()




export const useSocket = () => {
    return useContext(socketContext)
}

// https://ice-server-socket.onrender.com

const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io("https://webrtc-video-call-ti87.onrender.com"), [])
    // const socket = useMemo(() => io("http://localhost:8000"), [])
    return (
        <socketContext.Provider value={{ socket }}>
            {children}
        </socketContext.Provider>
    )
}

export default SocketProvider
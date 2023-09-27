import { createContext, useContext, useMemo } from "react";
import { io } from 'socket.io-client'



const socketContext = createContext()




export const useSocket = () => {
    return useContext(socketContext)
}



const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io("http://localhost:9001"), [])
    return (
        <socketContext.Provider value={{ socket }}>
            {children}
        </socketContext.Provider>
    )
}

export default SocketProvider
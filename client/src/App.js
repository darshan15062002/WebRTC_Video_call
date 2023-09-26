
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SocketProvider from './context/socketContext';
import Room from './pages/Room';
import { WebRtcProvider } from './context/webRtcContext';




function App() {
  return (
    <div className="App">
      <WebRtcProvider>
        <SocketProvider>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/room/:roomid' element={<Room />}></Route>
          </Routes>
        </SocketProvider>
      </WebRtcProvider>

    </div>
  );
}

export default App;

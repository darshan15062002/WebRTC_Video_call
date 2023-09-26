
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SocketProvider from './context/socketContext';
import Room from './pages/Room';




function App() {
  return (
    <div className="App">
      <SocketProvider>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/room/:roomid' element={<Room />}></Route>
        </Routes>
      </SocketProvider>

    </div>
  );
}

export default App;

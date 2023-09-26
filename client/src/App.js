
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SocketProvider from './context/socketContext';




function App() {
  return (
    <div className="App">
      <SocketProvider>
        <Routes>
          <Route path='/' element={<Home />}></Route>
        </Routes>
      </SocketProvider>

    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import LoginForm from './pages/LoginForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from './components/Loading';
import Board from './pages/Board';

export default function App() {

    const [loading, setLoading] = useState(false);

  socket.on("connect", () => {
    console.log(socket.connected);
  })

  return (
    <div className="App">
      <LoginForm onSubmit={setLoading}/>
      <Loading isLoading={loading}/>
      <Board/>
    </div>
  );
}

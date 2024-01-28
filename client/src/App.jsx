import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import LoginForm from './pages/LoginForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from './components/Loading';
import Board from './pages/Board';

export default function App() {

    const [loading, setLoading] = useState(false);
	const [displayBoard, setDisplayBoard] = useState(false);
	// const [countdownReady, setCountdownReady] = useState(false);
	// const [counter, setCounter] = useState(0);
	const [cards, setCards] = useState([]);

	const setLoadingFn = (status) => {
		setLoading(status);
	}

	socket.on("room-ready", (countdown) => {
		//displayCountdown(countdown);
		const userInfo = {
			userId: sessionStorage.getItem("userId"),
			roomId: sessionStorage.getItem("roomId"),
		}
		socket.emit("ask-for-memes", userInfo, (res) => {
			assign_meme_cards(res);
			socket.emit("meme-ready", userInfo.roomId);
		});
	})

	const assign_meme_cards = (memesArray) => {
		console.log(memesArray);
		setCards(prevCards => [...prevCards, ...memesArray]);
		setLoading(false);
		setDisplayBoard(true);
	}
	
	
	// const displayCountdown = (countdown) => {
	// 	setCountdownReady(true);
	// 	setCounter(countdown.countdown);
	// }
	
	// const updateCounter = () => {
	// 	if (counter == 0)
	// 	{
	// 		clearInterval(interval);
	// 		setCountdownReady(false);
	// 	}
	// 	else
	// 	setCounter(counter - 1);
	// }
	// const interval = setInterval(updateCounter, 1000);
return (
    <div className="App">
      {loading ? <Loading /> : displayBoard ? <Board cardsArray={cards}/> :  <LoginForm onSubmit={setLoadingFn}/>}
    </div>
  );
}

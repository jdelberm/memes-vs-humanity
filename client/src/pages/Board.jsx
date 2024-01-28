import React from "react";
import CardComponent from "../components/CardComponent";
import '../../styles/Board.css'

function Board({cardsArray}) {
	const flipCard = (clickedItem) => {
		clickedItem.classList.toggle('show-card')

	}
    return (<>
		<div className="board-bg">
		</div>
		<div className="user-cards-container d-flex justify-content-evenly align-items-center">
       		{cardsArray.map(card => (
			<CardComponent imgId={card.id} imgSrc={card.src} key={card.id} onClick={() => flipCard(this)}/>
			))}
		</div>
		</>
    )
}

export default Board;
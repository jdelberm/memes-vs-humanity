import React from 'react';
import '../../styles/CardComponent.css'

function CardComponent({imgSrc, imgId}) {
	return (
		<div className="flip-card">
			<div className="flip-card-inner">
				<div className="flip-card-front">
					<img src="card_bg.png" alt="card_bg" style={{width:"300px", height:"300px"}}/>
				</div>
				<div className="flip-card-back">
                    <img src={imgSrc} alt="Just a funny meme image" id={imgId} className='meme-card'/>
				</div>
			</div>
		</div>
	)
}

export default CardComponent;
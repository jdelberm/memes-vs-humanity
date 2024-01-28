import React from 'react';

function CardComponent({imgSrc, imgId}) {

	return (
		<div class="flip-card">
			<div class="flip-card-inner">
				<div class="flip-card-front">
					<img src="card_bg.png" alt="card_bg" style="width:300px;height:300px;"/>
				</div>
				<div class="flip-card-back">
                    <img src={imgSrc} alt="Just a funny meme image" id={imgId}/>
				</div>
			</div>
		</div>
	)
}

export default CardComponent;
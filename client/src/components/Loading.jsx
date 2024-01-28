import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for the rotation animation
const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled component for the spinner
const Spinner = styled.div`
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${rotateAnimation} 1s linear infinite; /* Apply the rotation animation */
`;

// Container for centering the spinner
const PreloaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Loading = (isLoading) => {
    return (
        isLoading && <>
        <PreloaderContainer>
            <Spinner />
        </PreloaderContainer>
    </>
    )
}

export default Loading;
